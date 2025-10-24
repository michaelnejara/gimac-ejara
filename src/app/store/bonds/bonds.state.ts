// src/app/store/bonds/bonds.state.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Bond, BondFilterParams, CustomerBondHolding } from '@core/models/bond.models';

/**
 * Bond Entity
 */
export interface BondEntity {
  data: Bond;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * View Mode Type
 */
export type BondViewMode = 'all' | 'partner' | 'customer';

/**
 * Page Cache - Stores paginated data by page number
 */
export interface PageCache<T> {
  [pageNumber: number]: T[];
}

/**
 * Bonds State Interface
 */
export interface BondsState {
  // Single Entity Cache (for detail views)
  // Populated when getBondById is called
  singleEntities: Record<number, BondEntity>;

  // Page-based Cache
  // Structure: { 1: [...bonds], 2: [...bonds], ... }
  pageCache: PageCache<Bond>;
  customerBondsPageCache: PageCache<CustomerBondHolding>;
  partnerBondsPageCache: Record<number, PageCache<any>>; // Keyed by partnerId

  // Current active page number
  activePage: number;

  // Selection
  selectedId: number | null;
  selectedIds: number[];

  // Filters & Search
  filters: BondFilterParams;
  previousPageSize: number; // Track page size changes

  // View mode and context
  viewMode: BondViewMode;
  activePartnerId: number | null;

  // Pagination
  total: number;
  limit: number;
  offset: number;

  // UI State
  loading: boolean;
  error: string | null;

  // Operation states
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

/**
 * Initial State
 */
export const initialState: BondsState = {
  // Single entity cache
  singleEntities: {},

  // Page-based cache
  pageCache: {},
  customerBondsPageCache: {},
  partnerBondsPageCache: {},
  activePage: 1,

  selectedId: null,
  selectedIds: [],
  filters: {
    limit: 20,
    offset: 0
  },
  previousPageSize: 20,
  viewMode: 'all',
  activePartnerId: null,
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false
};

/**
 * Feature Selector
 */
export const selectBondsState = createFeatureSelector<BondsState>('bonds');

/**
 * Current Page Bonds Selector
 */
export const selectCurrentPageBonds = createSelector(
  selectBondsState,
  (state) => {
    // Return bonds from current page cache
    const currentPage = state.activePage;
    return state.pageCache[currentPage] || [];
  }
);

/**
 * Page Cache Selectors
 */
export const selectPageCache = createSelector(
  selectBondsState,
  (state) => state.pageCache
);

export const selectActivePage = createSelector(
  selectBondsState,
  (state) => state.activePage
);

export const selectCurrentPageFromCache = createSelector(
  selectPageCache,
  selectActivePage,
  (cache, activePage) => cache[activePage] || []
);

export const selectIsPageCached = (pageNumber: number) => createSelector(
  selectPageCache,
  (cache) => !!cache[pageNumber]
);

export const selectPreviousPageSize = createSelector(
  selectBondsState,
  (state) => state.previousPageSize
);

/**
 * Single Bond Selectors (from singleEntities cache)
 */
export const selectSingleBondEntities = createSelector(
  selectBondsState,
  (state) => state.singleEntities
);

export const selectBondById = (bondId: number) => createSelector(
  selectSingleBondEntities,
  (entities) => entities[bondId]?.data
);

export const selectBondEntityById = (bondId: number) => createSelector(
  selectSingleBondEntities,
  (entities) => entities[bondId]
);

export const selectBondLoading = (bondId: number) => createSelector(
  selectBondEntityById(bondId),
  (entity) => entity?.loading || false
);

export const selectBondError = (bondId: number) => createSelector(
  selectBondEntityById(bondId),
  (entity) => entity?.error || null
);

export const selectIsBondCached = (bondId: number) => createSelector(
  selectSingleBondEntities,
  (entities) => !!entities[bondId]?.data
);

/**
 * Partner Bonds Selectors
 */
export const selectPartnerBondsPageCache = createSelector(
  selectBondsState,
  (state) => state.partnerBondsPageCache
);

export const selectPartnerBonds = createSelector(
  selectBondsState,
  (state) => {
    // Return partner bonds from current page cache for active partner
    const currentPage = state.activePage;
    const partnerId = state.activePartnerId;

    if (!partnerId) {
      return [];
    }

    return state.partnerBondsPageCache[partnerId]?.[currentPage] || [];
  }
);

export const selectPartnerBondsForPartner = (partnerId: number) => createSelector(
  selectBondsState,
  (state) => {
    // Return all partner bonds for a specific partner (all pages)
    const partnerCache = state.partnerBondsPageCache[partnerId];
    if (!partnerCache) {
      return [];
    }

    // Flatten all pages
    return Object.values(partnerCache).flat();
  }
);

/**
 * Customer Bonds Selectors
 */
export const selectCustomerBonds = createSelector(
  selectBondsState,
  (state) => {
    // Return customer bonds from current page cache
    const currentPage = state.activePage;
    return state.customerBondsPageCache[currentPage] || [];
  }
);

export const selectCustomerBondsByPartner = (partnerId: number) => createSelector(
  selectCustomerBonds,
  (bonds) => bonds.filter((b: CustomerBondHolding) => b.partnerId === partnerId)
);

export const selectCustomerBondsByCustomer = (customerId: number) => createSelector(
  selectCustomerBonds,
  (bonds) => bonds.filter((b: CustomerBondHolding) => b.customerId === customerId)
);

/**
 * Selection Selectors
 */
export const selectSelectedBondId = createSelector(
  selectBondsState,
  (state) => state.selectedId
);

export const selectSelectedBond = createSelector(
  selectSingleBondEntities,
  selectSelectedBondId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
);

export const selectSelectedBondIds = createSelector(
  selectBondsState,
  (state) => state.selectedIds
);

export const selectSelectedBonds = createSelector(
  selectSingleBondEntities,
  selectSelectedBondIds,
  (entities, ids) => ids.map((id: number) => entities[id]?.data).filter(Boolean)
);

/**
 * View Mode Selectors
 */
export const selectViewMode = createSelector(
  selectBondsState,
  (state) => state.viewMode
);

export const selectActivePartnerId = createSelector(
  selectBondsState,
  (state) => state.activePartnerId
);

/**
 * Filter & Pagination Selectors
 */
export const selectFilters = createSelector(
  selectBondsState,
  (state) => state.filters
);

export const selectTotal = createSelector(
  selectBondsState,
  (state) => state.total
);

export const selectLimit = createSelector(
  selectBondsState,
  (state) => state.limit
);

export const selectOffset = createSelector(
  selectBondsState,
  (state) => state.offset
);

export const selectPagination = createSelector(
  selectTotal,
  selectLimit,
  selectOffset,
  (total, limit, offset) => ({
    total,
    limit,
    offset,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit)
  })
);

/**
 * UI State Selectors
 */
export const selectLoading = createSelector(
  selectBondsState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectBondsState,
  (state) => state.error
);

export const selectCreating = createSelector(
  selectBondsState,
  (state) => state.creating
);

export const selectUpdating = createSelector(
  selectBondsState,
  (state) => state.updating
);

export const selectDeleting = createSelector(
  selectBondsState,
  (state) => state.deleting
);

/**
 * Derived Selectors (from current page)
 */
export const selectActiveBonds = createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.filter((b: Bond) => b.status === 'active')
);

export const selectInactiveBonds = createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.filter((b: Bond) => b.status === 'inactive')
);

export const selectMaturedBonds = createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.filter((b: Bond) => b.status === 'matured')
);

export const selectBondsByStatus = (status: string) => createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.filter((b: Bond) => b.status === status)
);

export const selectBondsByCurrency = (currency: string) => createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.filter((b: Bond) => b.defaultFiatCurrency === currency)
);

export const selectBondsByIssuer = (issuer: string) => createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.filter((b: Bond) =>
    b.issuerNameEn.toLowerCase().includes(issuer.toLowerCase()) ||
    b.issuerNameFr.toLowerCase().includes(issuer.toLowerCase())
  )
);

export const selectHasFilters = createSelector(
  selectFilters,
  (filters) => !!(
    filters.status ||
    filters.keyword ||
    filters.bondName ||
    filters.bondCode ||
    filters.fiatCurrency ||
    filters.issuer
  )
);

export const selectBondCount = createSelector(
  selectCurrentPageBonds,
  (bonds) => bonds.length
);