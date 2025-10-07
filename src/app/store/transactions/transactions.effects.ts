import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TransactionsService } from '@core/services/transactions.service';
import { TransactionsActions } from './transactions.actions';
import { selectCurrentFilters, selectIsPageCached } from './transactions.state';
import { catchError, map, switchMap, withLatestFrom, filter, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';
import { MockTransactionsService } from '@core/services/mock-transactions.service';

/**
 * Transaction Effects
 * 
 * Handles side effects for transaction actions:
 * - API calls for fetching transactions
 * - Smart caching logic for pagination
 * - Filter application and page changes
 */
@Injectable()
export class TransactionsEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private transactionsService = inject(TransactionsService);
    private mockTransactionsService = inject(MockTransactionsService); // Assuming mock service has same interface

    /**
     * Load Transactions Effect
     * 
     * Fetches transactions from API when LoadTransactions action is dispatched
     * Determines if data should be appended based on reinitialize flag
     */
    loadTransactions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TransactionsActions.loadTransactions),
            withLatestFrom(this.store.select(selectCurrentFilters)),
            switchMap(([{ reinitialize }, filters]) => {
                // Select appropriate service based on environment
                const useMockData = environment.gimacPayment.useMockData;
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
            }
            )
        )
    );

    /**
     * Apply Filters Effect
     * 
     * When filters are applied, triggers a fresh data load
     * Always reinitializes unless only date changed (handled in reducer)
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
     * 3. If not cached: Fetch from API and append to cache
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
     * Log errors effect
     * Logs transaction loading errors for debugging
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