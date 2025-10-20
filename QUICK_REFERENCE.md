# Store Refactoring - Quick Reference Guide

## TL;DR

**Use cache-aware actions by default, direct load for fresh data.**

---

## Common Patterns

### 1. List Component

```typescript
export class MyListComponent implements OnInit, OnDestroy {
  private store = inject(Store);

  items$ = this.store.select(selectCurrentPageItems);
  loading$ = this.store.select(selectLoading);

  ngOnInit(): void {
    // ✅ Use cache-aware action
    this.store.dispatch(ItemsActions.checkAndLoadItems({ filters }));
  }

  applyFilters(): void {
    // ✅ Direct load for filter changes (fresh data)
    this.store.dispatch(ItemsActions.loadItems({ filters }));
  }

  ngOnDestroy(): void {
    // ✅ Reset to page 1
    this.store.dispatch(ItemsActions.resetToFirstPage());
  }
}
```

---

### 2. Detail Component

```typescript
export class MyDetailComponent implements OnInit {
  private store = inject(Store);

  itemId!: number;
  item$ = this.store.select(selectItemById(this.itemId));
  loading$ = this.store.select(selectItemLoading(this.itemId));

  ngOnInit(): void {
    this.itemId = +this.route.snapshot.params['id'];

    // ✅ Use cache-aware action
    this.store.dispatch(ItemsActions.checkAndLoadItem({
      itemId: this.itemId
    }));
  }

  afterUpdate(): void {
    // ✅ Force reload after changes
    this.store.dispatch(ItemsActions.checkAndLoadItem({
      itemId: this.itemId,
      forceReload: true
    }));
  }
}
```

---

### 3. Context-Based Views (Like Bonds with Partner/Customer)

```typescript
export class MyListComponent implements OnInit {
  private store = inject(Store);
  context: 'default' | 'special' = 'default';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['specialId']) {
        // ✅ Reset store when entering special context
        this.store.dispatch(ItemsActions.resetForContextView());
        this.context = 'special';
        this.loadItems(); // Will do direct load
      } else {
        this.context = 'default';
        this.loadItems(); // Will use cache
      }
    });
  }

  loadItems(): void {
    if (this.context === 'special') {
      // Direct load (cache already cleared)
      this.store.dispatch(ItemsActions.loadSpecialItems({ filters }));
    } else {
      // Cache-aware load
      this.store.dispatch(ItemsActions.checkAndLoadItems({ filters }));
    }
  }
}
```

---

### 4. Filter Dropdowns

```typescript
export class MyComponent implements OnInit {
  private itemsService = inject(ItemsService);

  // ✅ Direct service call, NOT from store
  filterOptions$: Observable<Item[]>;

  ngOnInit(): void {
    this.filterOptions$ = this.itemsService.getItems({
      limit: 100,
      status: 'active'
    }).pipe(
      map(response => response.data)
    );
  }
}
```

---

## Action Quick Reference

### When to Use Each Action

| Scenario | Action | Reason |
|----------|--------|--------|
| Initial page load | `checkAndLoad*()` | Use cache if available |
| Page navigation | `changePage()` | Triggers cache-aware load |
| Filter applied | `load*()` (direct) | Need fresh filtered data |
| After create/update | `checkAndLoad*({ forceReload: true })` | Bypass stale cache |
| Component destroy | `resetToFirstPage()` | Clean state for next visit |
| Context change | `resetForContextView()` | Fresh data for new context |

---

## Available Actions

### Partners
```typescript
PartnersActions.checkAndLoadPartners({ filters? })        // Cache-aware
PartnersActions.loadPartners({ filters? })               // Direct load
PartnersActions.checkAndLoadPartner({ partnerId, forceReload? })
PartnersActions.loadPartner({ partnerId })
PartnersActions.resetToFirstPage()
PartnersActions.changePage({ offset })
PartnersActions.changePageSize({ limit })
```

### Bonds
```typescript
BondsActions.checkAndLoadBonds({ filters? })             // Cache-aware
BondsActions.loadBonds({ filters? })                    // Direct load
BondsActions.checkAndLoadBond({ bondId, forceReload? })
BondsActions.loadBond({ bondId })
BondsActions.resetToFirstPage()
BondsActions.resetForContextView()                      // Special: context reset
BondsActions.loadPartnerBonds({ filters })
BondsActions.loadCustomerBonds({ filters })
```

---

## Available Selectors

### List Selectors
```typescript
selectCurrentPagePartners           // Current page items (from cache)
selectCurrentPageBonds
selectIsPageCached(pageNumber)     // Check if page cached
selectActivePage                   // Current page number
selectPreviousPageSize             // For size change detection
selectPagination                   // { total, limit, offset, currentPage, totalPages }
```

### Single Entity Selectors
```typescript
selectPartnerById(id)              // Get partner from cache
selectBondById(id)                 // Get bond from cache
selectIsPartnerCached(id)          // Check if partner cached
selectIsBondCached(id)             // Check if bond cached
selectPartnerLoading(id)           // Loading state for partner
selectBondLoading(id)              // Loading state for bond
selectPartnerError(id)             // Error for partner
selectBondError(id)                // Error for bond
```

---

## Decision Tree

### Should I use cache-aware or direct load?

```
┌─ Is this initial page load?
│  └─ YES → Use checkAndLoad*() ✅
│
├─ Did user apply filters?
│  └─ YES → Use load*() (direct) ✅
│
├─ Did data just change (create/update/delete)?
│  └─ YES → Use checkAndLoad*({ forceReload: true }) ✅
│
├─ Is user navigating between pages?
│  └─ YES → Use changePage() (triggers cache-aware) ✅
│
└─ Otherwise → Use checkAndLoad*() ✅
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Load all data into store for dropdowns
```typescript
// BAD
this.store.dispatch(loadPartners({ limit: 1000 }));
this.options$ = this.store.select(selectAllPartners);
```

### ✅ DO: Use service directly
```typescript
// GOOD
this.options$ = this.partnersService.getPartners({ limit: 100 })
  .pipe(map(res => res.data));
```

---

### ❌ DON'T: Forget to reset page on destroy
```typescript
// BAD
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### ✅ DO: Always reset
```typescript
// GOOD
ngOnDestroy(): void {
  this.store.dispatch(PartnersActions.resetToFirstPage());
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

### ❌ DON'T: Use cache-aware for filter changes
```typescript
// BAD - will show stale data
applyFilters(): void {
  this.store.dispatch(checkAndLoadPartners({ filters }));
}
```

### ✅ DO: Direct load for fresh data
```typescript
// GOOD
applyFilters(): void {
  this.store.dispatch(loadPartners({ filters }));
}
```

---

## State Structure Reference

```typescript
interface ModuleState {
  // Single entity cache (for detail views)
  singleEntities: Record<number, EntityWrapper>;

  // Page cache (for list views)
  pageCache: {
    1: [...items],
    2: [...items],
    // ...
  };

  // Metadata
  activePage: number;           // Current page
  previousPageSize: number;     // For change detection

  // Pagination
  total: number;
  limit: number;
  offset: number;

  // UI
  loading: boolean;
  error: string | null;
}

interface EntityWrapper {
  data: Entity;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}
```

---

## Performance Tips

1. **Use cache-aware actions** → ~60-80% fewer API calls
2. **Reset on destroy** → Clean state for next visit
3. **Force reload after updates** → Always fresh data
4. **Service calls for dropdowns** → No store pollution
5. **Context-based resets** → Fresh data per context

---

## Files to Reference

- **[STORE_ARCHITECTURE.md](STORE_ARCHITECTURE.md)** - Complete guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was done
- **[CLAUDE.md](CLAUDE.md)** - Project overview

---

## Getting Help

1. Check [STORE_ARCHITECTURE.md](STORE_ARCHITECTURE.md) for detailed examples
2. Look at existing implementations:
   - [partners-list.ts](src/app/features/partners/pages/partners-list/partners-list.ts)
   - [partner-details.ts](src/app/features/partners/pages/partner-details/partner-details.ts)
   - [bonds-list.component.ts](src/app/features/bonds/pages/bonds-list/bonds-list.component.ts)
3. Review troubleshooting section in STORE_ARCHITECTURE.md

---

## Quick Copy-Paste Templates

### List Component Template
```typescript
export class MyListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  items$ = this.store.select(selectCurrentPageItems);
  loading$ = this.store.select(selectLoading);
  pagination$ = this.store.select(selectPagination);

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.store.dispatch(ItemsActions.checkAndLoadItems({ filters: {...} }));
  }

  applyFilters(): void {
    this.store.dispatch(ItemsActions.loadItems({ filters: {...} }));
  }

  onPageChange(event: TablePageEvent): void {
    if (event.pageSize !== this.currentPageSize) {
      this.store.dispatch(ItemsActions.changePageSize({ limit: event.pageSize }));
    } else {
      this.store.dispatch(ItemsActions.changePage({ offset: event.pageIndex * event.pageSize }));
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(ItemsActions.resetToFirstPage());
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Detail Component Template
```typescript
export class MyDetailComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  itemId!: number;
  item$ = this.store.select(selectItemById(this.itemId));
  loading$ = this.store.select(selectItemLoading(this.itemId));
  error$ = this.store.select(selectItemError(this.itemId));

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.itemId = +params['id'];
      this.loadItem();
    });
  }

  loadItem(): void {
    this.store.dispatch(ItemsActions.checkAndLoadItem({
      itemId: this.itemId
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

**Remember: Cache-aware by default, direct load for fresh data! 🚀**
