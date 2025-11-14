import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environment';

/**
 * Gimac Payment Credentials Interceptor
 * 
 * Automatically adds client key and secret to all outgoing HTTP requests.
 * This provides application-level authentication to the API.
 * 
 * Headers Added:
 * - client-key: Identifies the client application
 * - client-secret: Authenticates the client application
 * 
 * This interceptor should be registered BEFORE the auth interceptor
 * in the providers array to ensure client credentials are added first,
 * followed by user-specific bearer tokens.
 * 
 * Configuration:
 * Gimac credentials are stored in environment files for different
 * deployment environments (development, staging, production).
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([
 *     GimacPaymentCredentialsInterceptor, // First
 *     authInterceptor                // Second
 *   ])
 * )
 * ```
 *
 *  @example
 * ```typescript
 * // In service:
 * this.http.get('/api/dashboard/stats/gimac-interceptor');
 * 
 * // Interceptor processes:
 * // 1. Detects '/gimac-interceptor' suffix
 * // 2. Adds client-key and client-secret headers
 * // 3. Removes suffix -> actual request to '/api/dashboard/stats'
 * ```
 * 
 * @security
 * - Gimac Payment credentials should be different per environment
 * - Never commit production credentials to version control
 * - Use environment variables for sensitive credentials
 * - Rotate credentials regularly
 */
export const GimacPaymentCredentialsInterceptor: HttpInterceptorFn = (req, next) => {

  const GIMAC_MARKER = '/gimac-interceptor';

  /**
   * Clone the request and add Gimac credential headers
   * 
   * Headers are added to all requests regardless of URL or method.
   * If you need to exclude certain endpoints, add conditional logic here.
   * 
   * Check if the URL ends with the Gimac interceptor marker
   */
  if (req.url.endsWith(GIMAC_MARKER)) {
    // Remove the marker from the URL
    const cleanUrl = req.url.slice(0, -GIMAC_MARKER.length);

    // Clone the request with cleaned URL and add Gimac credentials
    const clonedRequest = req.clone({
      url: cleanUrl,
      setHeaders: {
        'client-key': environment.gimacTbB2B.clientKey,
        'client-secret': environment.gimacTbB2B.clientSecret
      }
    });

    // Pass the modified request to the next handler
    return next(clonedRequest);
  }

  // If URL doesn't have the marker, pass through unchanged
  return next(req);
};