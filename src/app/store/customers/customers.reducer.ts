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
    const entities = { ...state.entities };
    const newIds: number[] = [];

    response.data.forEach(customer => {
      newIds.push(customer.id);
      entities[customer.id] = {
        data: customer,
        loading: false,
        error: null,
        loadedAt: Date.now()
      };
    });

    return {
      ...state,
      entities,
      ids: [...new Set([...state.ids, ...newIds])],
      currentPageCustomers: response.data,
      total: response.meta.total,
      limit: response.meta.limit,
      offset: response.meta.offset,
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
    const entity = state.entities[customerId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    entities: {
      ...state.entities,
      [customer.id]: {
        data: customer,
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    },
    ids: state.ids.includes(customer.id) ? state.ids : [...state.ids, customer.id]
  })),

  on(CustomersActions.loadCustomerFailure, (state, { customerId, error }) => {
    const entity = state.entities[customerId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    }
  })),

  on(CustomersActions.changePageSize, (state, { limit }) => ({
    ...state,
    filters: {
      ...state.filters,
      limit,
      offset: 0
    }
  })),

  // Selection
  on(CustomersActions.selectCustomer, (state, { customerId }) => ({
    ...state,
    selectedId: customerId
  })),

  on(CustomersActions.clearSelection, (state) => ({
    ...state,
    selectedId: null
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