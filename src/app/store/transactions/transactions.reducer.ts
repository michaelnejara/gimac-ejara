import { createReducer, on } from '@ngrx/store';
import { TransactionsActions } from './transactions.actions';
import { initialState } from './transactions.state';

/**
 * Transactions Reducer
 * 
 * Handles state updates for transaction-related actions
 */
export const transactionsReducer = createReducer(
  initialState,

  /**
   * Load Transactions
   * Sets loading state and optionally clears cache
   */
  on(TransactionsActions.loadTransactions, (state, { reinitialize }) => ({
    ...state,
    loading: true,
    error: null,
    // Clear cache if reinitializing (new filters or page size change)
    ...(reinitialize && {
      transactions: [],
      currentPageTransactions: [],
      pageCache: new Map()
    })
  })),

  /**
   * Load Transactions Success
   * Updates state with new transaction data
   * Handles both appending (pagination) and replacing (filtering)
   */
  on(TransactionsActions.loadTransactionsSuccess, (state, { response, pageNumber, append }) => {
    const newTransactions = response.data;
    const newTransactionIds = newTransactions.map(t => t.id);

    // Update page cache
    const updatedCache = new Map(state.pageCache);
    updatedCache.set(pageNumber, newTransactionIds);

    if (append) {
      // Append mode: Add new transactions to existing ones
      const existingIds = new Set(state.transactions.map(t => t.id));
      const transactionsToAdd = newTransactions.filter(t => !existingIds.has(t.id));

      return {
        ...state,
        transactions: [...state.transactions, ...transactionsToAdd],
        currentPageTransactions: newTransactions,
        loading: false,
        error: null,
        pagination: response.page,
        totalCount: response.totalCount,
        pageCache: updatedCache
      };
    } else {
      // Replace mode: Replace all transactions
      return {
        ...state,
        transactions: newTransactions,
        currentPageTransactions: newTransactions,
        loading: false,
        error: null,
        pagination: response.page,
        totalCount: response.totalCount,
        pageCache: updatedCache
      };
    }
  }),

  /**
   * Load Transactions Failure
   * Sets error state
   */
  on(TransactionsActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  /**
   * Apply Filters
   * Updates filter state and resets to page 1
   * Cache will be cleared by subsequent loadTransactions action
   */
  on(TransactionsActions.applyFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...filters,
      pageNumber: 1 // Always reset to page 1 when filters change
    }
  })),

  /**
   * Change Page
   * Updates current page number in filters
   */
  on(TransactionsActions.changePage, (state, { pageNumber }) => ({
    ...state,
    filters: {
      ...state.filters,
      pageNumber
    }
  })),

  /**
   * Change Page Size
   * Updates page size and resets to page 1
   * Cache will be cleared by subsequent loadTransactions action
   */
  on(TransactionsActions.changePageSize, (state, { pageSize }) => ({
    ...state,
    filters: {
      ...state.filters,
      limit: pageSize,
      pageNumber: 1 // Reset to page 1 when page size changes
    }
  })),

  /**
   * Clear Filters
   * Resets filters to initial state
   */
  on(TransactionsActions.clearFilters, (state) => ({
    ...state,
    filters: {
      pageNumber: 1,
      limit: state.filters.limit || 20 // Keep current page size
    }
  })),

  /**
   * Reset State
   * Resets entire state to initial values
   */
  on(TransactionsActions.resetState, () => initialState)
);