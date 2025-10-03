import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, switchMap, take } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { selectAuthToken } from '@store/auth/auth.state';
import { AuthActions } from '@store/auth/auth.actions';
import { environment } from '@environments/environment';

/**
 * Authentication Interceptor
 * Adds auth token to outgoing requests and handles 401 errors
 * 
 * @param {HttpRequest} req - The outgoing HTTP request
 * @param {HttpHandlerFn} next - The next handler in the chain
 * @returns {Observable<HttpEvent>} The HTTP response
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  
  // Skip auth for login endpoints
  const skipAuth = [
    '/authentication/login',
    '/authentication/complete-login',
    '/authentication/refresh',
    '/passwords/',
    'ipgeolocation.io'
  ].some(endpoint => req.url.includes(endpoint));

  // Add auth header if token exists
  let authReq = req;

  // Add language header and credentials
  const language = localStorage.getItem('app-language') || 'en';
  authReq = authReq.clone({
    setHeaders: {
      'Accept-Language': language,
      'client-key': environment.nellysCoin.clientKey,
      'client-secret': environment.nellysCoin.clientSecret
    }
  });

  if (skipAuth) {
    return next(authReq);
  }

  // Get token from store
  let authToken: string | null = null;
  store.select(selectAuthToken)
    .pipe(take(1))
    .subscribe(token => authToken = token);

  if (authToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && !skipAuth) {
        // Try to refresh token
        store.dispatch(AuthActions.tokenRefreshStart());
        
        // Return error, effect will handle token refresh
        return throwError(() => error);
      }
      
      return throwError(() => error);
    })
  );
};