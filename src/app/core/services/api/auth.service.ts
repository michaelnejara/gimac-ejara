import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Store } from '@ngrx/store';
import { selectLoginReference } from '@store/auth/auth.state';
import { take } from 'rxjs/operators';
import * as AuthModels from '@core/models/auth.models';

/**
 * Authentication Service
 * Handles all authentication HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(Store);

  /**
   * First step: Login with username and password
   * Returns MFA requirement response
   * 
   * @param {AuthModels.LoginPayload} payload - Complete login payload with geolocation
   * @returns {Observable<AuthModels.LoginMfaResponse>} MFA requirement response
   * 
   * @example
   * const payload = {
   *   usernameOrPhoneNumber: 'recitMichael',
   *   password: '123456789',
   *   loginOption: 'username',
   *   ipAddress: '143.105.152.133',
   *   latitude: '3.86169',
   *   longitude: '11.52023',
   *   deviceId: 'd4ae99a8-ebe9-4502-82a6-5cff200f1e68'
   * };
   * this.authService.login(payload).subscribe();
   */
  login(payload: AuthModels.LoginPayload): Observable<AuthModels.LoginMfaResponse> {
    return this.http.post<AuthModels.LoginMfaResponse>(
      `${environment.nellysCoin.apiUrl}/authentication/login`,
      payload
    );
  }

  /**
   * Second step: Complete login with OTP code
   * Returns authentication tokens and user data
   * 
   * @param {string} otpCode - 6-digit OTP from authenticator app
   * @returns {Observable<AuthModels.LoginSuccessResponse>} Complete auth response with tokens
   * 
   * @example
   * this.authService.completeLogin('522453').subscribe();
   */
  completeLogin(otpCode: string): Observable<AuthModels.LoginSuccessResponse> {
    let loginReference: string | null = null;
    
    // Get login reference from store synchronously
    this.store.select(selectLoginReference)
      .pipe(take(1))
      .subscribe(ref => loginReference = ref);

    if (!loginReference) {
      throw new Error('No login reference found. Please login first.');
    }

    const payload: AuthModels.CompleteLoginPayload = {
      otpCode,
      loginReference
    };

    return this.http.post<AuthModels.LoginSuccessResponse>(
      `${environment.nellysCoin.apiUrl}/authentication/complete-login`,
      payload
    );
  }

  /**
   * Refresh authentication token
   * Uses refresh token to get new auth token
   * 
   * @returns {Observable<{authToken: string, refreshToken: string}>} New tokens
   */
  refreshToken(): Observable<{ authToken: string; refreshToken: string }> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<{ authToken: string; refreshToken: string }>(
      `${environment.apiUrl}/authentication/refresh`,
      { refreshToken }
    );
  }

  /**
   * Map CustomerData to simplified User interface
   * Converts API response to application user model
   * 
   * @param {AuthModels.CustomerData} customerData - Raw customer data from API
   * @returns {AuthModels.User} Simplified user object
   */
  mapCustomerDataToUser(customerData: AuthModels.CustomerData): AuthModels.User {
    return {
      id: customerData.id,
      username: customerData.username,
      email: customerData.emailAddress,
      fullName: `${customerData.firstName} ${customerData.lastName}`,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phoneNumber: customerData.phoneNumber,
      avatar: customerData.avatar,
      accountType: customerData.accountType,
      accountStatus: customerData.accountStatus,
      roles: customerData.roles || [],
      permissions: customerData.permissions || [],
      kycLevel: customerData.kycLevel,
      countryCode: customerData.countryCode,
      countryName: customerData.countryName,
      currencyCode: customerData.currencyCode,
      preferredLanguage: customerData.preferredLanguage,
      isEmailVerified: customerData.isEmailVerified === 1,
      isPhoneVerified: customerData.isPhoneNumberVerified === 1,
      canAccessPanel: customerData.accountType === 'admin',
      companyName: customerData.companyName,
      companyCode: customerData.companyCode,
      createdAt: customerData.createdAt,
    };
  }
}
