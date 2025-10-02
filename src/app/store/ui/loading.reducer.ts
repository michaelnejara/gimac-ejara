import { createReducer, on } from '@ngrx/store';
import { showLoading, hideLoading } from './loading.actions';

/**
 * Shape of the loading state stored in Redux.
 */
export interface LoadingState {
  isLoading: boolean;
}

/**
 * Initial loading state.
 */
export const initialState: LoadingState = {
  isLoading: false,
};

/**
 * Reducer for handling loading state transitions.
 * - showLoading → sets isLoading to true
 * - hideLoading → sets isLoading to false
 */
export const loadingReducer = createReducer(
  initialState,
  on(showLoading, () => ({ isLoading: true })),
  on(hideLoading, () => ({ isLoading: false }))
);
