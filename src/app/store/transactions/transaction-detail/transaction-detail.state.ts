import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GimacTransaction } from '@core/models/transaction.models';

/**
 * Transaction Detail Entity
 * Wraps transaction with metadata
 */
export interface TransactionEntity {
  /** Transaction data */
  data: GimacTransaction;
  /** Loading state for this specific transaction */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Timestamp when transaction was loaded */
  loadedAt: number;
  /** Whether transaction is currently being refreshed */
  refreshing: boolean;
}

/**
 * Transaction Detail State Interface
 * Uses entity pattern with transactions stored by ID
 */
export interface TransactionDetailState {
  /** Transactions stored by ID (key: transaction ID, value: transaction entity) */
  entities: Record<number, TransactionEntity>;
  
  /** IDs of all loaded transactions */
  ids: number[];
  
  /** Currently selected transaction ID */
  selectedId: number | null;
  
  /** Global loading state */
  loading: boolean;
  
  /** Global error state */
  error: string | null;
}

/**
 * Initial State
 */
export const initialState: TransactionDetailState = {
  entities: {},
  ids: [],
  selectedId: null,
  loading: false,
  error: null
};

/**
 * Feature Selector
 */
export const selectTransactionDetailState = createFeatureSelector<TransactionDetailState>('transactionDetail');

/**
 * Basic Selectors
 */

/**
 * Select all transaction entities
 */
export const selectTransactionEntities = createSelector(
  selectTransactionDetailState,
  (state) => state.entities
);

/**
 * Select all transaction IDs
 */
export const selectTransactionIds = createSelector(
  selectTransactionDetailState,
  (state) => state.ids
);

/**
 * Select currently selected transaction ID
 */
export const selectSelectedTransactionId = createSelector(
  selectTransactionDetailState,
  (state) => state.selectedId
);

/**
 * Select global loading state
 */
export const selectGlobalLoading = createSelector(
  selectTransactionDetailState,
  (state) => state.loading
);

/**
 * Select global error
 */
export const selectGlobalError = createSelector(
  selectTransactionDetailState,
  (state) => state.error
);

/**
 * Parameterized Selectors
 */

/**
 * Select transaction entity by ID
 */
export const selectTransactionEntityById = (transactionId: number) => createSelector(
  selectTransactionEntities,
  (entities) => entities[transactionId]
);

/**
 * Select transaction data by ID
 */
export const selectTransactionById = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.data
);

/**
 * Check if transaction exists in cache
 */
export const selectTransactionExists = (transactionId: number) => createSelector(
  selectTransactionEntities,
  (entities) => !!entities[transactionId]
);

/**
 * Check if transaction is loading
 */
export const selectTransactionLoading = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.loading || false
);

/**
 * Check if transaction is refreshing
 */
export const selectTransactionRefreshing = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.refreshing || false
);

/**
 * Select transaction error by ID
 */
export const selectTransactionError = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.error || null
);

/**
 * Select when transaction was loaded
 */
export const selectTransactionLoadedAt = (transactionId: number) => createSelector(
  selectTransactionEntityById(transactionId),
  (entity) => entity?.loadedAt || null
);

/**
 * Check if transaction is stale (older than 5 minutes)
 */
export const selectIsTransactionStale = (transactionId: number, maxAge: number = 5 * 60 * 1000) => createSelector(
  selectTransactionLoadedAt(transactionId),
  (loadedAt) => {
    if (!loadedAt) return true;
    return Date.now() - loadedAt > maxAge;
  }
);

/**
 * Select currently selected transaction
 */
export const selectSelectedTransaction = createSelector(
  selectTransactionEntities,
  selectSelectedTransactionId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
);

/**
 * Select all transactions as array
 */
export const selectAllTransactionsArray = createSelector(
  selectTransactionEntities,
  selectTransactionIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

/**
 * Select transaction count
 */
export const selectTransactionCount = createSelector(
  selectTransactionIds,
  (ids) => ids.length
);

/**
 * Check if any transaction is loading
 */
export const selectAnyTransactionLoading = createSelector(
  selectTransactionEntities,
  (entities) => Object.values(entities).some(entity => entity.loading)
);