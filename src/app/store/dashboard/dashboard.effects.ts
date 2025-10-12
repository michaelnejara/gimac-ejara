// src/app/store/dashboard/dashboard.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DashboardActions } from './dashboard.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GimacPaymentService } from '@core/services/gimac-payment.service';
import { environment } from '@environments/environment';
import { GimacPaymentMockDataService } from '@core/services/gimac-payment-mock-data.service';

/**
 * Dashboard Effects
 * Handles side effects for dashboard-related actions
 * 
 * Manages asynchronous operations like API calls and their responses,
 * converting them into appropriate success or failure actions.
 * 
 * Effects:
 * - loadStats$: Fetches dashboard statistics from API
 * - loadStatsFailure$: Logs errors when stats loading fails
 */
@Injectable()
export class DashboardEffects {
  private actions$ = inject(Actions);
  private gimacPaymentService = inject(GimacPaymentService);
  private GimacPaymentMockDataService = inject(GimacPaymentMockDataService);

  /**
   * Load Dashboard Stats Effect
   * 
   * Listens for LoadStats action and triggers an API call to fetch
   * dashboard statistics. Maps the response to either a success or
   * failure action based on the API result.
   * 
   * Flow:
   * 1. Action dispatched: DashboardActions.loadStats()
   * 2. API call made via DashboardService
   * 3. On success: Dispatch LoadStatsSuccess with data
   * 4. On error: Dispatch LoadStatsFailure with error message
   * 
   * @returns Observable that emits LoadStatsSuccess or LoadStatsFailure actions
   * 
   * @example
   * ```typescript
   * // In component:
   * this.store.dispatch(DashboardActions.loadStats());
   * 
   * // Effect automatically:
   * // 1. Makes API call
   * // 2. Dispatches success/failure action
   * // 3. Reducer updates state accordingly
   * ```
   */
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      // Listen for LoadStats action
      ofType(DashboardActions.loadStats),

      // Switch to new API call, canceling previous if still pending
      switchMap(() => {
        // Use mock data flag from environment
        const useMockData = environment.gimacTbB2B.useMockData;

        // Select appropriate service based on environment
        const source$ = useMockData 
          ? this.GimacPaymentMockDataService.getDashboardStats()
          : this.gimacPaymentService.getDashboardStats();

        return source$.pipe(
          // On successful response, dispatch success action with data
          map(stats => DashboardActions.loadStatsSuccess({ stats })),

          // On error, extract error message and dispatch failure action
          catchError(error => {
            // Extract error message from response or use default
            const errorMessage = error?.error?.message || 'Failed to load dashboard stats';
            return of(DashboardActions.loadStatsFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Load Stats Failure Effect
   * 
   * Non-dispatching effect that logs errors to the console when
   * dashboard stats fail to load. Useful for debugging and monitoring.
   * 
   * This effect does not dispatch any actions (dispatch: false),
   * it only performs side effects (logging).
   * 
   * @example
   * ```typescript
   * // When LoadStatsFailure is dispatched, this effect will
   * // automatically log: "Dashboard stats error: <error message>"
   * ```
   */
  loadStatsFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        // Listen for LoadStatsFailure action
        ofType(DashboardActions.loadStatsFailure),

        // Log error to console for debugging
        tap(({ error }) => console.error('Dashboard stats error:', error))
      ),
    { dispatch: false } // This effect doesn't dispatch any actions
  );
}