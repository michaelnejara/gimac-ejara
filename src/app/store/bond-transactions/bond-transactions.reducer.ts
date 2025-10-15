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
    const entities = { ...state.entities };
    const newIds: number[] = [];

    response.data.forEach(transaction => {
      newIds.push(transaction.id);
      entities[transaction.id] = {
        data: transaction,
        loading: false,
        error: null,
        loadedAt: Date.now()
      };
    });

    return {
      ...state,
      entities,
      ids: [...new Set([...state.ids, ...newIds])],
      currentPageTransactions: response.data,
      total: response.total,
      limit: response.limit,
      offset: response.offset,
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
    const entity = state.entities[transactionId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    entities: {
      ...state.entities,
      [transaction.id]: {
        data: transaction,
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    },
    ids: state.ids.includes(transaction.id) ? state.ids : [...state.ids, transaction.id]
  })),

  on(BondTransactionsActions.loadTransactionFailure, (state, { transactionId, error }) => {
    const entity = state.entities[transactionId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    }
  })),

  on(BondTransactionsActions.changePageSize, (state, { limit }) => ({
    ...state,
    filters: {
      ...state.filters,
      limit,
      offset: 0
    }
  })),

  // Selection
  on(BondTransactionsActions.selectTransaction, (state, { transactionId }) => ({
    ...state,
    selectedId: transactionId
  })),

  on(BondTransactionsActions.clearSelection, (state) => ({
    ...state,
    selectedId: null
  })),

  // Change Transaction Status
  on(BondTransactionsActions.changeTransactionStatus, (state, { transactionId }) => {
    const entity = state.entities[transactionId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    const currentPageTransactions = state.currentPageTransactions.map(t => 
      t.id === transaction.id ? transaction : t
    );

    return {
      ...state,
      entities: {
        ...state.entities,
        [transaction.id]: {
          data: transaction,
          loading: false,
          error: null,
          loadedAt: Date.now()
        }
      },
      currentPageTransactions,
      loading: false,
      error: null
    };
  }),

  on(BondTransactionsActions.changeTransactionStatusFailure, (state, { transactionId, error }) => {
    const entity = state.entities[transactionId];
    return {
      ...state,
      entities: {
        ...state.entities,
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