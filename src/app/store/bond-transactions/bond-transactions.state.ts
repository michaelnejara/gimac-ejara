import { createFeatureSelector, createSelector } from '@ngrx/store';
import { 
  BondTransaction, 
  TransactionFilterParams,
  TransactionStats
} from '@core/models/bond-transaction.models';

/**
 * Transaction Entity
 */
export interface TransactionEntity {
  data: BondTransaction;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * Bond Transactions State Interface
 */
export interface BondTransactionsState {
  // Entities (normalized by ID)
  entities: Record<number, TransactionEntity>;
  ids: number[];
  
  // Current list view
  currentPageTransactions: BondTransaction[];
  
  // Selection
  selectedId: number | null;
  
  // Filters & Search
  filters: TransactionFilterParams;
  
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
  entities: {},
  ids: [],
  currentPageTransactions: [],
  selectedId: null,
  filters: {
    limit: 20,
    offset: 0
  },
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
 * Entity Selectors
 */
export const selectTransactionEntities = createSelector(
  selectBondTransactionsState,
  (state) => state.entities
);

export const selectTransactionIds = createSelector(
  selectBondTransactionsState,
  (state) => state.ids
);

export const selectAllTransactions = createSelector(
  selectTransactionEntities,
  selectTransactionIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

export const selectCurrentPageTransactions = createSelector(
  selectBondTransactionsState,
  (state) => state.currentPageTransactions
);

/**
 * Single Transaction Selectors
 */
export const selectTransactionById = (transactionId: number) => createSelector(
  selectTransactionEntities,
  (entities) => entities[transactionId]?.data
);

export const selectTransactionEntityById = (transactionId: number) => createSelector(
  selectTransactionEntities,
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
  selectTransactionEntities,
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
 * Filter & Pagination Selectors
 */
export const selectFilters = createSelector(
  selectBondTransactionsState,
  (state) => state.filters
);

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

/**
 * Derived Selectors
 */
export const selectPendingTransactions = createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.status === 'pending')
);

export const selectConfirmedTransactions = createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.status === 'confirmed')
);

export const selectFailedTransactions = createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.status === 'failed')
);

export const selectPurchaseTransactions = createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.type === 'purchase')
);

export const selectWithdrawalTransactions = createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.type === 'withdrawal')
);

export const selectTransactionsByStatus = (status: string) => createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.status === status)
);

export const selectTransactionsByType = (type: string) => createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.type === type)
);

export const selectTransactionsByBond = (bondId: number) => createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.bondId === bondId)
);

export const selectTransactionsByPartner = (partnerId: number) => createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.partnerId === partnerId)
);

export const selectTransactionsByCustomer = (customerId: number) => createSelector(
  selectAllTransactions,
  (transactions) => transactions.filter(t => t.customerId === customerId)
);

export const selectHasFilters = createSelector(
  selectFilters,
  (filters) => !!(
    filters.status || 
    filters.type ||
    filters.bondId ||
    filters.partnerId ||
    filters.customerId ||
    filters.dateFrom ||
    filters.dateTo
  )
);

export const selectTransactionCount = createSelector(
  selectTransactionIds,
  (ids) => ids.length
);