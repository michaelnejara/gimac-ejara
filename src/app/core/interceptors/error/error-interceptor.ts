import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, timer } from 'rxjs';
import { throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification/notification.service';
import { ErrorLoggingService } from '@core/services/error-boundary/error-logging.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '@store/auth/auth.actions';
import * as ErrorModels from '@core/models/error.models';



/**
 * Error Interceptor
 * Handles all HTTP errors globally with proper user feedback and logging
 * 
 * Features:
 * - Automatic retry for network errors
 * - User-friendly error messages
 * - Error logging and monitoring
 * - Special handling for authentication errors
 * - Network connectivity detection
 * - Rate limiting error handling
 * 
 * @param {HttpRequest} req - The outgoing HTTP request
 * @param {HttpHandlerFn} next - The next handler in the chain
 * @returns {Observable<HttpEvent>} The HTTP response or error
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const errorLoggingService = inject(ErrorLoggingService);
  const router = inject(Router);
  const store = inject(Store);

  // Check if error handling should be skipped
  const skipErrorHandler = req.headers.has('X-Skip-Error-Handler');

  return next(req).pipe(
    // Retry logic for network errors
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Only retry on network errors or 5xx server errors
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0 || (error.status >= 500 && error.status < 600)) {
            const delayTime = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
            console.log(`Retrying request (attempt ${retryCount}) after ${delayTime}ms`);
            return timer(delayTime);
          }
        }
        throw error;
      }
    }),
    
    // Error handling
    catchError((error: HttpErrorResponse) => {
      // Skip if explicitly requested
      if (skipErrorHandler) {
        return throwError(() => error);
      }

      // Log the error
      logError(error, req.url, req.method, errorLoggingService);

      // Handle different error types
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        handleClientError(error, notificationService);
      } else if (error.status === 0) {
        // Network error (no connection)
        handleNetworkError(notificationService);
      } else {
        // Server-side error
        handleServerError(error, notificationService, router, store);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Handle client-side errors
 * @private
 */
function handleClientError(
  error: HttpErrorResponse,
  notificationService: NotificationService
): void {
  console.error('Client Error:', error.error);

  notificationService.showError(
    'Application Error',
    'An unexpected error occurred. Please refresh the page and try again.'
  );
}

/**
 * Handle network errors
 * @private
 */
function handleNetworkError(notificationService: NotificationService): void {
  notificationService.showError(
    'Network Error',
    'Unable to connect to the server. Please check your internet connection.',
    0 // Persistent until dismissed
  );
}

/**
 * Handle server-side errors
 * @private
 */
function handleServerError(
  error: HttpErrorResponse,
  notificationService: NotificationService,
  router: Router,
  store: Store
): void {
  const apiError = error.error as ErrorModels.ApiErrorResponse;
  
  switch (error.status) {
    case 400: // Bad Request
      handleBadRequest(apiError, notificationService);
      break;
      
    case 401: // Unauthorized
      handleUnauthorized(notificationService, router, store);
      break;
      
    case 403: // Forbidden
      handleForbidden(notificationService, router);
      break;
      
    case 404: // Not Found
      handleNotFound(apiError, notificationService);
      break;
      
    case 409: // Conflict
      handleConflict(apiError, notificationService);
      break;
      
    case 422: // Unprocessable Entity (Validation Error)
      handleValidationError(apiError, notificationService);
      break;
      
    case 429: // Too Many Requests
      handleRateLimit(notificationService);
      break;
      
    case 500: // Internal Server Error
      handleInternalServerError(apiError, notificationService);
      break;
      
    case 502: // Bad Gateway
    case 503: // Service Unavailable
    case 504: // Gateway Timeout
      handleServiceUnavailable(error.status, notificationService);
      break;
      
    default:
      handleGenericError(apiError, notificationService);
  }
}

/**
 * Handle 400 Bad Request errors
 * @private
 */
function handleBadRequest(
  apiError: ErrorModels.ApiErrorResponse,
  notificationService: NotificationService
): void {
  const message = apiError?.message || 'Invalid request. Please check your input.';
  
  notificationService.showError('Invalid Request', message);
}

/**
 * Handle 401 Unauthorized errors
 * @private
 */
function handleUnauthorized(
  notificationService: NotificationService,
  router: Router,
  store: Store
): void {
  // Dispatch logout action
  store.dispatch(AuthActions.logout());
  
  notificationService.showWarning(
    'Session Expired',
    'Your session has expired. Please log in again.'
  );
  
  // Navigate to login
  router.navigate(['/auth/login']);
}

/**
 * Handle 403 Forbidden errors
 * @private
 */
function handleForbidden(
  notificationService: NotificationService,
  router: Router
): void {
  notificationService.showError(
    'Access Denied',
    'You do not have permission to access this resource.'
  );
  
  // Navigate to dashboard or previous page
  router.navigate(['/dashboard']);
}

/**
 * Handle 404 Not Found errors
 * @private
 */
function handleNotFound(
  apiError: ErrorModels.ApiErrorResponse,
  notificationService: NotificationService
): void {
  const message = apiError?.message || 'The requested resource was not found.';
  
  // Don't show notification for silent 404s
  if (!message.includes('silent')) {
    notificationService.showWarning('Not Found', message);
  }
}

/**
 * Handle 409 Conflict errors
 * @private
 */
function handleConflict(
  apiError: ErrorModels.ApiErrorResponse,
  notificationService: NotificationService
): void {
  const message = apiError?.message || 'A conflict occurred. The resource may have been modified.';
  
  notificationService.showWarning('Conflict', message);
}

/**
 * Handle 422 Validation errors
 * @private
 */
function handleValidationError(
  apiError: ErrorModels.ApiErrorResponse,
  notificationService: NotificationService
): void {
  if (apiError?.validationErrors && apiError.validationErrors.length > 0) {
    // Show first validation error
    const firstError = apiError.validationErrors[0];
    notificationService.showError(
      'Validation Error',
      `${firstError.field}: ${firstError.message}`
    );
  } else {
    notificationService.showError(
      'Validation Error',
      apiError?.message || 'Please check your input and try again.'
    );
  }
}

/**
 * Handle 429 Rate Limit errors
 * @private
 */
function handleRateLimit(notificationService: NotificationService): void {
  notificationService.showWarning(
    'Too Many Requests',
    'You are making too many requests. Please wait a moment and try again.',
    10000
  );
}

/**
 * Handle 500 Internal Server errors
 * @private
 */
function handleInternalServerError(
  apiError: ErrorModels.ApiErrorResponse,
  notificationService: NotificationService
): void {
  console.error('Server Error:', apiError);
  
  notificationService.showError(
    'Server Error',
    'An internal server error occurred. Our team has been notified.',
    0 // Persistent
  );
}

/**
 * Handle 502/503/504 Service Unavailable errors
 * @private
 */
function handleServiceUnavailable(
  status: number,
  notificationService: NotificationService
): void {
  const messages: Record<number, string> = {
    502: 'The server is temporarily unavailable. Please try again later.',
    503: 'The service is currently under maintenance. Please try again later.',
    504: 'The request timed out. Please try again.'
  };
  
  notificationService.showError(
    'Service Unavailable',
    messages[status] || 'The service is temporarily unavailable.',
    0 // Persistent
  );
}

/**
 * Handle generic errors
 * @private
 */
function handleGenericError(
  apiError: ErrorModels.ApiErrorResponse,
  notificationService: NotificationService
): void {
  const message = apiError?.message || 'An unexpected error occurred. Please try again.';
  
  notificationService.showError('Error', message);
}

/**
 * Log error for monitoring
 * @private
 */
function logError(
  error: HttpErrorResponse,
  url: string,
  method: string,
  errorLoggingService: ErrorLoggingService
): void {
  const apiError = error.error as ErrorModels.ApiErrorResponse;
  
  errorLoggingService.logError({
    type: error.status === 0 ? 'network' : 'http',
    statusCode: error.status,
    message: apiError?.message || error.message || 'Unknown error',
    url,
    method,
    details: {
      errorCode: apiError?.errorCode,
      statusText: error.statusText,
      timestamp: new Date().toISOString(),
      validationErrors: apiError?.validationErrors
    }
  });
}