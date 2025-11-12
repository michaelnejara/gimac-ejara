import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import * as AuthModels from '@core/models/auth.models';

/**
 * MFA Service
 * Handles Multi-Factor Authentication setup and verification
 */
@Injectable({
  providedIn: 'root'
})
export class MfaService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.mfa.apiUrl;

  /**
   * Get headers with MFA API credentials and auth token
   * @param authToken - Bearer token from login response
   * @returns HttpHeaders with client credentials and bearer token
   */
  private getHeaders(authToken: string): HttpHeaders {
    return new HttpHeaders({
      'client-key': environment.mfa.clientKey,
      'client-secret': environment.mfa.clientSecret,
      'Authorization': `Bearer ${authToken}`
    });
  }

  /**
   * Step 1: Setup authenticator (get QR code)
   *
   * @param {string} authToken - Temporary auth token from login
   * @returns {Observable<AuthModels.SetupAuthenticatorResponse>} QR code and setup key
   *
   * @example
   * this.mfaService.setupAuthenticator(authToken).subscribe(response => {
   *   console.log(response.data.qrCodeUri); // Display QR code
   *   console.log(response.data.setupKey); // Manual setup key
   * });
   */
  setupAuthenticator(authToken: string): Observable<AuthModels.SetupAuthenticatorResponse> {
    return this.http.post<AuthModels.SetupAuthenticatorResponse>(
      `${this.apiUrl}/api/v1/mfa/setup-authenticator`,
      {},
      { headers: this.getHeaders(authToken) }
    );
  }

  /**
   * Step 2: Validate authenticator code
   *
   * @param {AuthModels.ValidateAuthenticatorPayload} payload - Code from authenticator app
   * @param {string} authToken - Temporary auth token from login
   * @returns {Observable<AuthModels.ValidateAuthenticatorResponse>} Validation result
   *
   * @example
   * const payload = { code: '123456' };
   * this.mfaService.validateAuthenticator(payload, authToken).subscribe();
   */
  validateAuthenticator(
    payload: AuthModels.ValidateAuthenticatorPayload,
    authToken: string
  ): Observable<AuthModels.ValidateAuthenticatorResponse> {
    return this.http.post<AuthModels.ValidateAuthenticatorResponse>(
      `${this.apiUrl}/api/v1/mfa/validate-authenticator`,
      payload,
      { headers: this.getHeaders(authToken) }
    );
  }

  /**
   * Step 3: Verify MFA code and complete login
   *
   * @param {AuthModels.VerifyMfaCodePayload} payload - Verification code
   * @param {string} authToken - Temporary auth token from login
   * @returns {Observable<AuthModels.VerifyMfaCodeResponse>} Final auth tokens and user data
   *
   * @example
   * const payload = { data: [{ code: '123456' }] };
   * this.mfaService.verifyMfaCode(payload, authToken).subscribe(response => {
   *   // Login complete with response.data.authToken and response.data.refreshToken
   * });
   */
  verifyMfaCode(
    payload: AuthModels.VerifyMfaCodePayload,
    authToken: string
  ): Observable<AuthModels.VerifyMfaCodeResponse> {
    return this.http.post<AuthModels.VerifyMfaCodeResponse>(
      `${this.apiUrl}/api/v1/mfa/verify`,
      payload,
      { headers: this.getHeaders(authToken) }
    );
  }
}
