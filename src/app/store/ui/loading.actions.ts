import { createAction } from '@ngrx/store';

/**
 * Action to indicate that a loading process has started.
 */
export const showLoading = createAction('[Loading] Show');

/**
 * Action to indicate that a loading process has ended.
 */
export const hideLoading = createAction('[Loading] Hide');
