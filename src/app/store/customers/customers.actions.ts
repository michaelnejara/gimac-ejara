// src/app/store/customers/customers.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { 
  Customer,
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
    'Load Customer Success': props<{ customer: Customer }>(),
    'Load Customer Failure': props<{ customerId: number; error: string }>(),

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

    // UI State
    'Set Loading': props<{ loading: boolean }>(),
    'Clear Errors': emptyProps(),
    'Reset State': emptyProps()
  }
});