import { DashboardStatsDTO, DashboardFilterParams } from '@core/models/dashboard.models';
import { createFeatureSelector, createSelector } from '@ngrx/store';

/**
 * Dashboard feature state interface
 * Manages dashboard statistics, loading state, filters, and errors
 */
export interface DashboardState {
  /** Current dashboard statistics data */
  stats: DashboardStatsDTO | null;
  /** Indicates if data is being fetched */
  loading: boolean;
  /** Error message if stats loading fails */
  error: string | null;
  /** Active filter parameters */
  filters: DashboardFilterParams;
}

/**
 * Mock dashboard data for development
 * Provides realistic sample data while API is being developed
 *
 * This data represents a typical business snapshot:
 * - Partner and customer metrics
 * - Transaction volumes (deposits and withdrawals)
 * - Financial performance indicators
 * - Pending and failed transaction tracking
 */
export const MOCK_DASHBOARD_STATS: DashboardStatsDTO = {
  totalPartners: 15,
  totalActivePartners: 12,
  totalDeposits: 450,
  totalDepositAmount: 2500000.50,
  totalWithdrawals: 120,
  totalWithdrawalAmount: 750000.25,
  totalCommissionEarned: 125000.75,
  totalPrincipalInvested: 2000000.00,
  totalInterestPaid: 150000.30,
  totalPendingTransactions: 25,
  totalFailedTransactions: 8
};

/**
 * Initial state for dashboard feature
 * Stats are null until first load, not loading, no errors, no filters
 */
export const initialState: DashboardState = {
  stats: MOCK_DASHBOARD_STATS, //null,
  loading: false,
  error: null,
  filters: {}
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

/**
 * Selector to get active filter parameters
 * @returns active filter parameters
 */
export const selectDashboardFilters = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.filters
);

/**
 * Selector to check if any filters are active
 * @returns true if any filter is set
 */
export const selectHasActiveFilters = createSelector(
  selectDashboardFilters,
  (filters: DashboardFilterParams) => {
    return !!(filters.startDate || filters.endDate || filters.partnerId);
  }
);