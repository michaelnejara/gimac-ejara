import { createReducer, on } from '@ngrx/store';
import { BondTransactionsActions } from './bond-transactions.actions';
import { initialState } from './bond-transactions.state';

/**
 * Bond Transactions Reducer
 */
export const bondTransactionsReducer = createReducer(
  initialState,

  // Load Transactions List
  on(BondTransactionsActions.loadTransactions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BondTransactionsActions.loadTransactionsSuccess, (state, { response }) => {
    const pageNumber = Math.floor(response.offset / response.limit) + 1;
    const newPageCache = { ...state.pageCache };
    newPageCache[pageNumber] = response.data;

    return {
      ...state,
      pageCache: newPageCache,
      activePage: pageNumber,
      total: response.total,
      limit: response.limit,
      offset: response.offset,
      previousPageSize: response.limit,
      loading: false,
      error: null
    };
  }),

  on(BondTransactionsActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Transaction
  on(BondTransactionsActions.loadTransaction, (state, { transactionId }) => {
    const entity = state.singleEntities[transactionId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: true,
          error: null,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  on(BondTransactionsActions.loadTransactionSuccess, (state, { transaction }) => ({
    ...state,
    singleEntities: {
      ...state.singleEntities,
      [transaction.id]: {
        data: transaction,
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    }
  })),

  on(BondTransactionsActions.loadTransactionFailure, (state, { transactionId, error }) => {
    const entity = state.singleEntities[transactionId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  // Load Statistics
  on(BondTransactionsActions.loadStats, (state) => ({
    ...state,
    statsLoading: true
  })),

  on(BondTransactionsActions.loadStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    statsLoading: false
  })),

  on(BondTransactionsActions.loadStatsFailure, (state) => ({
    ...state,
    statsLoading: false
  })),

  // Filters
  on(BondTransactionsActions.applyFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
      offset: 0
    }
  })),

  on(BondTransactionsActions.clearFilters, (state) => ({
    ...state,
    filters: {
      limit: state.filters.limit,
      offset: 0
    }
  })),

  on(BondTransactionsActions.setDateRange, (state, { dateFrom, dateTo }) => ({
    ...state,
    filters: {
      ...state.filters,
      dateFrom,
      dateTo,
      offset: 0
    }
  })),

  on(BondTransactionsActions.setStatusFilter, (state, { status }) => ({
    ...state,
    filters: {
      ...state.filters,
      status: status as any || undefined,
      offset: 0
    }
  })),

  on(BondTransactionsActions.setTransactionTypeFilter, (state, { transactionType }) => ({
  ...state,
  filters: {
    ...state.filters,
    type: transactionType as any || undefined, // Map transactionType to type in filters
    offset: 0
  }
})),

  on(BondTransactionsActions.setBondFilter, (state, { bondId }) => ({
    ...state,
    filters: {
      ...state.filters,
      bondId: bondId || undefined,
      offset: 0
    }
  })),

  on(BondTransactionsActions.setPartnerFilter, (state, { partnerId }) => ({
    ...state,
    filters: {
      ...state.filters,
      partnerId: partnerId || undefined,
      offset: 0
    }
  })),

  on(BondTransactionsActions.setCustomerFilter, (state, { customerId }) => ({
    ...state,
    filters: {
      ...state.filters,
      customerId: customerId || undefined,
      offset: 0
    }
  })),

  // Pagination
  on(BondTransactionsActions.changePage, (state, { offset }) => ({
    ...state,
    filters: {
      ...state.filters,
      offset
    },
    offset
  })),

  on(BondTransactionsActions.changePageSize, (state, { limit }) => {
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
  on(BondTransactionsActions.selectTransaction, (state, { transactionId }) => ({
    ...state,
    selectedId: transactionId
  })),

  on(BondTransactionsActions.clearSelection, (state) => ({
    ...state,
    selectedId: null
  })),

  // Page Management
  on(BondTransactionsActions.resetToFirstPage, (state) => ({
    ...state,
    filters: {
      ...state.filters,
      offset: 0
    },
    offset: 0,
    activePage: 1
  })),

  // Change Transaction Status
  on(BondTransactionsActions.changeTransactionStatus, (state, { transactionId }) => {
    const entity = state.singleEntities[transactionId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: true,
          error: null,
          loadedAt: entity?.loadedAt || 0
        }
      },
      loading: true,
      error: null
    };
  }),

  on(BondTransactionsActions.changeTransactionStatusSuccess, (state, { transaction }) => {
    // Update the transaction in the current page cache
    const currentPageTransactions = state.pageCache[state.activePage]?.map((t: any) =>
      t.id === transaction.id ? transaction : t
    ) || [];

    const newPageCache = { ...state.pageCache };
    if (currentPageTransactions.length > 0) {
      newPageCache[state.activePage] = currentPageTransactions;
    }

    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [transaction.id]: {
          data: transaction,
          loading: false,
          error: null,
          loadedAt: Date.now()
        }
      },
      pageCache: newPageCache,
      loading: false,
      error: null
    };
  }),

  on(BondTransactionsActions.changeTransactionStatusFailure, (state, { transactionId, error }) => {
    const entity = state.singleEntities[transactionId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error,
          loadedAt: entity?.loadedAt || 0
        }
      },
      loading: false,
      error
    };
  }),

  // UI State
  on(BondTransactionsActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(BondTransactionsActions.clearErrors, (state) => ({
    ...state,
    error: null
  })),

  on(BondTransactionsActions.resetState, () => initialState)
);