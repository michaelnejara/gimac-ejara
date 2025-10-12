// src/app/store/bond-transactions/bond-transactions.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BondTransactionsService } from '@core/services/bond-transactions.service';
import { BondTransactionsActions } from './bond-transactions.actions';
import { selectFilters } from './bond-transactions.state';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Bond Transactions Effects
 */
@Injectable()
export class BondTransactionsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private transactionsService = inject(BondTransactionsService);

  /**
   * Load Transactions List
   */
  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.loadTransactions),
      switchMap(({ filters }) => {
        return this.transactionsService.getTransactions(filters).pipe(
          map(response => BondTransactionsActions.loadTransactionsSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load transactions';
            return of(BondTransactionsActions.loadTransactionsFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Load Single Transaction
   */
  loadTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.loadTransaction),
      switchMap(({ transactionId }) => {
        return this.transactionsService.getTransactionById(transactionId).pipe(
          map(transaction => BondTransactionsActions.loadTransactionSuccess({ transaction })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load transaction';
            return of(BondTransactionsActions.loadTransactionFailure({ 
              transactionId, 
              error: errorMessage 
            }));
          })
        );
      })
    )
  );

  /**
   * Load Statistics
   */
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.loadStats),
      switchMap(({ filters }) => {
        return this.transactionsService.getTransactionStats(filters).pipe(
          map(stats => BondTransactionsActions.loadStatsSuccess({ stats })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load statistics';
            return of(BondTransactionsActions.loadStatsFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Apply Filters - Reload Transactions
   */
  applyFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.applyFilters),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Clear Filters - Reload Transactions
   */
  clearFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.clearFilters),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Set Date Range - Reload Transactions
   */
  setDateRange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.setDateRange),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Set Status Filter - Reload Transactions
   */
  setStatusFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.setStatusFilter),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
 * Set Transaction Type Filter - Reload Transactions
 */
setTransactionTypeFilter$ = createEffect(() =>
  this.actions$.pipe(
    ofType(BondTransactionsActions.setTransactionTypeFilter),
    withLatestFrom(this.store.select(selectFilters)),
    map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
  )
);

  /**
   * Set Bond Filter - Reload Transactions
   */
  setBondFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.setBondFilter),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Set Partner Filter - Reload Transactions
   */
  setPartnerFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.setPartnerFilter),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Set Customer Filter - Reload Transactions
   */
  setCustomerFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.setCustomerFilter),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Change Page - Reload Transactions
   */
  changePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.changePage),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Change Page Size - Reload Transactions
   */
  changePageSize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.changePageSize),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadTransactions({ filters }))
    )
  );

  /**
   * Load Stats After Transactions Load
   */
  loadStatsAfterTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.loadTransactionsSuccess),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondTransactionsActions.loadStats({ filters }))
    )
  );

  /**
   * Log Errors
   */
  logErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BondTransactionsActions.loadTransactionsFailure,
          BondTransactionsActions.loadTransactionFailure,
          BondTransactionsActions.loadStatsFailure
        ),
        tap(({ error }) => console.error('Bond Transactions error:', error))
      ),
    { dispatch: false }
  );
}