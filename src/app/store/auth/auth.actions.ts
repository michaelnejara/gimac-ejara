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
  }
});