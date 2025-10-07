/**
 * Interceptor Marker Constants
 * 
 * Path suffixes used to trigger specific interceptors.
 * These suffixes are automatically removed by the interceptors.
 */
export const INTERCEPTOR_MARKERS = {
  /** Triggers gimacPaymentCredentialsInterceptor */
  GIMAC: '/gimac-interceptor',
  
  /** Triggers clientCredentialsInterceptor */
  CLIENT: '/client-interceptor',
  
  /** No special interceptor (default behavior with auth only) */
  NONE: ''
} as const;

/**
 * Helper function to add interceptor marker to URL
 * 
 * @param url - Base URL
 * @param marker - Marker to add
 * @returns URL with marker appended
 * 
 * @example
 * ```typescript
 * const url = addMarker('/api/users', INTERCEPTOR_MARKERS.GIMAC);
 * // Returns: '/api/users/gimac-interceptor'
 * ```
 */
export function addInterceptorMarker(url: string, marker: string): string {
  return `${url}${marker}`;
}