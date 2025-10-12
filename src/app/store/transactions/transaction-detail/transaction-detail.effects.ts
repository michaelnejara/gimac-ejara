// src/app/store/transaction-detail/transaction-detail.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TransactionsService } from '@core/services/transactions.service';
import { MockTransactionsService } from '@core/services/mock-transactions.service';
import { TransactionDetailActions } from './transaction-detail.actions';
import { 
  selectTransactionExists,
  selectIsTransactionStale 
} from './transaction-detail.state';
import { 
  catchError, 
  map, 
  switchMap, 
  withLatestFrom, 
  filter,
  tap 
} from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * Transaction Detail Effects
 * 
 * Handles side effects for transaction detail actions:
 * - Smart caching: checks if transaction exists before fetching
 * - Staleness detection: can auto-refresh stale data
 * - Refresh handling: forces fresh data fetch
 */
@Injectable()
export class TransactionDetailEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private transactionsService = inject(TransactionsService);
  private mockTransactionsService = inject(MockTransactionsService);

  /**
   * Load Transaction Effect
   * 
   * Smart loading with cache checking:
   * 1. Check if forceReload is true
   * 2. Check if transaction exists in cache
   * 3. Check if cached transaction is stale
   * 4. Only fetch if needed
   * 
   * Flow:
   * - forceReload = true → Always fetch
   * - Transaction not in cache → Fetch
   * - Transaction in cache but stale → Fetch
   * - Transaction in cache and fresh → Skip fetch
   */
  loadTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionDetailActions.loadTransaction),
      switchMap(({ transactionId, forceReload }) => {
        // If force reload, skip cache check
        if (forceReload) {
          return of({ shouldFetch: true, transactionId });
        }

        // Check if transaction exists and if it's stale
        return this.store.select(selectTransactionExists(transactionId)).pipe(
          switchMap(exists => {
            if (!exists) {
              return of({ shouldFetch: true, transactionId });
            }

            // Check staleness (5 minutes by default)
            return this.store.select(selectIsTransactionStale(transactionId)).pipe(
              map(isStale => ({ shouldFetch: isStale, transactionId }))
            );
          })
        );
      }),
      filter(({ shouldFetch }) => shouldFetch),
      switchMap(({ transactionId }) => {
        // Select appropriate service based on environment
        const useMockData = environment.gimacTbB2B.useMockData;
        const source$ = useMockData
          ? this.mockTransactionsService.getTransactionById(transactionId)
          : this.transactionsService.getTransactionById(transactionId);

        return source$.pipe(
          map(transaction => {
            if (!transaction) {
              return TransactionDetailActions.loadTransactionFailure({
                transactionId,
                error: 'Transaction not found'
              });
            }
            return TransactionDetailActions.loadTransactionSuccess({ transaction });
          }),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load transaction';
            return of(TransactionDetailActions.loadTransactionFailure({
              transactionId,
              error: errorMessage
            }));
          })
        );
      })
    )
  );

  /**
   * Refresh Transaction Effect
   * 
   * Forces a fresh fetch of transaction data, bypassing all cache
   */
  refreshTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionDetailActions.refreshTransaction),
      map(({ transactionId }) => 
        TransactionDetailActions.loadTransaction({ 
          transactionId, 
          forceReload: true 
        })
      )
    )
  );

  /**
   * Log Errors Effect
   * 
   * Non-dispatching effect that logs transaction loading errors
   */
  logErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TransactionDetailActions.loadTransactionFailure),
        tap(({ transactionId, error }) => 
          console.error(`Failed to load transaction ${transactionId}:`, error)
        )
      ),
    { dispatch: false }
  );

  /**
   * Set Selected on Load Effect
   * 
   * Automatically sets the loaded transaction as selected
   */
  setSelectedOnLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionDetailActions.loadTransactionSuccess),
      map(({ transaction }) => 
        TransactionDetailActions.setSelectedTransaction({ 
          transactionId: transaction.id 
        })
      )
    )
  );
}