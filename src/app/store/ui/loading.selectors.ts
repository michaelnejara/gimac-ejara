import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoadingState } from './loading.reducer';

/**
 * Selects the entire loading state slice from the global store.
 */
export const selectLoadingState = createFeatureSelector<LoadingState>('loading');

/**
 * Selects the boolean `isLoading` flag from the loading state.
 */
export const selectIsLoading = createSelector(
  selectLoadingState,
  (state) => state.isLoading
);
