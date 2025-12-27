import { DashboardStatsDTO, DashboardFilterParams } from '@core/models/dashboard.models';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

/**
 * Dashboard Actions Group
 * Handles all actions related to dashboard statistics management
 *
 * Actions:
 * - Load Stats: Initiates fetching of dashboard statistics with optional filters
 * - Load Stats Success: Dispatched when stats are successfully loaded
 * - Load Stats Failure: Dispatched when stats loading fails
 * - Set Filters: Updates active filter parameters
 * - Clear Filters: Removes all active filters
 * - Reset Stats: Clears dashboard state back to initial values
 */
export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    /**
     * Action to initiate loading of dashboard statistics
     * Triggers the dashboard API call via effects with optional filter parameters
     * @property filters - Optional filter parameters (startDate, endDate, partnerId)
     */
    'Load Stats': props<{ filters?: DashboardFilterParams }>(),

    /**
     * Action dispatched when dashboard stats are successfully loaded
     * @property stats - The loaded dashboard statistics data
     */
    'Load Stats Success': props<{ stats: DashboardStatsDTO }>(),

    /**
     * Action dispatched when loading dashboard stats fails
     * @property error - Error message describing the failure
     */
    'Load Stats Failure': props<{ error: string }>(),

    /**
     * Action to set active filter parameters
     * @property filters - Filter parameters to apply
     */
    'Set Filters': props<{ filters: DashboardFilterParams }>(),

    /**
     * Action to clear all active filters
     * Resets filters to empty state and reloads stats
     */
    'Clear Filters': emptyProps(),

    /**
     * Action to reset dashboard state to initial values
     * Clears all statistics, loading state, errors, and filters
     */
    'Reset Stats': emptyProps()
  }
});