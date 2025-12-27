// src/app/store/customers/customers.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { CustomersActions } from './customers.actions';
import { initialState } from './customers.state';

/**
 * Customers Reducer
 */
export const customersReducer = createReducer(
  initialState,

  // Load Customers List
  on(CustomersActions.loadCustomers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomersActions.loadCustomersSuccess, (state, { response }) => {
    const pageNumber = Math.floor(response.meta.offset / response.meta.limit) + 1;
    const newPageCache = { ...state.pageCache };
    newPageCache[pageNumber] = response.data;

    return {
      ...state,
      pageCache: newPageCache,
      activePage: pageNumber,
      total: response.meta.total,
      limit: response.meta.limit,
      offset: response.meta.offset,
      previousPageSize: response.meta.limit,
      loading: false,
      error: null
    };
  }),

  on(CustomersActions.loadCustomersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Customer
  on(CustomersActions.loadCustomer, (state, { customerId }) => {
    const entity = state.singleEntities[customerId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [customerId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: true,
          error: null,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  on(CustomersActions.loadCustomerSuccess, (state, { customer }) => ({
    ...state,
    singleEntities: {
      ...state.singleEntities,
      [customer.id]: {
        data: customer,
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    }
  })),

  on(CustomersActions.loadCustomerFailure, (state, { customerId, error }) => {
    const entity = state.singleEntities[customerId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [customerId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  // Filters
  on(CustomersActions.applyFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
      offset: 0
    }
  })),

  on(CustomersActions.clearFilters, (state) => ({
    ...state,
    filters: {
      limit: state.filters.limit,
      offset: 0,
      // kycStatus: ''
    }
  })),

  on(CustomersActions.setSearchKeyword, (state, { keyword }) => ({
    ...state,
    filters: {
      ...state.filters,
      keyword,
      offset: 0
    }
  })),

  on(CustomersActions.setPartnerFilter, (state, { partnerId }) => ({
    ...state,
    filters: {
      ...state.filters,
      partnerId: partnerId || undefined,
      offset: 0
    }
  })),

  // Pagination
  on(CustomersActions.changePage, (state, { offset }) => ({
    ...state,
    filters: {
      ...state.filters,
      offset
    },
    offset
  })),

  on(CustomersActions.changePageSize, (state, { limit }) => {
    const shouldClearCache = state.previousPageSize !== limit;
    return {
      ...state,
      pageCache: shouldClearCache ? {} : state.pageCache,
      filters: {
        ...state.filters,
        limit,
        offset: 0
      },
      limit,
      offset: 0,
      previousPageSize: limit,
      activePage: 1
    };
  }),

  // Selection
  on(CustomersActions.selectCustomer, (state, { customerId }) => ({
    ...state,
    selectedId: customerId
  })),

  on(CustomersActions.clearSelection, (state) => ({
    ...state,
    selectedId: null
  })),

  // Page Management
  on(CustomersActions.resetToFirstPage, (state) => ({
    ...state,
    filters: {
      ...state.filters,
      offset: 0
    },
    offset: 0,
    activePage: 1
  })),

  on(CustomersActions.resetForPartnerContext, (state, { partnerId }) => ({
    ...initialState,
    currentPartnerId: partnerId,
    filters: {
      ...initialState.filters,
      partnerId: partnerId || undefined
    }
  })),

  // UI State
  on(CustomersActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(CustomersActions.clearErrors, (state) => ({
    ...state,
    error: null
  })),

  on(CustomersActions.resetState, () => initialState)
);