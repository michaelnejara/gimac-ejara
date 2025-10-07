// src/app/store/transactions/transactions.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GimacTransaction, GimacTransactionFilterParams, GimacTransactionResponse } from '@core/models/transaction.models';

/**
 * Transaction Actions Group
 * 
 * Actions:
 * - Load Transactions: Fetch transactions with filters
 * - Load Transactions Success: Store fetched transactions
 * - Load Transactions Failure: Handle fetch errors
 * - Apply Filters: Update filters and reinitialize store
 * - Change Page: Navigate to different page (use cache if available)
 * - Select Transaction: Set selected transaction for detail view
 * - Clear Selected: Clear selected transaction
 * - Reset State: Reset to initial state
 */
export const TransactionsActions = createActionGroup({
  source: 'Transactions',
  events: {
    /**
     * Load Transactions
     * Initiates fetching of transactions with current filters
     * 
     * @param reinitialize - If true, clears cache before loading
     */
    'Load Transactions': props<{ reinitialize?: boolean }>(),
    
    /**
     * Load Transactions Success
     * Dispatched when transactions are successfully fetched
     * 
     * @param response - API response with transactions and pagination
     * @param pageNumber - Page number that was fetched
     * @param append - If true, append to existing data instead of replace
     */
    'Load Transactions Success': props<{ 
      response: GimacTransactionResponse;
      pageNumber: number;
      append: boolean;
    }>(),
    
    /**
     * Load Transactions Failure
     * Dispatched when transaction fetch fails
     * 
     * @param error - Error message
     */
    'Load Transactions Failure': props<{ error: string }>(),
    
    /**
     * Apply Filters
     * Updates filter parameters and reloads transactions
     * Clears cache unless only date filters changed
     * 
     * @param filters - New filter parameters
     */
    'Apply Filters': props<{ filters: GimacTransactionFilterParams }>(),
    
    /**
     * Change Page
     * Navigates to a different page
     * Uses cache if available, otherwise fetches from API
     * 
     * @param pageNumber - Target page number
     */
    'Change Page': props<{ pageNumber: number }>(),
    
    /**
     * Select Transaction
     * Sets a transaction as selected for detail view
     * 
     * @param transaction - Transaction to select
     */
    'Select Transaction': props<{ transaction: GimacTransaction }>(),
    
    /**
     * Clear Selected Transaction
     * Removes selected transaction
     */
    'Clear Selected': emptyProps(),
    
    /**
     * Reset State
     * Clears all data and returns to initial state
     */
    'Reset State': emptyProps()
  }
});