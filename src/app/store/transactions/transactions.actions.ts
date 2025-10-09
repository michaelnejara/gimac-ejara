import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { 
  GimacTransaction, 
  GimacTransactionResponse, 
  GimacTransactionFilterParams 
} from '@core/models/transaction.models';

/**
 * Transaction Actions
 * 
 * Actions for managing transaction state including:
 * - Loading transactions
 * - Filtering transactions
 * - Pagination (page changes and page size changes)
 * - Error handling
 */
export const TransactionsActions = createActionGroup({
  source: 'Transactions',
  events: {
    /**
     * Load Transactions
     * Triggers fetching transactions from API with current filters
     * 
     * @param reinitialize - If true, clears cache and starts fresh
     */
    'Load Transactions': props<{ reinitialize: boolean }>(),

    /**
     * Load Transactions Success
     * Dispatched when transactions are successfully loaded
     * 
     * @param response - API response with transaction data
     * @param pageNumber - Current page number
     * @param append - If true, appends to existing data (for caching)
     */
    'Load Transactions Success': props<{ 
      response: GimacTransactionResponse;
      pageNumber: number;
      append: boolean;
    }>(),

    /**
     * Load Transactions Failure
     * Dispatched when loading transactions fails
     * 
     * @param error - Error message
     */
    'Load Transactions Failure': props<{ error: string }>(),

    /**
     * Apply Filters
     * Updates filter criteria and triggers new data load
     * Resets to page 1 and clears cache
     * 
     * @param filters - New filter parameters
     */
    'Apply Filters': props<{ filters: GimacTransactionFilterParams }>(),

    /**
     * Change Page
     * Navigates to a different page with current filters
     * 
     * @param pageNumber - Target page number (1-indexed)
     */
    'Change Page': props<{ pageNumber: number }>(),

    /**
     * Change Page Size
     * Updates the number of items per page
     * Resets to page 1 and clears cache
     * 
     * @param pageSize - New page size (10, 20, 50, 100, etc.)
     */
    'Change Page Size': props<{ pageSize: number }>(),

    /**
     * Clear Filters
     * Resets all filters to default values
     */
    'Clear Filters': emptyProps(),

    /**
     * Reset State
     * Resets entire transaction state to initial values
     */
    'Reset State': emptyProps()
  }
});