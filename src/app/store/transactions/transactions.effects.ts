// src/app/store/transactions/transactions.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TransactionsService } from '@core/services/transactions/transactions.service';
import { MockTransactionsService } from '@core/services/transactions/mock-transactions.service';
import { TransactionsActions } from './transactions.actions';
import { selectCurrentFilters, selectIsPageCached } from './transactions.state';
import { catchError, map, switchMap, withLatestFrom, filter, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * Transaction Effects
 * 
 * Handles side effects for transaction actions:
 * - Switches between real API and mock data based on environment
 * - Smart caching logic for pagination
 * - Filter application and page changes
 * - Page size changes
 */
@Injectable()
export class TransactionsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private transactionsService = inject(TransactionsService);
  private mockTransactionsService = inject(MockTransactionsService);

  /**
   * Load Transactions Effect
   * 
   * Fetches transactions from API or mock service based on environment.
   * Automatically switches between real API and mock data.
   * 
   * Flow:
   * 1. Get current filters from store
   * 2. Select appropriate service (real or mock)
   * 3. Fetch data
   * 4. Dispatch success or failure action
   */
  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransactions),
      withLatestFrom(this.store.select(selectCurrentFilters)),
      switchMap(([{ reinitialize }, filters]) => {
        // Select appropriate service based on environment
        const useMockData = environment.gimacTbB2B.useMockData;
        const source$ = useMockData 
          ? this.mockTransactionsService.getTransactions(filters)
          : this.transactionsService.getTransactions(filters);
        
        return source$.pipe(
          map(response => TransactionsActions.loadTransactionsSuccess({
            response,
            pageNumber: filters.pageNumber || 1,
            append: !reinitialize
          })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load transactions';
            return of(TransactionsActions.loadTransactionsFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Apply Filters Effect
   * 
   * When filters are applied, triggers a fresh data load with cache reinitialization.
   * Always fetches from page 1 with new filters.
   */
  applyFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.applyFilters),
      map(() => TransactionsActions.loadTransactions({ reinitialize: true }))
    )
  );

  /**
   * Change Page Effect
   * 
   * Implements smart pagination caching:
   * 1. Check if requested page is already cached
   * 2. If cached: Do nothing (reducer will update current page)
   * 3. If not cached: Fetch from service and append to cache
   * 
   * This prevents unnecessary API calls and improves performance.
   */
  changePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.changePage),
      withLatestFrom(this.store.select(selectCurrentFilters)),
      switchMap(([{ pageNumber }, filters]) => {
        // Check if this page is already in cache
        return this.store.select(selectIsPageCached(pageNumber)).pipe(
          map(isCached => ({ isCached, pageNumber, filters }))
        );
      }),
      filter(({ isCached }) => !isCached), // Only proceed if not cached
      map(() => TransactionsActions.loadTransactions({ reinitialize: false }))
    )
  );

  /**
   * Change Page Size Effect
   * 
   * When page size changes:
   * 1. Triggers a fresh data load with cache reinitialization
   * 2. Resets to page 1
   * 3. Uses new page size for the request
   * 
   * This ensures consistent data display with the new page size.
   */
  changePageSize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.changePageSize),
      map(() => TransactionsActions.loadTransactions({ reinitialize: true }))
    )
  );

  /**
   * Log Errors Effect
   * 
   * Non-dispatching effect that logs transaction loading errors.
   * Useful for debugging and monitoring.
   */
  logErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TransactionsActions.loadTransactionsFailure),
        tap(({ error }) => console.error('Transaction loading error:', error))
      ),
    { dispatch: false }
  );
}