import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GimacTransaction } from '@core/models/transaction.models';

/**
 * Transaction Detail Actions
 * 
 * Actions for managing individual transaction details with smart caching:
 * - Load transaction (checks cache first)
 * - Refresh transaction (forces reload)
 * - Update transaction (optimistic updates)
 * - Clear cache
 */
export const TransactionDetailActions = createActionGroup({
  source: 'Transaction Detail',
  events: {
    /**
     * Load Transaction
     * Checks cache first, only fetches if not found
     * 
     * @param transactionId - ID of transaction to load
     * @param forceReload - If true, bypasses cache and fetches fresh data
     */
    'Load Transaction': props<{ 
      transactionId: number;
      forceReload?: boolean;
    }>(),

    /**
     * Load Transaction Success
     * Dispatched when transaction is successfully loaded
     * 
     * @param transaction - Transaction data
     */
    'Load Transaction Success': props<{ transaction: GimacTransaction }>(),

    /**
     * Load Transaction Failure
     * Dispatched when loading transaction fails
     * 
     * @param transactionId - ID that failed to load
     * @param error - Error message
     */
    'Load Transaction Failure': props<{ 
      transactionId: number;
      error: string;
    }>(),

    /**
     * Refresh Transaction
     * Forces a fresh fetch of transaction data, bypassing cache
     * 
     * @param transactionId - ID of transaction to refresh
     */
    'Refresh Transaction': props<{ transactionId: number }>(),

    /**
     * Update Transaction
     * Optimistically updates transaction in store
     * Used for local updates before server confirmation
     * 
     * @param transactionId - ID of transaction to update
     * @param changes - Partial transaction data to update
     */
    'Update Transaction': props<{ 
      transactionId: number;
      changes: Partial<GimacTransaction>;
    }>(),

    /**
     * Remove Transaction
     * Removes transaction from cache
     * 
     * @param transactionId - ID of transaction to remove
     */
    'Remove Transaction': props<{ transactionId: number }>(),

    /**
     * Clear Cache
     * Removes all cached transactions
     */
    'Clear Cache': emptyProps(),

    /**
     * Set Selected Transaction
     * Sets the currently selected/active transaction ID
     * 
     * @param transactionId - ID of transaction to select
     */
    'Set Selected Transaction': props<{ transactionId: number | null }>()
  }
});