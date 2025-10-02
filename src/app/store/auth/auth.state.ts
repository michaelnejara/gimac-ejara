import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
// Update the path below to the correct relative or absolute path where auth.models.ts exists
import * as AuthModels from '@core/models/auth.models';

/**
 * Authentication feature state interface
 * Manages all authentication-related state
 */
export interface AuthFeatureState {
  /** Current authenticated user */
  user: AuthModels.User | null;
  /** JWT authentication token */
  authToken: string | null;
  /** JWT refresh token */
  refreshToken: string | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether MFA is required */
  mfaRequired: boolean;
  /** Available MFA methods */
  mfaData: AuthModels.MfaData[];
  /** Login reference for MFA completion */
  loginReference: string | null;
  /** Whether phone verification is needed */
  shouldVerifyPhoneNumber: boolean;
  /** Whether user can access admin panel */
  canAccessPanel: boolean;
  /** Loading state for async operations */
  loading: boolean;
  /** Current error if any */
  error: AuthModels.LoginErrorResponse | null;
  /** Device ID for the session */
  deviceId: string | null;
  /** Last activity timestamp */
  lastActivity: string | null;
}

/**
 * Initial authentication state
 */
export const initialAuthState: AuthFeatureState = {
  user: null,
  authToken: null,
  refreshToken: null,
  isAuthenticated: false,
  mfaRequired: false,
  mfaData: [],
  loginReference: null,
  shouldVerifyPhoneNumber: false,
  canAccessPanel: false,
  loading: false,
  error: null,
  deviceId: null,
  lastActivity: null,
};

/**
 * Authentication feature reducer
 * Handles all authentication state mutations
 */
export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    
    /**
     * Initial login start
     * Sets loading state and clears errors
     */
    on(AuthActions.loginStart, (state) => ({
      ...state,
      loading: true,
      error: null
    })),
    
    /**
     * Login success with MFA requirement
     * Stores login reference and MFA data
     */
    on(AuthActions.loginMfaRequired, (state, { response }) => ({
      ...state,
      loading: false,
      mfaRequired: response.data.shouldCompleteMfa,
      loginReference: response.data.loginReference,
      mfaData: response.data.mfaData,
      shouldVerifyPhoneNumber: response.data.shouldVerifyPhoneNumber,
      canAccessPanel: response.data.canAccessPanel,
      error: null
    })),
    
    /**
     * Login failure
     * Stores error information
     */
    on(AuthActions.loginFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),
    
    /**
     * Complete login start (OTP verification)
     * Sets loading state
     */
    on(AuthActions.completeLoginStart, (state) => ({
      ...state,
      loading: true,
      error: null
    })),
    
    /**
     * Complete login success
     * Stores tokens and user data
     */
    on(AuthActions.completeLoginSuccess, (state, { response }) => ({
      ...state,
      loading: false,
      authToken: response.data.authToken,
      refreshToken: response.data.refreshToken,
      user: state.user, // Will be set by effect
      isAuthenticated: true,
      mfaRequired: false,
      loginReference: null,
      error: null,
      lastActivity: new Date().toISOString()
    })),
    
    /**
     * Complete login failure
     * Stores error information
     */
    on(AuthActions.completeLoginFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),
    
    /**
     * Set user data
     * Updates user information after mapping
     */
    on(AuthActions.setUser, (state, { user }) => ({
      ...state,
      user
    })),
    
    /**
     * Set device ID
     * Stores generated device identifier
     */
    on(AuthActions.setDeviceId, (state, { deviceId }) => ({
      ...state,
      deviceId
    })),
    
    /**
     * Update activity timestamp
     * Tracks last user activity
     */
    on(AuthActions.updateActivity, (state) => ({
      ...state,
      lastActivity: new Date().toISOString()
    })),
    
    /**
     * Token refresh success
     * Updates tokens
     */
    on(AuthActions.tokenRefreshSuccess, (state, { authToken, refreshToken }) => ({
      ...state,
      authToken,
      refreshToken,
      lastActivity: new Date().toISOString()
    })),
    
    /**
     * Logout
     * Resets to initial state
     */
    on(AuthActions.logout, () => ({
      ...initialAuthState
    })),
    
    /**
     * Clear error
     * Removes current error
     */
    on(AuthActions.clearError, (state) => ({
      ...state,
      error: null
    }))
  )
});

// Export selectors from feature
export const {
  selectAuthState,
  selectUser,
  selectAuthToken,
  selectRefreshToken,
  selectIsAuthenticated,
  selectMfaRequired,
  selectMfaData,
  selectLoginReference,
  selectShouldVerifyPhoneNumber,
  selectCanAccessPanel,
  selectLoading,
  selectError,
  selectDeviceId,
  selectLastActivity
} = authFeature;