import { createFeatureSelector, createSelector } from '@ngrx/store';

/**
 * Data Transfer Object for Dashboard Statistics
 * Contains all metrics for transactions, bonds, and customers
 */
export interface DashboardStatsDTO {
  /** Total number of transactions */
  totalTransactions: number;
  /** Number of successfully completed transactions */
  successfulTransactions: number;
  /** Number of failed transactions */
  failedTransactions: number;
  /** Number of transactions awaiting completion */
  pendingTransactions: number;
  /** Number of reconciled transactions */
  reconciledTransactions: number;
  /** Number of unreconciled transactions */
  unreconciledTransactions: number;
  /** Total number of bonds published */
  totalBondsPublished: number;
  /** Number of bonds that have been sold */
  bondsSold: number;
  /** Number of bonds that have been settled */
  bondsSettled: number;
  /** Number of bonds pending settlement */
  bondsPendingSettlement: number;
  /** Number of unique customers in the system */
  numberOfUniqueCustomer: number;
}

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
 * Initial state for dashboard feature
 * Stats are null until first load, not loading, no errors
 */
export const initialState: DashboardState = {
  stats: null,
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