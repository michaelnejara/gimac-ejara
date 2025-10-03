import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
// Update the path below to the correct relative or absolute path where auth.models.ts exists
import * as AuthModels from '@core/models/auth.models';
import { StorageService } from '@core/services/storage/storage.service';

/**
 * Storage keys for auth state persistence
 */
export const AUTH_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  DEVICE_ID: 'device_id',
  LAST_ACTIVITY: 'last_activity',
  MFA_REQUIRED: 'mfa_required',
  LOGIN_REFERENCE: 'login_reference',
  MFA_DATA: 'mfa_data'
} as const;

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
 * Initialize auth state from storage
 * Loads persisted authentication data from localStorage
 */
function initializeAuthStateFromStorage(): AuthFeatureState {
  const storageService = new StorageService();
  
  try {
    // Load persisted data from localStorage
    const authToken = storageService.getLocal<string>(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = storageService.getLocal<string>(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const user = storageService.getLocal<AuthModels.User>(AUTH_STORAGE_KEYS.USER);
    const deviceId = storageService.getLocal<string>(AUTH_STORAGE_KEYS.DEVICE_ID);
    const lastActivity = storageService.getLocal<string>(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    const mfaRequired = storageService.getLocal<boolean>(AUTH_STORAGE_KEYS.MFA_REQUIRED);
    const loginReference = storageService.getLocal<string>(AUTH_STORAGE_KEYS.LOGIN_REFERENCE);
    const mfaData = storageService.getLocal<AuthModels.MfaData[]>(AUTH_STORAGE_KEYS.MFA_DATA);

    // Determine if user is authenticated
    console.log({authToken, user});
    const isAuthenticated = !!(authToken && user);

    // Return initialized state
    return {
      user: user || null,
      authToken: authToken || null,
      refreshToken: refreshToken || null,
      isAuthenticated,
      mfaRequired: mfaRequired || false,
      mfaData: mfaData || [],
      loginReference: loginReference || null,
      shouldVerifyPhoneNumber: false, // Don't persist this
      canAccessPanel: isAuthenticated, // Derive from auth status
      loading: false,
      error: null,
      deviceId: deviceId || null,
      lastActivity: lastActivity || null,
    };
  } catch (error) {
    console.error('Failed to initialize auth state from storage:', error);
    // Return default initial state on error
    return getDefaultInitialState();
  }
}

/**
 * Get default initial auth state (when no storage data)
 */
function getDefaultInitialState(): AuthFeatureState {
  return {
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
}

/**
 * Initial authentication state
 * Loads from storage if available, otherwise uses defaults
 */
export const initialAuthState: AuthFeatureState = initializeAuthStateFromStorage();

/**
 * Persist auth state to storage
 * Saves important state to localStorage
 */
function persistAuthState(state: AuthFeatureState): void {
  const storageService = new StorageService();
  
  try {
    // Persist authentication data
    if (state.authToken) {
      storageService.setLocal(AUTH_STORAGE_KEYS.AUTH_TOKEN, state.authToken);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    }

    if (state.refreshToken) {
      storageService.setLocal(AUTH_STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    }

    if (state.user) {
      storageService.setLocal(AUTH_STORAGE_KEYS.USER, state.user);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.USER);
    }

    if (state.deviceId) {
      storageService.setLocal(AUTH_STORAGE_KEYS.DEVICE_ID, state.deviceId);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.DEVICE_ID);
    }

    if (state.lastActivity) {
      storageService.setLocal(AUTH_STORAGE_KEYS.LAST_ACTIVITY, state.lastActivity);
    }

    // Persist MFA session data (for multi-step auth flow)
    if (state.mfaRequired) {
      storageService.setLocal(AUTH_STORAGE_KEYS.MFA_REQUIRED, state.mfaRequired);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.MFA_REQUIRED);
    }

    if (state.loginReference) {
      storageService.setLocal(AUTH_STORAGE_KEYS.LOGIN_REFERENCE, state.loginReference);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.LOGIN_REFERENCE);
    }

    if (state.mfaData.length > 0) {
      storageService.setLocal(AUTH_STORAGE_KEYS.MFA_DATA, state.mfaData);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.MFA_DATA);
    }
  } catch (error) {
    console.error('Failed to persist auth state to storage:', error);
  }
}

/**
 * Clear all auth data from storage
 */
function clearAuthStorage(): void {
  const storageService = new StorageService();
  
  try {
    storageService.removeLocal(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    storageService.removeLocal(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    storageService.removeLocal(AUTH_STORAGE_KEYS.USER);
    storageService.removeLocal(AUTH_STORAGE_KEYS.DEVICE_ID);
    storageService.removeLocal(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    storageService.removeLocal(AUTH_STORAGE_KEYS.MFA_REQUIRED);
    storageService.removeLocal(AUTH_STORAGE_KEYS.LOGIN_REFERENCE);
    storageService.removeLocal(AUTH_STORAGE_KEYS.MFA_DATA);
  } catch (error) {
    console.error('Failed to clear auth storage:', error);
  }
}

/**
 * Authentication feature reducer
 * Handles all authentication state mutations and persists to storage
 */
export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,//initialAuthState,
    
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

// Export utility functions for external use
export { persistAuthState, clearAuthStorage };