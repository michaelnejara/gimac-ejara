import { createActionGroup, emptyProps, props } from '@ngrx/store';
// Update the import path to the correct relative location
import * as AuthModels from '@core/models/auth.models';

/**
 * Authentication Actions
 * Defines all authentication-related actions
 */
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    /**
     * Initiate login with username/password
     * Dispatched when user submits login form
     */
    'Login Start': props<{ 
      usernameOrPhoneNumber: string;
      password: string;
      loginOption: 'username' | 'phone' | 'email';
    }>(),
    
    /**
     * Login successful, MFA required
     * Dispatched when first auth step succeeds
     */
    'Login Mfa Required': props<{ response: AuthModels.LoginMfaResponse }>(),
    
    /**
     * Login failed
     * Dispatched when first auth step fails
     */
    'Login Failure': props<{ error: AuthModels.LoginErrorResponse }>(),
    
    /**
     * Complete login with OTP
     * Dispatched when user submits OTP code
     */
    'Complete Login Start': props<{ otpCode: string }>(),
    
    /**
     * Complete login successful
     * Dispatched when OTP verification succeeds
     */
    'Complete Login Success': props<{ response: AuthModels.LoginSuccessResponse }>(),
    
    /**
     * Complete login failed
     * Dispatched when OTP verification fails
     */
    'Complete Login Failure': props<{ error: AuthModels.LoginErrorResponse }>(),
    
    /**
     * Set user data in store
     * Dispatched after mapping CustomerData to User
     */
    'Set User': props<{ user: AuthModels.User }>(),
    
    /**
     * Set device ID
     * Dispatched after generating device identifier
     */
    'Set Device Id': props<{ deviceId: string }>(),
    
    /**
     * Update last activity timestamp
     * Dispatched on user actions
     */
    'Update Activity': emptyProps(),
    
    /**
     * Refresh auth token
     * Dispatched when token needs refresh
     */
    'Token Refresh Start': emptyProps(),
    
    /**
     * Token refresh successful
     * Dispatched when token refresh succeeds
     */
    'Token Refresh Success': props<{ authToken: string; refreshToken: string }>(),
    
    /**
     * Token refresh failed
     * Dispatched when token refresh fails
     */
    'Token Refresh Failure': emptyProps(),
    
    /**
     * Logout user
     * Dispatched when user logs out or token expires
     */
    'Logout': emptyProps(),
    
    /**
     * Clear error state
     * Dispatched to reset error messages
     */
    'Clear Error': emptyProps(),

    /**
     * Initialize auth from storage
     * Dispatched on app startup
     */
    'Initialize From Storage': emptyProps(),

    /**
     * Login requires MFA setup (shouldCompleteMfa: false)
     * Dispatched when login succeeds but user needs to set up MFA
     */
    'Login Mfa Setup Required': props<{ response: AuthModels.LoginSetupMfaResponse }>(),

    /**
     * Setup MFA authenticator - get QR code
     * Dispatched when user enters MFA setup flow
     */
    'Setup Mfa Authenticator Start': emptyProps(),

    /**
     * Setup MFA authenticator successful
     * Dispatched when QR code is received from API
     */
    'Setup Mfa Authenticator Success': props<{ response: AuthModels.SetupAuthenticatorResponse }>(),

    /**
     * Setup MFA authenticator failed
     * Dispatched when QR code request fails
     */
    'Setup Mfa Authenticator Failure': props<{ error: any }>(),

    /**
     * Validate MFA authenticator code
     * Dispatched when user submits code from authenticator app
     */
    'Validate Mfa Authenticator Start': props<{ code: string }>(),

    /**
     * Validate MFA authenticator successful
     * Dispatched when authenticator code is validated
     */
    'Validate Mfa Authenticator Success': props<{ response: AuthModels.ValidateAuthenticatorResponse }>(),

    /**
     * Validate MFA authenticator failed
     * Dispatched when authenticator code validation fails
     */
    'Validate Mfa Authenticator Failure': props<{ error: any }>(),

    /**
     * Verify MFA code and complete login
     * Dispatched when user completes MFA setup
     */
    'Verify Mfa Code Start': props<{ code: string }>(),

    /**
     * Verify MFA code successful - login complete
     * Dispatched when MFA verification succeeds and user is logged in
     */
    'Verify Mfa Code Success': props<{ response: AuthModels.VerifyMfaCodeResponse }>(),

    /**
     * Verify MFA code failed
     * Dispatched when MFA verification fails
     */
    'Verify Mfa Code Failure': props<{ error: any }>(),
  }
});