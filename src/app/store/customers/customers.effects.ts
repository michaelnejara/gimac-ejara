// src/app/store/customers/customers.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CustomersService } from '@core/services/customers/customers.service';
import { CustomersActions } from './customers.actions';
import { selectFilters } from './customers.state';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';
import { CustomersMockService } from '@core/services/customers/customers-mock.service';

/**
 * Customers Effects
 */
@Injectable()
export class CustomersEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private customersService = inject(CustomersService);

  private mockCustomersService = inject(CustomersMockService);
  private useMockData = environment.gimacTbB2B.useMockData;

  /**
   * Load Customers List
   */
  loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.loadCustomers),
      switchMap(({ filters }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockCustomersService.getCustomers(filters!)
          : this.customersService.getCustomers(filters);

        return source$.pipe(
          map(response => CustomersActions.loadCustomersSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load customers';
            return of(CustomersActions.loadCustomersFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Load Single Customer
   */
  loadCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.loadCustomer),
      switchMap(({ customerId }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockCustomersService.getCustomerById(customerId)
          : this.customersService.getCustomerById(customerId);

        return source$.pipe(
          map(customer => CustomersActions.loadCustomerSuccess({ customer })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load customer';
            return of(CustomersActions.loadCustomerFailure({ customerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Apply Filters - Reload Customers
   */
  applyFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.applyFilters),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => CustomersActions.loadCustomers({ filters }))
    )
  );

  /**
   * Clear Filters - Reload Customers
   */
  clearFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.clearFilters),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => CustomersActions.loadCustomers({ filters }))
    )
  );

  /**
   * Set Search Keyword - Reload Customers
   */
  setSearchKeyword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.setSearchKeyword),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => CustomersActions.loadCustomers({ filters }))
    )
  );

  /**
   * Set Partner Filter - Reload Customers
   */
  setPartnerFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.setPartnerFilter),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => CustomersActions.loadCustomers({ filters }))
    )
  );

  /**
   * Change Page - Reload Customers
   */
  changePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.changePage),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => CustomersActions.loadCustomers({ filters }))
    )
  );

  /**
   * Change Page Size - Reload Customers
   */
  changePageSize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.changePageSize),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => CustomersActions.loadCustomers({ filters }))
    )
  );

  /**
   * Log Errors
   */
  logErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          CustomersActions.loadCustomersFailure,
          CustomersActions.loadCustomerFailure
        ),
        tap(({ error }) => console.error('Customers error:', error))
      ),
    { dispatch: false }
  );
}