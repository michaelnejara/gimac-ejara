import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GimacTransaction, GimacTransactionFilterParams, PaginationInfo } from '@core/models/transaction.models';

/**
 * Transaction State Interface
 * 
 * Manages transactions with smart caching:
 * - Stores pages of transactions in a map (pageNumber -> transactions[])
 * - Tracks current filters and pagination
 * - Handles loading and error states
 * - Supports filter-based reinitialization and pagination-based appending
 */
export interface TransactionsState {
  /** Map of page numbers to transaction data for caching */
  transactionPages: Map<number, GimacTransaction[]>;
  
  /** All transactions as flat array (derived from pages) */
  allTransactions: GimacTransaction[];
  
  /** Current active filters */
  currentFilters: GimacTransactionFilterParams;
  
  /** Pagination information */
  pagination: PaginationInfo | null;
  
  /** Total count of transactions matching filters */
  totalCount: number;
  
  /** Count of transactions in current response */
  count: number;
  
  /** Loading state */
  loading: boolean;
  
  /** Error message if any */
  error: string | null;
  
  /** Selected transaction for detail view */
  selectedTransaction: GimacTransaction | null;
  
  /** Indicates if initial load has completed */
  initialized: boolean;
}

/**
 * Initial state for transactions feature
 */
export const initialState: TransactionsState = {
  transactionPages: new Map(),
  allTransactions: [],
  currentFilters: {
    limit: 20,
    pageNumber: 1
  },
  pagination: null,
  totalCount: 0,
  count: 0,
  loading: false,
  error: null,
  selectedTransaction: null,
  initialized: false
};

/**
 * Feature selector for transactions state
 */
export const selectTransactionsState = createFeatureSelector<TransactionsState>('transactions');

/**
 * Selector to get all transactions from pages
 * Flattens the cached pages into a single array
 * 
 * @returns Array of all cached transactions
 */
export const selectAllTransactions = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.allTransactions
);

/**
 * Selector to get current page transactions
 * Returns only transactions for the current page
 * 
 * @returns Array of transactions for current page
 */
export const selectCurrentPageTransactions = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => {
    const currentPage = state.currentFilters.pageNumber || 1;
    return state.transactionPages.get(currentPage) || [];
  }
);

/**
 * Selector to get loading state
 * @returns true if transactions are being fetched
 */
export const selectTransactionsLoading = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.loading
);

/**
 * Selector to get error state
 * @returns Error message or null
 */
export const selectTransactionsError = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.error
);

/**
 * Selector to get pagination info
 * @returns Pagination metadata
 */
export const selectTransactionsPagination = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.pagination
);

/**
 * Selector to get total count
 * @returns Total number of transactions matching filters
 */
export const selectTransactionsTotalCount = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.totalCount
);

/**
 * Selector to get current filters
 * @returns Active filter parameters
 */
export const selectCurrentFilters = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.currentFilters
);

/**
 * Selector to get selected transaction
 * @returns Selected transaction for detail view
 */
export const selectSelectedTransaction = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.selectedTransaction
);

/**
 * Selector to check if initialized
 * @returns true if initial load completed
 */
export const selectTransactionsInitialized = createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.initialized
);

/**
 * Selector to check if a specific page is cached
 * @param pageNumber - Page number to check
 * @returns true if page data exists in cache
 */
export const selectIsPageCached = (pageNumber: number) => createSelector(
  selectTransactionsState,
  (state: TransactionsState) => state.transactionPages.has(pageNumber)
);