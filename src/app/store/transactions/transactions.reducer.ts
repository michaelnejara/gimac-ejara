import { createReducer, on } from '@ngrx/store';
import { TransactionsActions } from './transactions.actions';
import { initialState } from './transactions.state';
import { GimacTransaction } from '@core/models/transaction.models';

/**
 * Transactions Reducer
 * 
 * Implements smart caching strategy:
 * - On filter change (except date): Clear cache and fetch fresh
 * - On pagination: Use cache if available, fetch if not
 * - On success: Store in appropriate page cache
 * 
 * Cache Structure:
 * transactionPages: Map<pageNumber, GimacTransaction[]>
 * - Key: page number
 * - Value: array of transactions for that page
 */
export const transactionsReducer = createReducer(
  initialState,
  
  /**
   * Handle Load Transactions
   * Sets loading state and optionally clears cache
   */
  on(TransactionsActions.loadTransactions, (state, { reinitialize }) => {
    // If reinitializing, clear the cache
    if (reinitialize) {
      return {
        ...state,
        transactionPages: new Map(),
        allTransactions: [],
        loading: true,
        error: null
      };
    }
    
    // Otherwise just set loading
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  
  /**
   * Handle Load Transactions Success
   * 
   * Stores transactions in page cache and updates state
   * - If append=true: Add new page to cache
   * - If append=false: Replace cache with new page
   */
  on(TransactionsActions.loadTransactionsSuccess, (state, { response, pageNumber, append }) => {
    // Create new pages map
    const newPages = new Map(state.transactionPages);
    
    // Store the page data
    newPages.set(pageNumber, response.data);
    
    // Flatten all pages into allTransactions array
    const allTransactions: GimacTransaction[] = [];
    Array.from(newPages.keys())
      .sort((a, b) => a - b) // Sort page numbers
      .forEach(page => {
        const pageData = newPages.get(page);
        if (pageData) {
          allTransactions.push(...pageData);
        }
      });
    
    return {
      ...state,
      transactionPages: newPages,
      allTransactions,
      pagination: response.page,
      totalCount: response.totalCount,
      count: response.count,
      loading: false,
      error: null,
      initialized: true
    };
  }),
  
  /**
   * Handle Load Transactions Failure
   * Sets error state and stops loading
   */
  on(TransactionsActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  /**
   * Handle Apply Filters
   * 
   * Updates current filters and determines if cache should be cleared
   * 
   * Cache clearing logic:
   * - If only date filters changed: Keep cache
   * - If any other filter changed: Clear cache (reinitialize)
   */
  on(TransactionsActions.applyFilters, (state, { filters }) => {
    // Check if only date filters changed
    const oldFilters = state.currentFilters;
    const onlyDateChanged = 
      filters.dateFrom !== oldFilters.dateFrom ||
      filters.dateTo !== oldFilters.dateTo;
    
    const otherFiltersChanged = 
      filters.status !== oldFilters.status ||
      filters.gimacSupportedServiceId !== oldFilters.gimacSupportedServiceId ||
      filters.senderAccountIdentifier !== oldFilters.senderAccountIdentifier ||
      filters.receiverAccountIdentifier !== oldFilters.receiverAccountIdentifier ||
      filters.keyword !== oldFilters.keyword;
    
    // If other filters changed, clear cache
    const shouldClearCache = otherFiltersChanged;
    
    return {
      ...state,
      currentFilters: {
        ...filters,
        pageNumber: 1 // Reset to page 1 when filters change
      },
      transactionPages: shouldClearCache ? new Map() : state.transactionPages,
      allTransactions: shouldClearCache ? [] : state.allTransactions,
      loading: false
    };
  }),
  
  /**
   * Handle Change Page
   * Updates current page number in filters
   * Effect will handle fetching if not cached
   */
  on(TransactionsActions.changePage, (state, { pageNumber }) => ({
    ...state,
    currentFilters: {
      ...state.currentFilters,
      pageNumber
    }
  })),
  
  /**
   * Handle Select Transaction
   * Sets the selected transaction for detail view
   */
  on(TransactionsActions.selectTransaction, (state, { transaction }) => ({
    ...state,
    selectedTransaction: transaction
  })),
  
  /**
   * Handle Clear Selected
   * Removes selected transaction
   */
  on(TransactionsActions.clearSelected, (state) => ({
    ...state,
    selectedTransaction: null
  })),
  
  /**
   * Handle Reset State
   * Returns to initial state
   */
  on(TransactionsActions.resetState, () => initialState)
);