// src/app/store/auth/auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { initialAuthState, persistAuthState, clearAuthStorage, getDefaultInitialState } from './auth.state';

/**
 * Authentication Reducer
 * Handles all state mutations for authentication feature
 * 
 * Responsibilities:
 * - Processes all auth actions (login, logout, MFA, etc.)
 * - Updates state immutably
 * - Persists important data to localStorage
 * - Manages loading and error states
 * 
 * Flow:
 * 1. Action dispatched → Reducer receives action
 * 2. Reducer creates new state based on action type
 * 3. State persisted to localStorage (if needed)
 * 4. New state returned to store
 * 5. Components receive updated state via selectors
 */
export const authReducer = createReducer(
  initialAuthState,
  
  /**
   * Handle initial login start
   * 
   * Sets loading flag and clears any previous errors
   * Called when user submits login credentials
   * 
   * State changes:
   * - loading: true
   * - error: null
   */
  on(AuthActions.loginStart, (state) => {
    const newState = {
      ...state,
      loading: true,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle login success with MFA requirement
   * 
   * Called when initial login succeeds but MFA is required
   * Stores login reference and available MFA methods for next step
   * 
   * State changes:
   * - loading: false
   * - mfaRequired: true
   * - loginReference: set for MFA completion
   * - mfaData: available MFA methods
   * - error: null
   * 
   * @param response - Login response with MFA data
   */
  on(AuthActions.loginMfaRequired, (state, { response }) => {
    const newState = {
      ...state,
      loading: false,
      mfaRequired: response.data.shouldCompleteMfa,
      loginReference: response.data.loginReference,
      mfaData: response.data.mfaData,
      shouldVerifyPhoneNumber: response.data.shouldVerifyPhoneNumber,
      canAccessPanel: response.data.canAccessPanel,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle login failure
   * 
   * Called when login attempt fails (invalid credentials, network error, etc.)
   * Stores error for display to user
   * 
   * State changes:
   * - loading: false
   * - error: set with error details
   * 
   * @param error - Error response from API
   */
  on(AuthActions.loginFailure, (state, { error }) => {
    const newState = {
      ...state,
      loading: false,
      error
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle complete login start (OTP verification)
   * 
   * Called when user submits MFA code
   * Sets loading flag while verifying OTP
   * 
   * State changes:
   * - loading: true
   * - error: null
   */
  on(AuthActions.completeLoginStart, (state) => {
    const newState = {
      ...state,
      loading: true,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle complete login success
   * 
   * Called when MFA verification succeeds
   * Stores authentication tokens and marks user as authenticated
   * User data will be set separately by the effect
   * 
   * State changes:
   * - loading: false
   * - authToken: JWT token
   * - refreshToken: refresh token
   * - isAuthenticated: true
   * - mfaRequired: false (MFA completed)
   * - loginReference: null (no longer needed)
   * - lastActivity: current timestamp
   * - error: null
   * 
   * @param response - Complete login response with tokens
   */
  on(AuthActions.completeLoginSuccess, (state, { response }) => {
    const newState = {
      ...state,
      loading: false,
      authToken: response.data.authToken,
      refreshToken: response.data.refreshToken,
      user: state.user, // Will be updated by setUser action from effect
      isAuthenticated: true,
      mfaRequired: false,
      loginReference: null,
      error: null,
      lastActivity: new Date().toISOString()
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle complete login failure
   * 
   * Called when MFA verification fails (invalid OTP, expired, etc.)
   * Stores error for display to user
   * 
   * State changes:
   * - loading: false
   * - error: set with error details
   * 
   * @param error - Error response from API
   */
  on(AuthActions.completeLoginFailure, (state, { error }) => {
    const newState = {
      ...state,
      loading: false,
      error
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle set user action
   * 
   * Updates user information in state
   * Called by effects after mapping API response to User model
   * 
   * State changes:
   * - user: updated user data
   * 
   * @param user - User object with profile information
   */
  on(AuthActions.setUser, (state, { user }) => {
    const newState = {
      ...state,
      user
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle set device ID action
   * 
   * Stores unique device identifier for this session
   * Used for security and analytics
   * 
   * State changes:
   * - deviceId: unique device identifier
   * 
   * @param deviceId - Generated or retrieved device ID
   */
  on(AuthActions.setDeviceId, (state, { deviceId }) => {
    const newState = {
      ...state,
      deviceId
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle update activity action
   * 
   * Updates timestamp of last user activity
   * Used for session timeout and activity tracking
   * 
   * State changes:
   * - lastActivity: current timestamp
   */
  on(AuthActions.updateActivity, (state) => {
    const newState = {
      ...state,
      lastActivity: new Date().toISOString()
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle token refresh success
   * 
   * Updates tokens after successful refresh
   * Extends user session without requiring re-login
   * 
   * State changes:
   * - authToken: new JWT token
   * - refreshToken: new refresh token
   * - lastActivity: current timestamp
   * 
   * @param authToken - New authentication token
   * @param refreshToken - New refresh token
   */
  on(AuthActions.tokenRefreshSuccess, (state, { authToken, refreshToken }) => {
    const newState = {
      ...state,
      authToken,
      refreshToken,
      lastActivity: new Date().toISOString()
    };
    persistAuthState(newState);
    return newState;
  }),
  
  /**
   * Handle logout action
   * 
   * Clears all authentication state and localStorage
   * Returns to initial unauthenticated state
   * 
   * State changes:
   * - All fields reset to default values
   * - localStorage cleared
   * 
   * Security note:
   * - Ensures no sensitive data remains in memory or storage
   * - User must re-authenticate to access protected resources
   */
  on(AuthActions.logout, () => {
    clearAuthStorage();
    return getDefaultInitialState();
  }),
  
  /**
   * Handle clear error action
   *
   * Removes current error from state
   * Typically called when user dismisses error message
   *
   * State changes:
   * - error: null
   */
  on(AuthActions.clearError, (state) => {
    const newState = {
      ...state,
      error: null
    };
    return newState;
  }),

  /**
   * Handle login MFA setup required
   *
   * Called when login succeeds but user needs to set up MFA (shouldCompleteMfa: false)
   * Stores temporary auth token and sets flags for setup flow
   *
   * State changes:
   * - loading: false
   * - shouldCompleteMfa: false (indicates setup needed)
   * - setupAuthToken: temporary token for MFA API calls
   * - canAccessPanel: from response
   * - shouldVerifyPhoneNumber: from response
   * - error: null
   *
   * @param response - Login response with setup auth token
   */
  on(AuthActions.loginMfaSetupRequired, (state, { response }) => {
    const newState = {
      ...state,
      loading: false,
      shouldCompleteMfa: response.shouldCompleteMfa,
      setupAuthToken: response.authToken,
      canAccessPanel: response.canAccessPanel,
      shouldVerifyPhoneNumber: response.shouldVerifyPhoneNumber,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle setup MFA authenticator start
   *
   * Called when initiating QR code request
   * Sets loading flag while fetching QR code
   *
   * State changes:
   * - loading: true
   * - error: null
   */
  on(AuthActions.setupMfaAuthenticatorStart, (state) => {
    const newState = {
      ...state,
      loading: true,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle setup MFA authenticator success
   *
   * Called when QR code is successfully retrieved
   * Stores QR code data URI and setup key for display
   *
   * State changes:
   * - loading: false
   * - qrCodeUri: QR code image data URI
   * - setupKey: manual setup key
   * - error: null
   *
   * @param response - Setup authenticator response with QR code
   */
  on(AuthActions.setupMfaAuthenticatorSuccess, (state, { response }) => {
    const newState = {
      ...state,
      loading: false,
      qrCodeUri: response.data.qrCodeUri,
      setupKey: response.data.setupKey,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle setup MFA authenticator failure
   *
   * Called when QR code request fails
   * Stores error for display to user
   *
   * State changes:
   * - loading: false
   * - error: set with error details
   *
   * @param error - Error response from API
   */
  on(AuthActions.setupMfaAuthenticatorFailure, (state, { error }) => {
    const newState = {
      ...state,
      loading: false,
      error
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle validate MFA authenticator start
   *
   * Called when user submits code from authenticator app
   * Sets loading flag while validating code
   *
   * State changes:
   * - loading: true
   * - error: null
   */
  on(AuthActions.validateMfaAuthenticatorStart, (state) => {
    const newState = {
      ...state,
      loading: true,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle validate MFA authenticator success
   *
   * Called when authenticator code is successfully validated
   * Code is valid, user can now proceed to final verification
   *
   * State changes:
   * - loading: false
   * - error: null
   */
  on(AuthActions.validateMfaAuthenticatorSuccess, (state) => {
    const newState = {
      ...state,
      loading: false,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle validate MFA authenticator failure
   *
   * Called when authenticator code validation fails
   * Stores error for display to user
   *
   * State changes:
   * - loading: false
   * - error: set with error details
   *
   * @param error - Error response from API
   */
  on(AuthActions.validateMfaAuthenticatorFailure, (state, { error }) => {
    const newState = {
      ...state,
      loading: false,
      error
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle verify MFA code start
   *
   * Called when completing final MFA verification
   * Sets loading flag while verifying
   *
   * State changes:
   * - loading: true
   * - error: null
   */
  on(AuthActions.verifyMfaCodeStart, (state) => {
    const newState = {
      ...state,
      loading: true,
      error: null
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle verify MFA code success
   *
   * Called when MFA verification succeeds and login is complete
   * Stores final authentication tokens and marks user as authenticated
   * Clears MFA setup data as setup is complete
   *
   * State changes:
   * - loading: false
   * - authToken: final JWT token
   * - refreshToken: refresh token
   * - isAuthenticated: true
   * - shouldCompleteMfa: null (setup complete)
   * - setupAuthToken: null (no longer needed)
   * - qrCodeUri: null (no longer needed)
   * - setupKey: null (no longer needed)
   * - lastActivity: current timestamp
   * - error: null
   *
   * @param response - Verify MFA code response with final tokens
   */
  on(AuthActions.verifyMfaCodeSuccess, (state, { response }) => {
    const newState = {
      ...state,
      loading: false,
      authToken: response.data.authToken,
      refreshToken: response.data.refreshToken,
      user: state.user, // Will be updated by setUser action from effect
      isAuthenticated: true,
      shouldCompleteMfa: null,
      setupAuthToken: null,
      qrCodeUri: null,
      setupKey: null,
      error: null,
      lastActivity: new Date().toISOString()
    };
    persistAuthState(newState);
    return newState;
  }),

  /**
   * Handle verify MFA code failure
   *
   * Called when MFA verification fails
   * Stores error for display to user
   *
   * State changes:
   * - loading: false
   * - error: set with error details
   *
   * @param error - Error response from API
   */
  on(AuthActions.verifyMfaCodeFailure, (state, { error }) => {
    const newState = {
      ...state,
      loading: false,
      error
    };
    persistAuthState(newState);
    return newState;
  })
);