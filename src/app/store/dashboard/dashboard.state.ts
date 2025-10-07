import { DashboardStatsDTO } from '@core/models/dashboard.models';
import { createFeatureSelector, createSelector } from '@ngrx/store';

/**
 * Dashboard feature state interface
 * Manages dashboard statistics, loading state, and errors
 */
export interface DashboardState {
  /** Current dashboard statistics data */
  stats: DashboardStatsDTO | null;
  /** Indicates if data is being fetched */
  loading: boolean;
  /** Error message if stats loading fails */
  error: string | null;
}

/**
 * Mock dashboard data for development
 * Provides realistic sample data while API is being developed
 * 
 * This data represents a typical day's activity:
 * - High transaction volume with good success rate
 * - Active bond market with pending settlements
 * - Some reconciliation work needed
 * - Growing customer base
 */
export const MOCK_DASHBOARD_STATS: DashboardStatsDTO = {
  totalTransactions: 48234,
  successfulTransactions: 45180,
  failedTransactions: 854,
  pendingTransactions: 2200,
  reconciledTransactions: 44500,
  unreconciledTransactions: 3734,
  totalBondsPublished: 1250,
  bondsSold: 987,
  bondsSettled: 743,
  bondsPendingSettlement: 244,
  numberOfUniqueCustomer: 15678
};

/**
 * Initial state for dashboard feature
 * Stats are null until first load, not loading, no errors
 */
export const initialState: DashboardState = {
  stats: MOCK_DASHBOARD_STATS, //null,
  loading: false,
  error: null
};

/**
 * Feature selector for accessing the dashboard state slice
 */
export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

/**
 * Selector to get dashboard statistics
 * @returns DashboardStatsDTO or null if not loaded
 */
export const selectDashboardStats = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.stats
);

/**
 * Selector to get loading state
 * @returns true if dashboard stats are being fetched
 */
export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.loading
);

/**
 * Selector to get error state
 * @returns error message string or null if no error
 */
export const selectDashboardError = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.error
);