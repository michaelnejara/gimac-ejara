import { createFeatureSelector, createSelector } from '@ngrx/store';
import { 
  BondTransaction, 
  TransactionFilterParams,
  TransactionStats
} from '@core/models/bond-transaction.models';

/**
 * Transaction Entity (for single resource calls)
 */
export interface TransactionEntity {
  data: BondTransaction;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * Page Cache (organized by page number)
 */
export interface PageCache<T> {
  [pageNumber: number]: T[];
}

/**
 * Bond Transactions State Interface
 */
export interface BondTransactionsState {
  // Single Entity Cache (for detail views - getTransactionById)
  singleEntities: Record<number, TransactionEntity>;

  // Page-based Cache (for list views - getTransactions)
  pageCache: PageCache<BondTransaction>;

  // Current active page number
  activePage: number;
  previousPageSize: number;

  // Selection
  selectedId: number | null;

  // Statistics
  stats: TransactionStats | null;
  statsLoading: boolean;

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
export const initialState: BondTransactionsState = {
  singleEntities: {},
  pageCache: {},
  activePage: 1,
  previousPageSize: 20,
  selectedId: null,
  stats: null,
  statsLoading: false,
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null
};

/**
 * Feature Selector
 */
export const selectBondTransactionsState = createFeatureSelector<BondTransactionsState>('bondTransactions');

/**
 * Single Entity Cache Selectors (for detail views)
 */
export const selectSingleEntities = createSelector(
  selectBondTransactionsState,
  (state) => state.singleEntities
);

/**
 * Page Cache Selectors (for list views)
 */
export const selectPageCache = createSelector(
  selectBondTransactionsState,
  (state) => state.pageCache
);

export const selectActivePage = createSelector(
  selectBondTransactionsState,
  (state) => state.activePage
);

export const selectCurrentPageTransactions = createSelector(
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

export const selectIsTransactionCached = (transactionId: number) => createSelector(
  selectSingleEntities,
  (entities) => !!entities[transactionId]
);

/**
 * Single Transaction Selectors (from singleEntities cache)
 */
export const selectTransactionById = (transactionId: number) => createSelector(
  selectSingleEntities,
  (entities) => entities[transactionId]?.data
);

export const selectTransactionEntityById = (transactionId: number) => createSelector(
  selectSingleEntities,
  (entities) => entities[transactionId]
);

export const selectTransactionLoading = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.loading || false
);

export const selectTransactionError = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.error || null
);

/**
 * Selection Selectors
 */
export const selectSelectedTransactionId = createSelector(
  selectBondTransactionsState,
  (state) => state.selectedId
);

export const selectSelectedTransaction = createSelector(
  selectSingleEntities,
  selectSelectedTransactionId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
);

/**
 * Statistics Selectors
 */
export const selectTransactionStats = createSelector(
  selectBondTransactionsState,
  (state) => state.stats
);

export const selectStatsLoading = createSelector(
  selectBondTransactionsState,
  (state) => state.statsLoading
);

/**
 * Pagination Selectors
 */
export const selectTotal = createSelector(
  selectBondTransactionsState,
  (state) => state.total
);

export const selectLimit = createSelector(
  selectBondTransactionsState,
  (state) => state.limit
);

export const selectOffset = createSelector(
  selectBondTransactionsState,
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
  selectBondTransactionsState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectBondTransactionsState,
  (state) => state.error
);

