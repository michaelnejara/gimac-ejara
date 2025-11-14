// src/app/store/transactions/transactions.state.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { 
  GimacTransaction, 
  GimacTransactionFilterParams 
} from '@core/models/transaction.models';

/**
 * Transaction State Interface
 */
export interface TransactionsState {
  /** All loaded transactions (cached across pages) */
  transactions: GimacTransaction[];
  
  /** Currently displayed transactions (current page only) */
  currentPageTransactions: GimacTransaction[];
  
  /** Loading state */
  loading: boolean;
  
  /** Error message if any */
  error: string | null;
  
  /** Current filter parameters */
  filters: GimacTransactionFilterParams;
  
  /** Pagination information */
  pagination: {
    currentPageNumber: number;
    totalPages: number;
    previousPageNumber: number;
    nextPageNumber: number;
  } | null;
  
  /** Total count of transactions matching filters */
  totalCount: number;
  
  /** Cache of loaded pages (page number -> transaction IDs) */
  pageCache: Map<number, number[]>;
}

/**
 * Initial State
 */
export const initialState: TransactionsState = {
  transactions: [],
  currentPageTransactions: [],
  loading: false,
  error: null,
  filters: {
    pageNumber: 1,
    limit: 20
  },
  pagination: null,
  totalCount: 0,
  pageCache: new Map()
};

/**
 * Feature Selector
 */
export const selectTransactionsState = createFeatureSelector<TransactionsState>('transactions');

/**
 * Basic Selectors
 */
export const selectAllTransactions = createSelector(
  selectTransactionsState,
  (state) => state.transactions
);

export const selectCurrentPageTransactions = createSelector(
  selectTransactionsState,
  (state) => state.currentPageTransactions
);

export const selectTransactionsLoading = createSelector(
  selectTransactionsState,
  (state) => state.loading
);

export const selectTransactionsError = createSelector(
  selectTransactionsState,
  (state) => state.error
);

export const selectCurrentFilters = createSelector(
  selectTransactionsState,
  (state) => state.filters
);

export const selectTransactionsPagination = createSelector(
  selectTransactionsState,
  (state) => state.pagination
);

export const selectTransactionsTotalCount = createSelector(
  selectTransactionsState,
  (state) => state.totalCount
);

export const selectPageCache = createSelector(
  selectTransactionsState,
  (state) => state.pageCache
);

/**
 * Derived Selectors
 */

/**
 * Select current page size
 */
export const selectCurrentPageSize = createSelector(
  selectCurrentFilters,
  (filters) => filters.limit || 20
);

/**
 * Select current page number
 */
export const selectCurrentPageNumber = createSelector(
  selectCurrentFilters,
  (filters) => filters.pageNumber || 1
);

/**
 * Check if a specific page is cached
 */
export const selectIsPageCached = (pageNumber: number) => createSelector(
  selectPageCache,
  (cache) => cache.has(pageNumber)
);

/**
 * Select transactions for a specific page from cache
 */
export const selectTransactionsByPage = (pageNumber: number) => createSelector(
  selectAllTransactions,
  selectPageCache,
  (transactions, cache) => {
    const transactionIds = cache.get(pageNumber);
    if (!transactionIds) return [];
    
    return transactionIds
      .map(id => transactions.find(t => t.id === id))
      .filter((t): t is GimacTransaction => t !== undefined);
  }
);

/**
 * Select unreconciled transactions count
 */
export const selectUnreconciledCount = createSelector(
  selectAllTransactions,
  (transactions) => 
    transactions.filter(t => {
      const status = typeof t.status === 'object' ? (t.status as any).value : t.status;
      return !t.reconciledAt && status === 'completed';
    }).length
);

/**
 * Select transactions by status
 */
export const selectTransactionsByStatus = (status: string) => createSelector(
  selectAllTransactions,
  (transactions) => 
    transactions.filter(t => {
      const txStatus = typeof t.status === 'object' ? (t.status as any).value : t.status;
      return txStatus === status;
    })
);

/**
 * Check if filters are applied
 */
export const selectHasActiveFilters = createSelector(
  selectCurrentFilters,
  (filters) => {
    return !!(
      filters.status ||
      filters.keyword ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.senderAccountIdentifier ||
      filters.receiverAccountIdentifier
    );
  }
);