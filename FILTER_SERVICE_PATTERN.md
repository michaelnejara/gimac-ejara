# Filter Service Pattern - Best Practices

## Overview

When components need dropdown data for filters or form inputs, **always load directly from services**, not from the store. This prevents polluting the store's page cache with filter-specific queries and keeps the store focused on the current view state.

---

## ❌ Anti-Pattern: Loading from Store

### The Problem

```typescript
// BAD: Loading all partners into store just for a dropdown
export class CreateTransactionComponent {
  partners$ = this.store.select(selectAllPartners);

  ngOnInit() {
    // Pollutes the partners store with this query
    this.store.dispatch(PartnersActions.loadPartners({
      filters: { limit: 1000, status: 'active' }
    }));
  }
}
```

**Issues:**
- ❌ Pollutes page cache with filter-specific data
- ❌ Mixes concerns (transaction component affecting partners state)
- ❌ Harder to control what data is loaded
- ❌ Can cause unexpected side effects in other components
- ❌ Inefficient if you need different filters than the main list

---

## ✅ Correct Pattern: Loading from Service

### The Solution

```typescript
// GOOD: Direct service call for dropdown data
export class CreateTransactionComponent {
  private partnersService = inject(PartnersService);

  partners$!: Observable<Partner[]>;

  ngOnInit() {
    // Load partners directly from service
    this.partners$ = this.partnersService.getPartners({
      limit: 1000,
      status: 'active'
    }).pipe(
      map(response => response.data)
    );
  }
}
```

**Benefits:**
- ✅ Store remains clean and focused
- ✅ Clear separation of concerns
- ✅ Full control over query parameters
- ✅ No side effects on other components
- ✅ More efficient and predictable

---

## Implementation Examples

### Example 1: Add Partner - Available Bonds Dropdown

**Before (Using Store):**
```typescript
export class AddPartner {
  private store = inject(Store);

  availableBonds$: Observable<Bond[]>;

  constructor() {
    // ❌ Using store selector (now deprecated)
    this.availableBonds$ = this.store.select(selectAllBonds);
  }

  ngOnInit() {
    // ❌ Dispatching to store
    this.store.dispatch(BondsActions.loadBonds({
      filters: { status: 'active' }
    }));
  }
}
```

**After (Using Service):**
```typescript
export class AddPartner {
  private bondsService = inject(BondsService);

  availableBonds$!: Observable<Bond[]>;
  bondsLoading = false;

  ngOnInit() {
    this.loadAvailableBonds();
  }

  /**
   * Load available bonds from service
   * Uses service directly instead of store to avoid polluting page cache
   */
  private loadAvailableBonds(): void {
    this.bondsLoading = true;
    this.availableBonds$ = this.bondsService.getBonds({
      status: 'active',
      limit: 1000 // Load all active bonds for selection
    }).pipe(
      map(response => {
        this.bondsLoading = false;
        return response.bonds;
      }),
      takeUntil(this.destroy$)
    );
  }
}
```

---

### Example 2: Transaction Create - Partners Dropdown

```typescript
export class CreateTransaction implements OnInit {
  private partnersService = inject(PartnersService);
  private destroy$ = new Subject<void>();

  partnerOptions$!: Observable<Partner[]>;
  loadingPartners = false;

  ngOnInit() {
    this.loadPartnerOptions();
  }

  /**
   * Load partner options for dropdown
   */
  private loadPartnerOptions(): void {
    this.loadingPartners = true;
    this.partnerOptions$ = this.partnersService.getPartners({
      status: 'active',
      limit: 500,
      sortBy: 'name',
      sortOrder: 'asc'
    }).pipe(
      map(response => {
        this.loadingPartners = false;
        return response.data;
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Template:**
```html
<mat-form-field>
  <mat-label>Select Partner</mat-label>
  <mat-select formControlName="partnerId">
    <mat-option *ngIf="loadingPartners" disabled>
      Loading partners...
    </mat-option>
    <mat-option
      *ngFor="let partner of partnerOptions$ | async"
      [value]="partner.id">
      {{ partner.name }}
    </mat-option>
  </mat-select>
  <mat-progress-bar
    *ngIf="loadingPartners"
    mode="indeterminate">
  </mat-progress-bar>
</mat-form-field>
```

---

### Example 3: Customer Create - Partners and Bonds Cascading Dropdowns

```typescript
export class CreateCustomer implements OnInit {
  private partnersService = inject(PartnersService);
  private bondsService = inject(BondsService);
  private destroy$ = new Subject<void>();

  partnerOptions$!: Observable<Partner[]>;
  bondOptions$!: Observable<Bond[]>;

  customerForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    this.loadPartnerOptions();
    this.setupBondOptionsOnPartnerChange();
  }

  private loadPartnerOptions(): void {
    this.partnerOptions$ = this.partnersService.getPartners({
      status: 'active',
      limit: 500
    }).pipe(
      map(response => response.data),
      shareReplay(1), // Cache the result
      takeUntil(this.destroy$)
    );
  }

  /**
   * Load bonds when partner is selected
   */
  private setupBondOptionsOnPartnerChange(): void {
    this.customerForm.get('partnerId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(partnerId => {
      if (partnerId) {
        this.loadBondsForPartner(partnerId);
      } else {
        this.bondOptions$ = of([]);
      }
    });
  }

  private loadBondsForPartner(partnerId: number): void {
    // Load only bonds assigned to this partner
    this.bondOptions$ = this.bondsService.getPartnerBonds({
      partnerId,
      status: 'active',
      limit: 100
    }).pipe(
      map(response => response.bonds),
      takeUntil(this.destroy$)
    );
  }
}
```

---

## When to Use Service vs Store

### Use Service For:
- ✅ Dropdown/select options
- ✅ Autocomplete suggestions
- ✅ Filter parameter options
- ✅ Form initial data
- ✅ Any data that doesn't belong to the current page view

### Use Store For:
- ✅ Current page list data
- ✅ Single entity details (when navigating to detail page)
- ✅ Data that needs to be shared across multiple components
- ✅ Data that represents the current application state

---

## Common Patterns

### Pattern 1: Simple Dropdown

```typescript
// Service call for options
options$ = this.service.getItems({ status: 'active' }).pipe(
  map(response => response.data)
);
```

### Pattern 2: Searchable Dropdown with Loading State

```typescript
export class MyComponent {
  searchControl = new FormControl('');
  options$!: Observable<Item[]>;
  loading = false;

  ngOnInit() {
    this.options$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(search => {
        this.loading = true;
        return this.service.getItems({
          keyword: search,
          limit: 50
        }).pipe(
          map(response => {
            this.loading = false;
            return response.data;
          })
        );
      })
    );
  }
}
```

### Pattern 3: Dependent Dropdowns

```typescript
// Parent dropdown
parentOptions$ = this.parentService.getItems().pipe(
  map(r => r.data),
  shareReplay(1)
);

// Child dropdown depends on parent selection
childOptions$ = this.form.get('parentId').valueChanges.pipe(
  switchMap(parentId =>
    this.childService.getItems({ parentId }).pipe(
      map(r => r.data)
    )
  )
);
```

### Pattern 4: Cached Options (Load Once)

```typescript
export class MyComponent {
  private cachedOptions$?: Observable<Item[]>;

  getOptions(): Observable<Item[]> {
    if (!this.cachedOptions$) {
      this.cachedOptions$ = this.service.getItems({
        limit: 1000
      }).pipe(
        map(r => r.data),
        shareReplay(1) // Cache the result
      );
    }
    return this.cachedOptions$;
  }

  ngOnInit() {
    this.options$ = this.getOptions();
  }
}
```

---

## Error Handling

Always handle errors gracefully for dropdown data:

```typescript
options$ = this.service.getItems().pipe(
  map(response => response.data),
  catchError(error => {
    console.error('Failed to load options:', error);
    this.notificationService.error('Failed to load options');
    return of([]); // Return empty array on error
  })
);
```

---

## Performance Tips

### 1. Use `shareReplay(1)` for Expensive Calls

```typescript
// Multiple subscriptions will only make ONE API call
options$ = this.service.getItems().pipe(
  map(r => r.data),
  shareReplay(1) // ✅ Cache the result
);
```

### 2. Unsubscribe on Destroy

```typescript
options$ = this.service.getItems().pipe(
  map(r => r.data),
  takeUntil(this.destroy$) // ✅ Prevent memory leaks
);

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Limit Results

```typescript
// Don't load thousands of items for a dropdown
options$ = this.service.getItems({
  limit: 100, // ✅ Reasonable limit
  status: 'active' // ✅ Filter what you need
}).pipe(
  map(r => r.data)
);
```

---

## Migration Checklist

When migrating a component from store-based to service-based dropdowns:

- [ ] Remove store action imports
- [ ] Remove store selector imports (if no longer needed)
- [ ] Inject the appropriate service
- [ ] Replace `store.dispatch()` calls with direct service calls
- [ ] Replace `store.select()` with service observables
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test the dropdown functionality
- [ ] Clean up unused store code

---

## Summary

**Golden Rule:** If it's for a dropdown, filter, or form input → **Use Service!**

**Benefits:**
- ✅ Cleaner store architecture
- ✅ Better separation of concerns
- ✅ More control over data loading
- ✅ No unintended side effects
- ✅ Easier to test and maintain

**Pattern:**
```typescript
// Always do this for dropdowns/filters
private service = inject(MyService);

options$ = this.service.getItems(filters).pipe(
  map(response => response.data),
  catchError(() => of([])),
  shareReplay(1)
);
```

Apply this pattern consistently across all modules for maintainable, predictable code!
