import { createReducer, on } from '@ngrx/store';
import { TransactionDetailActions } from './transaction-detail.actions';
import { initialState, TransactionEntity } from './transaction-detail.state';

/**
 * Transaction Detail Reducer
 * 
 * Manages transaction entities in a normalized structure
 */
export const transactionDetailReducer = createReducer(
  initialState,

  /**
   * Load Transaction
   * Sets loading state for specific transaction
   */
  on(TransactionDetailActions.loadTransaction, (state, { transactionId, forceReload }) => {
    const entity = state.entities[transactionId];
    
    // If not force reload and entity exists, don't set loading
    if (!forceReload && entity) {
      return state;
    }

    return {
      ...state,
      loading: true,
      entities: {
        ...state.entities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: true,
          error: null,
          loadedAt: entity?.loadedAt || 0,
          refreshing: false
        }
      },
      // Add ID to list if not present
      ids: state.ids.includes(transactionId) ? state.ids : [...state.ids, transactionId]
    };
  }),

  /**
   * Load Transaction Success
   * Updates entity with transaction data
   */
  on(TransactionDetailActions.loadTransactionSuccess, (state, { transaction }) => {
    const transactionId = transaction.id;
    const existingEntity = state.entities[transactionId];

    return {
      ...state,
      loading: false,
      error: null,
      entities: {
        ...state.entities,
        [transactionId]: {
          data: transaction,
          loading: false,
          error: null,
          loadedAt: Date.now(),
          refreshing: false
        }
      },
      ids: state.ids.includes(transactionId) ? state.ids : [...state.ids, transactionId]
    };
  }),

  /**
   * Load Transaction Failure
   * Sets error state for specific transaction
   */
  on(TransactionDetailActions.loadTransactionFailure, (state, { transactionId, error }) => {
    const entity = state.entities[transactionId];

    return {
      ...state,
      loading: false,
      error,
      entities: {
        ...state.entities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error,
          loadedAt: entity?.loadedAt || 0,
          refreshing: false
        }
      }
    };
  }),

  /**
   * Refresh Transaction
   * Sets refreshing state for specific transaction
   */
  on(TransactionDetailActions.refreshTransaction, (state, { transactionId }) => {
    const entity = state.entities[transactionId];

    return {
      ...state,
      entities: {
        ...state.entities,
        [transactionId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error: null,
          loadedAt: entity?.loadedAt || 0,
          refreshing: true
        }
      }
    };
  }),

  /**
   * Update Transaction
   * Optimistically updates transaction data
   */
  on(TransactionDetailActions.updateTransaction, (state, { transactionId, changes }) => {
    const entity = state.entities[transactionId];
    
    if (!entity) return state;

    return {
      ...state,
      entities: {
        ...state.entities,
        [transactionId]: {
          ...entity,
          data: {
            ...entity.data,
            ...changes
          }
        }
      }
    };
  }),

  /**
   * Remove Transaction
   * Removes transaction from cache
   */
  on(TransactionDetailActions.removeTransaction, (state, { transactionId }) => {
    const { [transactionId]: removed, ...remainingEntities } = state.entities;
    
    return {
      ...state,
      entities: remainingEntities,
      ids: state.ids.filter(id => id !== transactionId),
      selectedId: state.selectedId === transactionId ? null : state.selectedId
    };
  }),

  /**
   * Clear Cache
   * Removes all transactions from cache
   */
  on(TransactionDetailActions.clearCache, () => initialState),

  /**
   * Set Selected Transaction
   * Updates currently selected transaction ID
   */
  on(TransactionDetailActions.setSelectedTransaction, (state, { transactionId }) => ({
    ...state,
    selectedId: transactionId
  }))
);