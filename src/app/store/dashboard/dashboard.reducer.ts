// src/app/store/dashboard/dashboard.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { DashboardActions } from './dashboard.actions';
import { initialState } from './dashboard.state';

/**
 * Dashboard Reducer
 * Manages state transitions for dashboard feature
 * 
 * Handles:
 * - Setting loading state when stats are requested
 * - Updating stats on successful load
 * - Handling errors on failed load
 * - Resetting state when needed
 */
export const dashboardReducer = createReducer(
  initialState,
  
  /**
   * Handle Load Stats action
   * Sets loading to true and clears any previous errors
   */
  on(DashboardActions.loadStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  /**
   * Handle Load Stats Success action
   * Updates state with loaded statistics and clears loading/error flags
   * @param stats - The successfully loaded dashboard statistics
   */
  on(DashboardActions.loadStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    loading: false,
    error: null
  })),
  
  /**
   * Handle Load Stats Failure action
   * Sets error message and clears loading flag
   * @param error - Error message describing what went wrong
   */
  on(DashboardActions.loadStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  /**
   * Handle Reset Stats action
   * Returns state to initial values (null stats, not loading, no error)
   */
  on(DashboardActions.resetStats, () => initialState)
);