// src/app/store/bond-transactions/bond-transactions.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BondTransactionsService } from '@core/services/bond-transactions/bond-transactions.service';
import { BondTransactionsActions } from './bond-transactions.actions';
import {
  selectLimit,
  selectOffset,
  selectIsPageCached,
  selectIsTransactionCached
} from './bond-transactions.state';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';
import { BondTransactionsMockService } from '@core/services/bond-transactions/bond-transactions-mock.service';

/**
 * Bond Transactions Effects
 */
@Injectable()
export class BondTransactionsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private transactionsService = inject(BondTransactionsService);
  
  private mockBondTransactionsService = inject(BondTransactionsMockService);
  private useMockData = environment.gimacTbB2B.useMockData;

  /**
   * Load Transactions List
   */
  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.loadTransactions),
      switchMap(({ filters }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondTransactionsService.getTransactions(filters)
          : this.transactionsService.getTransactions(filters);

        return source$.pipe(
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
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondTransactionsService.getTransactionById(transactionId)
          : this.transactionsService.getTransactionById(transactionId);

        return source$.pipe(
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
   * Check And Load Transactions (Cache-Aware)
   */
  checkAndLoadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.checkAndLoadTransactions),
      withLatestFrom(
        this.store.select(selectLimit),
        this.store.select(selectOffset)
      ),
      switchMap(([{ filters }, limit, offset]) => {
        const pageNumber = Math.floor(offset / limit) + 1;
        return this.store.select(selectIsPageCached(pageNumber)).pipe(
          map(isCached => {
            if (!isCached) {
              return BondTransactionsActions.loadTransactions({ filters });
            }
            // Page already cached, no need to load
            return { type: '[Bond Transactions] Page Already Cached' } as any;
          })
        );
      })
    )
  );

  /**
   * Check And Load Transaction (Cache-Aware)
   */
  checkAndLoadTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.checkAndLoadTransaction),
      switchMap(({ transactionId, forceReload }) => {
        return this.store.select(selectIsTransactionCached(transactionId)).pipe(
          map(isCached => {
            if (!isCached || forceReload) {
              return BondTransactionsActions.loadTransaction({ transactionId });
            }
            // Transaction already cached, no need to load
            return { type: '[Bond Transactions] Transaction Already Cached' } as any;
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
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondTransactionsService.getTransactionStats(filters)
          : this.transactionsService.getTransactionStats(filters);

        return source$.pipe(
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
   * Change Transaction Status
   */
  changeTransactionStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondTransactionsActions.changeTransactionStatus),
      switchMap(({ transactionId, status, reason }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondTransactionsService.changeTransactionStatus(transactionId, status, reason)
          : this.transactionsService.changeTransactionStatus(transactionId, status, reason);

        return source$.pipe(
          map(transaction => BondTransactionsActions.changeTransactionStatusSuccess({ transaction })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to change transaction status';
            return of(BondTransactionsActions.changeTransactionStatusFailure({
              transactionId,
              error: errorMessage
            }));
          })
        );
      })
    )
  );

  /**
   * Load Stats After Transactions Load
   */
  // loadStatsAfterTransactions$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BondTransactionsActions.loadTransactionsSuccess),
  //     withLatestFrom(this.store.select(selectFilters)),
  //     map(([_, filters]) => BondTransactionsActions.loadStats({ filters }))
  //   )
  // );

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