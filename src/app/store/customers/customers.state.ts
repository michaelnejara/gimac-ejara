// src/app/store/customers/customers.state.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Customer, CustomerDetails, CustomerFilterParams } from '@core/models/customer.models';

/**
 * Customer Entity
 * Stores either basic Customer or full CustomerDetails for single resource calls
 */
export interface CustomerEntity {
  data: Customer | CustomerDetails;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * Page Cache
 * Stores paginated customers organized by page number
 */
export interface PageCache<T> {
  [pageNumber: number]: T[];
}

/**
 * Customers State Interface
 */
export interface CustomersState {
  // Single Entity Cache (for detail views - getCustomerById)
  singleEntities: Record<number, CustomerEntity>;

  // Page-based Cache (for list views - getCustomers)
  pageCache: PageCache<Customer>;

  // Current active page number
  activePage: number;
  previousPageSize: number; // Track page size changes

  // Selection
  selectedId: number | null;

  // Filters & Search
  filters: CustomerFilterParams;

  // Pagination
  total: number;
  limit: number;
  offset: number;

  // UI State
  loading: boolean;
  error: string | null;

  // Partner Context (for partner-specific customer views)
  currentPartnerId: number | null;
}

/**
 * Initial State
 */
export const initialState: CustomersState = {
  singleEntities: {},
  pageCache: {},
  activePage: 1,
  previousPageSize: 20,
  selectedId: null,
  filters: {
    limit: 20,
    offset: 0
  },
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null,
  currentPartnerId: null
};

/**
 * Feature Selector
 */
export const selectCustomersState = createFeatureSelector<CustomersState>('customers');

/**
 * Single Entity Cache Selectors (for detail views)
 */
export const selectSingleEntities = createSelector(
  selectCustomersState,
  (state) => state.singleEntities
);

/**
 * Page Cache Selectors (for list views)
 */
export const selectPageCache = createSelector(
  selectCustomersState,
  (state) => state.pageCache
);

export const selectActivePage = createSelector(
  selectCustomersState,
  (state) => state.activePage
);

export const selectCurrentPageCustomers = createSelector(
  selectPageCache,
  selectActivePage,
  (cache, activePage) => cache[activePage] || []
);

/**
 * Cache Check Selectors
 */
export const selectIsPageCached = (pageNumber: number) => createSelector(
  selectPageCache,
  (cache) => !!cache[pageNumber]
);

export const selectIsCustomerCached = (customerId: number) => createSelector(
  selectSingleEntities,
  (entities) => !!entities[customerId]
);

/**
 * Single Customer Selectors (from singleEntities cache)
 */
export const selectCustomerById = (customerId: number) => createSelector(
  selectSingleEntities,
  (entities) => entities[customerId]?.data
);

export const selectCustomerEntityById = (customerId: number) => createSelector(
  selectSingleEntities,
  (entities) => entities[customerId]
);

export const selectCustomerLoading = (customerId: number) => createSelector(
  selectCustomerEntityById(customerId),
  (entity) => entity?.loading || false
);

export const selectCustomerError = (customerId: number) => createSelector(
  selectCustomerEntityById(customerId),
  (entity) => entity?.error || null
);

/**
 * Selection Selectors
 */
export const selectSelectedCustomerId = createSelector(
  selectCustomersState,
  (state) => state.selectedId
);

export const selectSelectedCustomer = createSelector(
  selectSingleEntities,
  selectSelectedCustomerId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
);

/**
 * Partner Context Selector
 */
export const selectCurrentPartnerId = createSelector(
  selectCustomersState,
  (state) => state.currentPartnerId
);

/**
 * Filter & Pagination Selectors
 */
export const selectFilters = createSelector(
  selectCustomersState,
  (state) => state.filters
);

export const selectTotal = createSelector(
  selectCustomersState,
  (state) => state.total
);

export const selectLimit = createSelector(
  selectCustomersState,
  (state) => state.limit
);

export const selectOffset = createSelector(
  selectCustomersState,
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
  selectCustomersState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectCustomersState,
  (state) => state.error
);

/**
 * Derived Selectors
 */
export const selectHasFilters = createSelector(
  selectFilters,
  (filters) => !!(
    filters.partnerId ||
    filters.keyword ||
    filters.customerName ||
    filters.email ||
    filters.phone ||
    filters.countryCode
  )
);