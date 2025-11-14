// src/app/core/services/error-boundary/error-boundary.service.ts
import { Injectable, ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';
import { ErrorLoggingService } from './error-logging.service';
import { environment } from '@environments/environment';

/**
 * Global Error Boundary Service
 *
 * Implements Angular's ErrorHandler to catch all uncaught errors
 * Provides centralized error handling with logging and user notifications
 *
 * Usage: Provided in app.config.ts as the ErrorHandler
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorBoundaryService implements ErrorHandler {
  private notificationService = inject(NotificationService);
  private errorLoggingService = inject(ErrorLoggingService);
  private router = inject(Router);

  /** Track if we're currently handling an error to prevent loops */
  private isHandlingError = false;

  /** Errors to ignore (non-critical) */
  private ignoredErrors = [
    'Non-Error promise rejection',
    'ResizeObserver loop',
    'Loading chunk',
    'ChunkLoadError'
  ];

  /**
   * Main error handler implementation
   * Called by Angular for all uncaught errors
   *
   * @param error - The error that was thrown
   */
  handleError(error: Error | HttpErrorResponse): void {
    // Prevent error handling loops
    if (this.isHandlingError) {
      console.warn('Error handling loop detected, skipping:', error);
      return;
    }

    this.isHandlingError = true;

    try {
      // Determine error type and handle accordingly
      if (error instanceof HttpErrorResponse) {
        this.handleHttpError(error);
      } else if (error instanceof Error) {
        this.handleClientError(error);
      } else {
        this.handleUnknownError(error);
      }
    } catch (handlingError) {
      // Last resort: log to console if error handling itself fails
      console.error('Error in error handler:', handlingError);
      console.error('Original error:', error);
    } finally {
      this.isHandlingError = false;
    }
  }

  /**
   * Handle HTTP errors (from failed API calls)
   * @private
   */
  private handleHttpError(error: HttpErrorResponse): void {
    console.error('HTTP Error caught by Error Boundary:', error);

    // Log the error
    this.errorLoggingService.logHttpError(error, 'Global Error Handler');

    // Handle specific HTTP status codes
    switch (error.status) {
      case 0:
        // Network error
        this.notificationService.showError(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
        break;

      case 401:
        // Unauthorized - handled by interceptor, but show notification
        this.notificationService.showError(
          'Authentication Required',
          'Your session has expired. Please log in again.'
        );
        // Navigate to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
        break;

      case 403:
        // Forbidden
        this.notificationService.showError(
          'Access Denied',
          'You do not have permission to perform this action.'
        );
        break;

      case 404:
        // Not found
        this.notificationService.showWarning(
          'Not Found',
          'The requested resource could not be found.'
        );
        break;

      case 422:
        // Validation error
        const validationMessage = this.extractValidationMessage(error);
        this.notificationService.showWarning(
          'Validation Error',
          validationMessage
        );
        break;

      case 429:
        // Too many requests
        this.notificationService.showWarning(
          'Too Many Requests',
          'You have made too many requests. Please try again later.'
        );
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        this.notificationService.showError(
          'Server Error',
          'An error occurred on the server. Our team has been notified.'
        );
        break;

      default:
        // Generic HTTP error
        this.notificationService.showError(
          'Request Failed',
          error.error?.message || error.statusText || 'An unexpected error occurred.'
        );
    }
  }

  /**
   * Handle client-side errors (JavaScript errors)
   * @private
   */
  private handleClientError(error: Error): void {
    // Check if error should be ignored
    if (this.shouldIgnoreError(error)) {
      console.warn('Ignoring non-critical error:', error.message);
      return;
    }

    console.error('Client Error caught by Error Boundary:', error);

    // Log the error
    this.errorLoggingService.logClientError(error, 'Global Error Handler');

    // Determine if error is critical
    const isCritical = this.isCriticalError(error);

    if (isCritical) {
      // Critical error - show prominent notification
      this.notificationService.showError(
        'Application Error',
        'A critical error occurred. Please refresh the page. If the problem persists, contact support.',
        10000 // Show for 10 seconds
      );

      // In production, optionally redirect to error page after delay
      if (environment.production) {
        setTimeout(() => {
          this.router.navigate(['/error'], {
            state: { error: error.message }
          });
        }, 3000);
      }
    } else {
      // Non-critical error - show brief notification
      this.notificationService.showWarning(
        'Something went wrong',
        'An error occurred but you can continue using the application.'
      );
    }
  }

  /**
   * Handle unknown error types
   * @private
   */
  private handleUnknownError(error: any): void {
    console.error('Unknown Error caught by Error Boundary:', error);

    // Log as client error with additional context
    this.errorLoggingService.logError({
      type: 'client',
      message: 'Unknown error type',
      details: {
        error: error,
        errorType: typeof error,
        errorString: String(error)
      }
    });

    // Show generic notification
    this.notificationService.showError(
      'Unexpected Error',
      'An unexpected error occurred. Please try again.'
    );
  }

  /**
   * Check if error should be ignored (non-critical)
   * @private
   */
  private shouldIgnoreError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return this.ignoredErrors.some(ignored =>
      message.includes(ignored.toLowerCase())
    );
  }

  /**
   * Determine if error is critical
   * @private
   */
  private isCriticalError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Critical keywords
    const criticalKeywords = [
      'cannot read properties',
      'undefined is not',
      'null is not',
      'is not a function',
      'is not defined',
      'maximum call stack',
      'out of memory'
    ];

    return criticalKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Extract validation message from HTTP error
   * @private
   */
  private extractValidationMessage(error: HttpErrorResponse): string {
    if (error.error?.validationErrors && Array.isArray(error.error.validationErrors)) {
      // Format validation errors as a list
      const errors = error.error.validationErrors
        .map((ve: any) => `${ve.field}: ${ve.message}`)
        .join(', ');
      return errors;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    return 'Please check your input and try again.';
  }

  /**
   * Manually handle an error (for use in components)
   *
   * @param error - Error to handle
   * @param context - Additional context
   */
  handleManualError(error: Error | HttpErrorResponse, context?: string): void {
    if (error instanceof HttpErrorResponse) {
      this.errorLoggingService.logHttpError(error, context);
    } else {
      this.errorLoggingService.logClientError(error, context);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return this.errorLoggingService.getErrorStats();
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLoggingService.clearErrorLog();
  }

  /**
   * Export error log
   */
  exportErrors(): string {
    return this.errorLoggingService.exportErrorLog();
  }
}
