// src/app/store/customers/customers.state.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Customer, CustomerDetails, CustomerFilterParams } from '@core/models/customer.models';

/**
 * Customer Entity
 * Stores either basic Customer or full CustomerDetails
 */
export interface CustomerEntity {
  data: Customer | CustomerDetails;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * Customers State Interface
 */
export interface CustomersState {
  // Entities (normalized by ID)
  entities: Record<number, CustomerEntity>;
  ids: number[];
  
  // Current list view
  currentPageCustomers: Customer[];
  
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
}

/**
 * Initial State
 */
export const initialState: CustomersState = {
  entities: {},
  ids: [],
  currentPageCustomers: [],
  selectedId: null,
  filters: {
    limit: 20,
    offset: 0
  },
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null
};

/**
 * Feature Selector
 */
export const selectCustomersState = createFeatureSelector<CustomersState>('customers');

/**
 * Entity Selectors
 */
export const selectCustomerEntities = createSelector(
  selectCustomersState,
  (state) => state.entities
);

export const selectCustomerIds = createSelector(
  selectCustomersState,
  (state) => state.ids
);

export const selectAllCustomers = createSelector(
  selectCustomerEntities,
  selectCustomerIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

export const selectCurrentPageCustomers = createSelector(
  selectCustomersState,
  (state) => state.currentPageCustomers
);

/**
 * Single Customer Selectors
 */
export const selectCustomerById = (customerId: number) => createSelector(
  selectCustomerEntities,
  (entities) => entities[customerId]?.data
);

export const selectCustomerEntityById = (customerId: number) => createSelector(
  selectCustomerEntities,
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
  selectCustomerEntities,
  selectSelectedCustomerId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
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
export const selectCustomersByPartner = (partnerId: number) => createSelector(
  selectAllCustomers,
  (customers) => customers.filter(c => c.partnerId === partnerId)
);

export const selectCustomersByCountry = (countryCode: string) => createSelector(
  selectAllCustomers,
  (customers) => customers.filter(c => c.countryCode === countryCode)
);

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

export const selectCustomerCount = createSelector(
  selectCustomerIds,
  (ids) => ids.length
);