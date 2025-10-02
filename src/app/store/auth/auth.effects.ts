import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@core/services/api/auth.service';
import { GeolocationService } from '@core/services/api/geolocation.service';
import { StorageService } from '@core/services/storage/storage.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { UuidUtils } from '@core/utils/uuid.utils';
import { AuthActions } from './auth.actions';
import * as AuthModels from '@core/models/auth.models';

/**
 * Authentication Effects
 * Handles side effects for authentication actions
 */
@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private geolocationService = inject(GeolocationService);
  private storageService = inject(StorageService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  /**
   * Login Effect
   * 
   * Flow:
   * 1. Get geolocation data
   * 2. Generate device ID
   * 3. Call login API
   * 4. Handle response (MFA required or error)
   * 
   * @dispatches AuthActions.loginMfaRequired - On successful login requiring MFA
   * @dispatches AuthActions.loginFailure - On login failure
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(({ usernameOrPhoneNumber, password, loginOption }) => {
        // Get geolocation data
        return this.geolocationService.getGeolocation().pipe(
          switchMap(geoData => {
            // Generate or get device ID
            let deviceId = this.storageService.getLocal<string>('device_id');
            if (!deviceId) {
              deviceId = UuidUtils.v4();
              this.storageService.setLocal('device_id', deviceId);
            }

            // Build complete login payload
            const payload: AuthModels.LoginPayload = {
              usernameOrPhoneNumber,
              password,
              loginOption,
              ipAddress: geoData.ipAddress,
              latitude: geoData.latitude,
              longitude: geoData.longitude,
              deviceId
            };

            // Call login API
            return this.authService.login(payload).pipe(
              map(response => AuthActions.loginMfaRequired({ response })),
              catchError(error => {
                const errorResponse: AuthModels.LoginErrorResponse = {
                  errorCode: error.error?.errorCode || 'unknown_error',
                  message: error.error?.message || 'An unexpected error occurred'
                };
                return of(AuthActions.loginFailure({ error: errorResponse }));
              })
            );
          }),
          catchError(error => {
            const errorResponse: AuthModels.LoginErrorResponse = {
              errorCode: 'geolocation_error',
              message: 'Failed to get location data. Please try again.'
            };
            return of(AuthActions.loginFailure({ error: errorResponse }));
          })
        );
      })
    )
  );

  /**
   * Login MFA Required Effect
   * 
   * Handles navigation when MFA is required
   * 
   * @dispatches None - Side effect only (navigation)
   */
  loginMfaRequired$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginMfaRequired),
        tap(({ response }) => {
          // Navigate to MFA verification page
          this.router.navigate(['/auth/mfa-verify']);
          
          // Show notification
          this.notificationService.showInfo(
            'MFA Verification Required',
            'Please enter your 6-digit authentication code'
          );
        })
      ),
    { dispatch: false }
  );

  /**
   * Login Failure Effect
   * 
   * Shows error notification on login failure
   * 
   * @dispatches None - Side effect only (notification)
   */
  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          // Map error codes to user-friendly messages
          let userMessage = error.message;
          
          switch (error.errorCode) {
            case 'incorrectUsernameCredentials':
              userMessage = 'Incorrect username or password';
              break;
            case 'account_suspended':
              userMessage = 'Your account has been suspended';
              break;
            case 'account_not_verified':
              userMessage = 'Please verify your account first';
              break;
          }
          
          this.notificationService.showError('Login Failed', userMessage);
        })
      ),
    { dispatch: false }
  );

  /**
   * Complete Login Effect
   * 
   * Flow:
   * 1. Call complete login API with OTP
   * 2. Store tokens
   * 3. Map customer data to user
   * 4. Navigate to dashboard
   * 
   * @dispatches AuthActions.completeLoginSuccess - On successful OTP verification
   * @dispatches AuthActions.setUser - To store mapped user data
   * @dispatches AuthActions.completeLoginFailure - On OTP verification failure
   */
  completeLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.completeLoginStart),
      switchMap(({ otpCode }) => {
        return this.authService.completeLogin(otpCode).pipe(
          switchMap(response => {
            // Store tokens
            this.storageService.setSession('auth_token', response.data.authToken);
            this.storageService.setLocal('refresh_token', response.data.refreshToken);
            
            // Map customer data to user
            const user = this.authService.mapCustomerDataToUser(response.data.customerData);
            this.storageService.setSession('user_data', user);
            
            // Dispatch multiple actions
            return [
              AuthActions.completeLoginSuccess({ response }),
              AuthActions.setUser({ user })
            ];
          }),
          catchError(error => {
            const errorResponse: AuthModels.LoginErrorResponse = {
              errorCode: error.error?.errorCode || 'invalid_otp',
              message: error.error?.message || 'Invalid authentication code'
            };
            return of(AuthActions.completeLoginFailure({ error: errorResponse }));
          })
        );
      })
    )
  );

  /**
   * Complete Login Success Effect
   * 
   * Handles navigation and notification after successful login
   * 
   * @dispatches None - Side effect only (navigation + notification)
   */
  completeLoginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.completeLoginSuccess),
        tap(({ response }) => {
          const customerData = response.data.customerData;
          const fullName = `${customerData.firstName} ${customerData.lastName}`;
          
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
          
          // Show welcome notification
          this.notificationService.showSuccess(
            `Welcome back, ${customerData.firstName}!`,
            'You have successfully logged in'
          );
        })
      ),
    { dispatch: false }
  );

  /**
   * Complete Login Failure Effect
   * 
   * Shows error notification on OTP verification failure
   * 
   * @dispatches None - Side effect only (notification)
   */
  completeLoginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.completeLoginFailure),
        tap(({ error }) => {
          let userMessage = error.message;
          
          switch (error.errorCode) {
            case 'invalid_otp':
              userMessage = 'Invalid authentication code. Please try again.';
              break;
            case 'otp_expired':
              userMessage = 'Authentication code has expired. Please login again.';
              break;
            case 'max_attempts_exceeded':
              userMessage = 'Too many failed attempts. Please try again later.';
              break;
          }
          
          this.notificationService.showError('Verification Failed', userMessage);
        })
      ),
    { dispatch: false }
  );

  /**
   * Token Refresh Effect
   * 
   * Refreshes authentication token when needed
   * 
   * @dispatches AuthActions.tokenRefreshSuccess - On successful refresh
   * @dispatches AuthActions.tokenRefreshFailure - On refresh failure (triggers logout)
   */
  tokenRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.tokenRefreshStart),
      switchMap(() => {
        return this.authService.refreshToken().pipe(
          map(response => {
            // Store new tokens
            this.storageService.setSession('auth_token', response.authToken);
            this.storageService.setLocal('refresh_token', response.refreshToken);
            
            return AuthActions.tokenRefreshSuccess({ 
              authToken: response.authToken, 
              refreshToken: response.refreshToken 
            });
          }),
          catchError(() => {
            // Token refresh failed, logout user
            return of(AuthActions.tokenRefreshFailure());
          })
        );
      })
    )
  );

  /**
   * Token Refresh Failure Effect
   * 
   * Logs out user when token refresh fails
   * 
   * @dispatches AuthActions.logout
   */
  tokenRefreshFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.tokenRefreshFailure),
      map(() => AuthActions.logout())
    )
  );

  /**
   * Logout Effect
   * 
   * Cleans up storage and navigates to login
   * 
   * @dispatches None - Side effect only (cleanup + navigation)
   */
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          // Clear all auth-related storage
          this.storageService.removeSession('auth_token');
          this.storageService.removeSession('user_data');
          this.storageService.removeLocal('refresh_token');
          
          // Navigate to login
          this.router.navigate(['/auth/login']);
          
          // Show notification
          this.notificationService.showInfo(
            'Logged Out',
            'You have been successfully logged out'
          );
        })
      ),
    { dispatch: false }
  );

  /**
   * Initialize From Storage Effect
   * 
   * Restores auth state from storage on app startup
   * 
   * @dispatches AuthActions.setUser - If valid session found
   * @dispatches AuthActions.setDeviceId - To restore device ID
   */
  initializeFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeFromStorage),
      switchMap(() => {
        const authToken = this.storageService.getSession<string>('auth_token');
        const refreshToken = this.storageService.getLocal<string>('refresh_token');
        const userData = this.storageService.getSession<AuthModels.User>('user_data');
        const deviceId = this.storageService.getLocal<string>('device_id');
        
        const actions = [];
        
        if (authToken && refreshToken && userData) {
          // Valid session found, restore user
          actions.push(
            AuthActions.completeLoginSuccess({ 
              response: {
                message: 'Session restored',
                data: {
                  authToken,
                  refreshToken,
                  customerData: null as any // Not needed for restoration
                }
              }
            }),
            AuthActions.setUser({ user: userData })
          );
        }
        
        if (deviceId) {
          actions.push(AuthActions.setDeviceId({ deviceId }));
        }
        
        return actions;
      })
    )
  );
}