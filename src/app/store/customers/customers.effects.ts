// src/app/store/customers/customers.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CustomersService } from '@core/services/customers/customers.service';
import { CustomersActions } from './customers.actions';
import {
  selectFilters,
  selectLimit,
  selectOffset,
  selectIsPageCached,
  selectIsCustomerCached,
  selectCurrentPartnerId
} from './customers.state';
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
   * Check And Load Customers (Cache-Aware)
   */
  checkAndLoadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.checkAndLoadCustomers),
      withLatestFrom(
        this.store.select(selectLimit),
        this.store.select(selectOffset)
      ),
      switchMap(([{ filters }, limit, offset]) => {
        const pageNumber = Math.floor(offset / limit) + 1;
        return this.store.select(selectIsPageCached(pageNumber)).pipe(
          map(isCached => {
            if (!isCached) {
              return CustomersActions.loadCustomers({ filters });
            }
            // Page already cached, no need to load
            return { type: '[Customers] Page Already Cached' } as any;
          })
        );
      })
    )
  );

  /**
   * Check And Load Customer (Cache-Aware)
   */
  checkAndLoadCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.checkAndLoadCustomer),
      switchMap(({ customerId, forceReload }) => {
        return this.store.select(selectIsCustomerCached(customerId)).pipe(
          map(isCached => {
            if (!isCached || forceReload) {
              return CustomersActions.loadCustomer({ customerId });
            }
            // Customer already cached, no need to load
            return { type: '[Customers] Customer Already Cached' } as any;
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
   * Set Partner Filter - Reset Store for Partner Context
   * When partner ID changes, reset the entire store to ensure fresh data
   */
  setPartnerFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.setPartnerFilter),
      withLatestFrom(this.store.select(selectCurrentPartnerId)),
      switchMap(([{ partnerId }, currentPartnerId]) => {
        // Check if partner context changed
        if (currentPartnerId !== partnerId) {
          // Partner changed, reset store completely
          return of(CustomersActions.resetForPartnerContext({ partnerId }));
        }
        // Same partner, just reload
        return this.store.select(selectFilters).pipe(
          map(filters => CustomersActions.loadCustomers({ filters }))
        );
      })
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
   * Reset For Partner Context - Then Load Customers
   */
  resetForPartnerContext$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomersActions.resetForPartnerContext),
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