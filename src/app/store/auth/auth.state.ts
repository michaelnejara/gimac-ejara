import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as AuthModels from '@core/models/auth.models';
import { StorageService } from '@core/services/storage/storage.service';

/**
 * Storage keys for auth state persistence
 * Defines all localStorage keys used for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  DEVICE_ID: 'device_id',
  LAST_ACTIVITY: 'last_activity',
  MFA_REQUIRED: 'mfa_required',
  LOGIN_REFERENCE: 'login_reference',
  MFA_DATA: 'mfa_data',
  SHOULD_COMPLETE_MFA: 'should_complete_mfa',
  SETUP_AUTH_TOKEN: 'setup_auth_token',
  QR_CODE_URI: 'qr_code_uri',
  SETUP_KEY: 'setup_key'
} as const;

/**
 * Authentication feature state interface
 * Manages all authentication-related state including user data,
 * tokens, MFA status, and session information
 */
export interface AuthState {
  /** Current authenticated user */
  user: AuthModels.User | null;
  /** JWT authentication token */
  authToken: string | null;
  /** JWT refresh token for obtaining new auth tokens */
  refreshToken: string | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether multi-factor authentication is required */
  mfaRequired: boolean;
  /** Available MFA methods for the user */
  mfaData: AuthModels.MfaData[];
  /** Login reference for MFA completion flow */
  loginReference: string | null;
  /** Whether phone number verification is needed */
  shouldVerifyPhoneNumber: boolean;
  /** Whether user has permission to access admin panel */
  canAccessPanel: boolean;
  /** Loading state for async authentication operations */
  loading: boolean;
  /** Current error if any authentication operation fails */
  error: AuthModels.LoginErrorResponse | null;
  /** Unique device identifier for this session */
  deviceId: string | null;
  /** ISO timestamp of last user activity */
  lastActivity: string | null;
  /** Whether MFA needs to be completed (true) or set up (false) */
  shouldCompleteMfa: boolean | null;
  /** Temporary auth token for MFA setup (when shouldCompleteMfa is false) */
  setupAuthToken: string | null;
  /** QR code data URI for authenticator app setup */
  qrCodeUri: string | null;
  /** Manual setup key for authenticator app */
  setupKey: string | null;
}

/**
 * Get default initial auth state
 * Returns a clean state with no authentication data
 * Used when storage is empty or on logout
 *
 * @returns Default AuthState with all null/false values
 */
function getDefaultInitialState(): AuthState {
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
    shouldCompleteMfa: null,
    setupAuthToken: null,
    qrCodeUri: null,
    setupKey: null,
  };
}

/**
 * Initialize auth state from storage
 * Loads persisted authentication data from localStorage on app startup
 * 
 * This function:
 * 1. Creates a StorageService instance
 * 2. Loads all persisted auth data from localStorage
 * 3. Reconstructs the authentication state
 * 4. Falls back to default state if storage read fails
 * 
 * @returns Initialized AuthState with persisted data or defaults
 * 
 * @example
 * ```typescript
 * // Called automatically during store initialization
 * const state = initializeAuthStateFromStorage();
 * // Returns state with user data if previously authenticated
 * ```
 */
function initializeAuthStateFromStorage(): AuthState {
  const storageService = new StorageService();

  try {
    // Load all persisted authentication data from localStorage
    const authToken = storageService.getLocal<string>(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = storageService.getLocal<string>(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const user = storageService.getLocal<AuthModels.User>(AUTH_STORAGE_KEYS.USER);
    const deviceId = storageService.getLocal<string>(AUTH_STORAGE_KEYS.DEVICE_ID);
    const lastActivity = storageService.getLocal<string>(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    const mfaRequired = storageService.getLocal<boolean>(AUTH_STORAGE_KEYS.MFA_REQUIRED);
    const loginReference = storageService.getLocal<string>(AUTH_STORAGE_KEYS.LOGIN_REFERENCE);
    const mfaData = storageService.getLocal<AuthModels.MfaData[]>(AUTH_STORAGE_KEYS.MFA_DATA);
    const shouldCompleteMfa = storageService.getLocal<boolean>(AUTH_STORAGE_KEYS.SHOULD_COMPLETE_MFA);
    const setupAuthToken = storageService.getLocal<string>(AUTH_STORAGE_KEYS.SETUP_AUTH_TOKEN);
    const qrCodeUri = storageService.getLocal<string>(AUTH_STORAGE_KEYS.QR_CODE_URI);
    const setupKey = storageService.getLocal<string>(AUTH_STORAGE_KEYS.SETUP_KEY);

    // Determine authentication status: user is authenticated if both token and user exist
    const isAuthenticated = !!(authToken && user);

    // Return reconstructed state with persisted data
    return {
      user: user || null,
      authToken: authToken || null,
      refreshToken: refreshToken || null,
      isAuthenticated,
      mfaRequired: mfaRequired || false,
      mfaData: mfaData || [],
      loginReference: loginReference || null,
      shouldVerifyPhoneNumber: false, // Don't persist this flag
      canAccessPanel: isAuthenticated, // Derive from authentication status
      loading: false,
      error: null,
      deviceId: deviceId || null,
      lastActivity: lastActivity || null,
      shouldCompleteMfa: shouldCompleteMfa ?? null,
      setupAuthToken: setupAuthToken || null,
      qrCodeUri: qrCodeUri || null,
      setupKey: setupKey || null,
    };
  } catch (error) {
    // If storage read fails, log error and return clean state
    console.error('Failed to initialize auth state from storage:', error);
    return getDefaultInitialState();
  }
}

/**
 * Initial authentication state
 * Automatically loads from localStorage on app startup
 * Falls back to default state if no persisted data exists
 */
export const initialAuthState: AuthState = initializeAuthStateFromStorage();

/**
 * Persist auth state to localStorage
 * Saves important authentication data for state restoration
 * 
 * This function:
 * 1. Saves tokens, user data, device ID
 * 2. Persists MFA session data for multi-step flows
 * 3. Removes data from storage when values are null
 * 4. Handles errors gracefully without breaking the app
 * 
 * Called automatically by the reducer after state changes
 * 
 * @param state - Current authentication state to persist
 * 
 * @example
 * ```typescript
 * // Called in reducer after successful login
 * const newState = { ...state, authToken: 'xyz', user: userData };
 * persistAuthState(newState);
 * ```
 */
export function persistAuthState(state: AuthState): void {
  const storageService = new StorageService();

  try {
    // Persist or remove auth token
    if (state.authToken) {
      storageService.setLocal(AUTH_STORAGE_KEYS.AUTH_TOKEN, state.authToken);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    }

    // Persist or remove refresh token
    if (state.refreshToken) {
      storageService.setLocal(AUTH_STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    }

    // Persist or remove user data
    if (state.user) {
      storageService.setLocal(AUTH_STORAGE_KEYS.USER, state.user);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.USER);
    }

    // Persist or remove device ID
    if (state.deviceId) {
      storageService.setLocal(AUTH_STORAGE_KEYS.DEVICE_ID, state.deviceId);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.DEVICE_ID);
    }

    // Always persist last activity if present
    if (state.lastActivity) {
      storageService.setLocal(AUTH_STORAGE_KEYS.LAST_ACTIVITY, state.lastActivity);
    }

    // Persist MFA session data (for multi-step authentication flow)
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

    // Persist MFA setup data (for setup flow)
    if (state.shouldCompleteMfa !== null) {
      storageService.setLocal(AUTH_STORAGE_KEYS.SHOULD_COMPLETE_MFA, state.shouldCompleteMfa);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.SHOULD_COMPLETE_MFA);
    }

    if (state.setupAuthToken) {
      storageService.setLocal(AUTH_STORAGE_KEYS.SETUP_AUTH_TOKEN, state.setupAuthToken);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.SETUP_AUTH_TOKEN);
    }

    if (state.qrCodeUri) {
      storageService.setLocal(AUTH_STORAGE_KEYS.QR_CODE_URI, state.qrCodeUri);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.QR_CODE_URI);
    }

    if (state.setupKey) {
      storageService.setLocal(AUTH_STORAGE_KEYS.SETUP_KEY, state.setupKey);
    } else {
      storageService.removeLocal(AUTH_STORAGE_KEYS.SETUP_KEY);
    }
  } catch (error) {
    console.error('Failed to persist auth state to storage:', error);
  }
}

/**
 * Clear all auth data from localStorage
 * Removes all authentication-related data on logout
 * 
 * This ensures:
 * - No sensitive data remains in browser storage
 * - Clean state for next login
 * - Security best practice on logout
 * 
 * @example
 * ```typescript
 * // Called in logout reducer or effect
 * clearAuthStorage();
 * ```
 */
export function clearAuthStorage(): void {
  const storageService = new StorageService();

  try {
    // Remove all auth-related items from localStorage
    storageService.removeLocal(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    storageService.removeLocal(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    storageService.removeLocal(AUTH_STORAGE_KEYS.USER);
    storageService.removeLocal(AUTH_STORAGE_KEYS.DEVICE_ID);
    storageService.removeLocal(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    storageService.removeLocal(AUTH_STORAGE_KEYS.MFA_REQUIRED);
    storageService.removeLocal(AUTH_STORAGE_KEYS.LOGIN_REFERENCE);
    storageService.removeLocal(AUTH_STORAGE_KEYS.MFA_DATA);
    storageService.removeLocal(AUTH_STORAGE_KEYS.SHOULD_COMPLETE_MFA);
    storageService.removeLocal(AUTH_STORAGE_KEYS.SETUP_AUTH_TOKEN);
    storageService.removeLocal(AUTH_STORAGE_KEYS.QR_CODE_URI);
    storageService.removeLocal(AUTH_STORAGE_KEYS.SETUP_KEY);
  } catch (error) {
    console.error('Failed to clear auth storage:', error);
  }
}

/**
 * Feature selector for accessing the auth state slice
 */
export const selectAuthState = createFeatureSelector<AuthState>('auth');

/**
 * Selector to get current user
 * @returns User object or null if not authenticated
 */
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

/**
 * Selector to get authentication token
 * @returns JWT auth token or null
 */
export const selectAuthToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.authToken
);

/**
 * Selector to get refresh token
 * @returns JWT refresh token or null
 */
export const selectRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.refreshToken
);

/**
 * Selector to check if user is authenticated
 * @returns true if user is logged in
 */
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

/**
 * Selector to check if MFA is required
 * @returns true if MFA needs to be completed
 */
export const selectMfaRequired = createSelector(
  selectAuthState,
  (state: AuthState) => state.mfaRequired
);

/**
 * Selector to get MFA methods data
 * @returns Array of available MFA methods
 */
export const selectMfaData = createSelector(
  selectAuthState,
  (state: AuthState) => state.mfaData
);

/**
 * Selector to get login reference
 * @returns Login reference string for MFA completion
 */
export const selectLoginReference = createSelector(
  selectAuthState,
  (state: AuthState) => state.loginReference
);

/**
 * Selector to check if phone verification is needed
 * @returns true if phone verification required
 */
export const selectShouldVerifyPhoneNumber = createSelector(
  selectAuthState,
  (state: AuthState) => state.shouldVerifyPhoneNumber
);

/**
 * Selector to check admin panel access
 * @returns true if user can access admin panel
 */
export const selectCanAccessPanel = createSelector(
  selectAuthState,
  (state: AuthState) => state.canAccessPanel
);

/**
 * Selector to get loading state
 * @returns true if auth operation in progress
 */
export const selectLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

/**
 * Selector to get error
 * @returns Error object or null
 */
export const selectError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

/**
 * Selector to get device ID
 * @returns Device ID string or null
 */
export const selectDeviceId = createSelector(
  selectAuthState,
  (state: AuthState) => state.deviceId
);

/**
 * Selector to get last activity timestamp
 * @returns ISO timestamp string or null
 */
export const selectLastActivity = createSelector(
  selectAuthState,
  (state: AuthState) => state.lastActivity
);

/**
 * Selector to check if MFA setup is required
 * @returns true/false/null - false means setup needed, true means verification needed
 */
export const selectShouldCompleteMfa = createSelector(
  selectAuthState,
  (state: AuthState) => state.shouldCompleteMfa
);

/**
 * Selector to get setup auth token
 * @returns Temporary auth token for MFA setup or null
 */
export const selectSetupAuthToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.setupAuthToken
);

/**
 * Selector to get QR code URI
 * @returns QR code data URI or null
 */
export const selectQrCodeUri = createSelector(
  selectAuthState,
  (state: AuthState) => state.qrCodeUri
);

/**
 * Selector to get setup key
 * @returns Manual setup key for authenticator or null
 */
export const selectSetupKey = createSelector(
  selectAuthState,
  (state: AuthState) => state.setupKey
);

// Export helper function for getting default state
export { getDefaultInitialState };