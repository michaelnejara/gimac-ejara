import { DashboardStatsDTO } from '@core/models/dashboard.models';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

/**
 * Dashboard Actions Group
 * Handles all actions related to dashboard statistics management
 * 
 * Actions:
 * - Load Stats: Initiates fetching of dashboard statistics
 * - Load Stats Success: Dispatched when stats are successfully loaded
 * - Load Stats Failure: Dispatched when stats loading fails
 * - Reset Stats: Clears dashboard state back to initial values
 */
export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    /**
     * Action to initiate loading of dashboard statistics
     * Triggers the dashboard API call via effects
     */
    'Load Stats': emptyProps(),
    
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
     * Action to reset dashboard state to initial values
     * Clears all statistics, loading state, and errors
     */
    'Reset Stats': emptyProps()
  }
});