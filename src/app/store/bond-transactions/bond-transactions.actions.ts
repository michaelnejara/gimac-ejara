import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { 
  BondTransaction,
  TransactionsResponse,
  TransactionFilterParams,
  TransactionStats
} from '@core/models/bond-transaction.models';

/**
 * Bond Transactions Actions
 */
export const BondTransactionsActions = createActionGroup({
  source: 'Bond Transactions',
  events: {
    // Load Transactions List
    'Load Transactions': props<{ filters?: TransactionFilterParams }>(),
    'Load Transactions Success': props<{ response: TransactionsResponse }>(),
    'Load Transactions Failure': props<{ error: string }>(),

    // Load Single Transaction
    'Load Transaction': props<{ transactionId: number }>(),
    'Load Transaction Success': props<{ transaction: BondTransaction }>(),
    'Load Transaction Failure': props<{ transactionId: number; error: string }>(),

    // Cache-Aware Loading
    'Check And Load Transactions': props<{ filters?: TransactionFilterParams }>(),
    'Check And Load Transaction': props<{ transactionId: number; forceReload?: boolean }>(),

    // Load Statistics
    'Load Stats': props<{ filters?: TransactionFilterParams }>(),
    'Load Stats Success': props<{ stats: TransactionStats }>(),
    'Load Stats Failure': props<{ error: string }>(),

    // Filter & Search
    'Apply Filters': props<{ filters: TransactionFilterParams }>(),
    'Clear Filters': emptyProps(),
    'Set Date Range': props<{ dateFrom: string; dateTo: string }>(),
    'Set Status Filter': props<{ status: string | null }>(),
    'Set Transaction Type Filter': props<{ transactionType: string | null }>(), // FIXED: renamed from 'type' to 'transactionType'
    'Set Bond Filter': props<{ bondId: number | null }>(),
    'Set Partner Filter': props<{ partnerId: number | null }>(),
    'Set Customer Filter': props<{ customerId: number | null }>(),

    // Pagination
    'Change Page': props<{ offset: number }>(),
    'Change Page Size': props<{ limit: number }>(),

    // Selection
    'Select Transaction': props<{ transactionId: number | null }>(),
    'Clear Selection': emptyProps(),

    // Page Management
    'Reset To First Page': emptyProps(),

    // Change Transaction Status
    'Change Transaction Status': props<{ 
      transactionId: number; 
      status: string;
      reason?: string;
    }>(),
    'Change Transaction Status Success': props<{ transaction: BondTransaction }>(),
    'Change Transaction Status Failure': props<{ 
      transactionId: number; 
      error: string 
    }>(),

    // UI State
    'Set Loading': props<{ loading: boolean }>(),
    'Clear Errors': emptyProps(),
    'Reset State': emptyProps()
  }
});