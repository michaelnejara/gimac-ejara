// src/app/store/customers/customers.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CustomerDetails,
  CustomersResponse,
  CustomerFilterParams
} from '@core/models/customer.models';

/**
 * Customers Actions
 */
export const CustomersActions = createActionGroup({
  source: 'Customers',
  events: {
    // Load Customers List
    'Load Customers': props<{ filters?: CustomerFilterParams }>(),
    'Load Customers Success': props<{ response: CustomersResponse }>(),
    'Load Customers Failure': props<{ error: string }>(),

    // Load Single Customer
    'Load Customer': props<{ customerId: number }>(),
    'Load Customer Success': props<{ customer: CustomerDetails }>(),
    'Load Customer Failure': props<{ customerId: number; error: string }>(),

    // Cache-Aware Loading
    'Check And Load Customers': props<{ filters?: CustomerFilterParams }>(),
    'Check And Load Customer': props<{ customerId: number; forceReload?: boolean }>(),

    // Filter & Search
    'Apply Filters': props<{ filters: CustomerFilterParams }>(),
    'Clear Filters': emptyProps(),
    'Set Search Keyword': props<{ keyword: string }>(),
    'Set Partner Filter': props<{ partnerId: number | null }>(),

    // Pagination
    'Change Page': props<{ offset: number }>(),
    'Change Page Size': props<{ limit: number }>(),

    // Selection
    'Select Customer': props<{ customerId: number | null }>(),
    'Clear Selection': emptyProps(),

    // Page Management
    'Reset To First Page': emptyProps(),
    'Reset For Partner Context': props<{ partnerId: number | null }>(),

    // UI State
    'Set Loading': props<{ loading: boolean }>(),
    'Clear Errors': emptyProps(),
    'Reset State': emptyProps()
  }
});