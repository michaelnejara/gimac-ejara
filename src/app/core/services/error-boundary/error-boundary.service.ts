import { Injectable, ErrorHandler, inject as injectService } from '@angular/core';
import { NotificationService } from '../notification/notification.service';
import { ErrorLoggingService } from './error-logging.service';

/**
 * Global Error Handler
 * Catches uncaught errors in the application
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorBoundaryService {
  private notificationService = injectService(NotificationService);
  private errorLoggingService = injectService(ErrorLoggingService);

  handleError(error: Error): void {
    console.error('Global Error:', error);

    // Log the error
    this.errorLoggingService.logError({
      type: 'client',
      message: error.message,
      details: {
        stack: error.stack,
        name: error.name
      }
    });

    // Show user notification
    this.notificationService.showError(
      'Application Error',
      'An unexpected error occurred. Please refresh the page.'
    );
  }
}
