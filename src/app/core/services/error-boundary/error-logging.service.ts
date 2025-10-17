// src/app/core/services/error-boundary/error-logging.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ErrorLogEntry } from '@core/models/error.models';
import { BehaviorSubject, Observable, catchError, of, timeout } from 'rxjs';

/**
 * Error Logging Service
 *
 * Handles logging of errors to console, memory, and remote logging service
 * Provides error analytics and reporting capabilities
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** In-memory error log (circular buffer) */
  private errorLog: ErrorLogEntry[] = [];

  /** Observable error log for real-time monitoring */
  private errorLog$ = new BehaviorSubject<ErrorLogEntry[]>([]);

  /** Maximum number of errors to keep in memory */
  private readonly MAX_LOG_SIZE = 100;

  /** Timeout for remote logging requests (ms) */
  private readonly REMOTE_LOGGING_TIMEOUT = 5000;

  /** Queue for failed remote logging attempts */
  private failedLoggingQueue: ErrorLogEntry[] = [];

  /** Flag to prevent logging loops */
  private isLogging = false;

  /**
   * Log an error with enhanced context
   *
   * @param error - Error entry to log
   */
  logError(error: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'reported'>): void {
    // Prevent logging loops
    if (this.isLogging) return;
    this.isLogging = true;

    try {
      const entry: ErrorLogEntry = {
        id: this.generateErrorId(),
        timestamp: new Date(),
        reported: false,
        ...error,
        // Add additional context
        url: error.url || this.getCurrentUrl(),
        userId: error.userId || this.getCurrentUserId(),
        details: {
          ...error.details,
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        }
      };

      // Add to in-memory log (circular buffer)
      this.errorLog.unshift(entry);

      // Keep only last MAX_LOG_SIZE errors
      if (this.errorLog.length > this.MAX_LOG_SIZE) {
        this.errorLog = this.errorLog.slice(0, this.MAX_LOG_SIZE);
      }

      // Update observable
      this.errorLog$.next([...this.errorLog]);

      // Log to console based on environment
      this.logToConsole(entry);

      // Send to remote logging service
      if (this.shouldSendToRemote(entry)) {
        this.sendToRemoteLogging(entry);
      }

      // Retry failed logging attempts
      this.retryFailedLogging();
    } finally {
      this.isLogging = false;
    }
  }

  /**
   * Log HTTP error with standardized format
   *
   * @param error - HTTP error response
   * @param context - Additional context
   */
  logHttpError(error: HttpErrorResponse, context?: string): void {
    const errorEntry: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'reported'> = {
      type: this.determineErrorType(error),
      statusCode: error.status,
      message: this.extractErrorMessage(error),
      url: error.url || undefined,
      method: this.extractHttpMethod(error),
      details: {
        context,
        error: error.error,
        headers: this.sanitizeHeaders(error.headers),
        statusText: error.statusText
      }
    };

    this.logError(errorEntry);
  }

  /**
   * Log client-side error
   *
   * @param error - Error object
   * @param context - Additional context
   */
  logClientError(error: Error, context?: string): void {
    const errorEntry: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'reported'> = {
      type: 'client',
      message: error.message || 'Unknown client error',
      details: {
        context,
        name: error.name,
        stack: error.stack,
        cause: (error as any).cause
      }
    };

    this.logError(errorEntry);
  }

  /**
   * Get error log as observable
   */
  getErrorLog$(): Observable<ErrorLogEntry[]> {
    return this.errorLog$.asObservable();
  }

  /**
   * Get all logged errors (snapshot)
   */
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  /**
   * Get recent errors (last N)
   */
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorLog.slice(0, count);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorLogEntry['type']): ErrorLogEntry[] {
    return this.errorLog.filter(error => error.type === type);
  }

  /**
   * Get errors by status code
   */
  getErrorsByStatusCode(statusCode: number): ErrorLogEntry[] {
    return this.errorLog.filter(error => error.statusCode === statusCode);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.errorLog$.next([]);
    this.failedLoggingQueue = [];
  }

  /**
   * Get comprehensive error statistics
   */
  getErrorStats(): {
    total: number;
    reported: number;
    unreported: number;
    byType: Record<string, number>;
    byStatusCode: Record<number, number>;
    last24Hours: number;
    criticalErrors: number;
  } {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      total: this.errorLog.length,
      reported: 0,
      unreported: 0,
      byType: {} as Record<string, number>,
      byStatusCode: {} as Record<number, number>,
      last24Hours: 0,
      criticalErrors: 0
    };

    this.errorLog.forEach(error => {
      // Count reported/unreported
      if (error.reported) {
        stats.reported++;
      } else {
        stats.unreported++;
      }

      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      // Count by status code
      if (error.statusCode) {
        stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1;
      }

      // Count errors in last 24 hours
      if (error.timestamp >= yesterday) {
        stats.last24Hours++;
      }

      // Count critical errors (5xx or client errors)
      if (error.type === 'client' || (error.statusCode && error.statusCode >= 500)) {
        stats.criticalErrors++;
      }
    });

    return stats;
  }

  /**
   * Export error log as JSON
   */
  exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  /**
   * Export error log as CSV
   */
  exportErrorLogCsv(): string {
    const headers = ['ID', 'Timestamp', 'Type', 'Status Code', 'Message', 'URL', 'Method', 'Reported'];
    const rows = this.errorLog.map(error => [
      error.id,
      error.timestamp.toISOString(),
      error.type,
      error.statusCode || '',
      `"${error.message.replace(/"/g, '""')}"`,
      error.url || '',
      error.method || '',
      error.reported
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Determine if error should be sent to remote logging
   * @private
   */
  private shouldSendToRemote(_error: ErrorLogEntry): boolean {
    // Don't send in development unless explicitly enabled
    if (!environment.production && !environment.logging.enableRemoteLogging) {
      return false;
    }

    // Always send in production if remote logging is enabled
    if (environment.production && environment.logging.enableRemoteLogging) {
      return true;
    }

    return false;
  }

  /**
   * Send error to remote logging service
   * @private
   */
  private sendToRemoteLogging(error: ErrorLogEntry): void {
    const payload = {
      ...error,
      timestamp: error.timestamp.toISOString(),
      appName: environment.appName,
      appVersion: environment.version,
      environment: environment.production ? 'production' : 'development'
    };

    this.http.post(`${environment.apiUrl}/logging/errors`, payload, {
      headers: { 'X-Skip-Error-Handler': 'true' }
    }).pipe(
      timeout(this.REMOTE_LOGGING_TIMEOUT),
      catchError(err => {
        // Add to failed queue for retry
        this.failedLoggingQueue.push(error);
        console.warn('Failed to send error to remote logging:', err);
        return of(null);
      })
    ).subscribe({
      next: () => {
        // Mark as reported
        const loggedError = this.errorLog.find(e => e.id === error.id);
        if (loggedError) {
          loggedError.reported = true;
          this.errorLog$.next([...this.errorLog]);
        }
      }
    });
  }

  /**
   * Retry failed logging attempts
   * @private
   */
  private retryFailedLogging(): void {
    if (this.failedLoggingQueue.length === 0) return;

    // Retry first 5 failed attempts
    const toRetry = this.failedLoggingQueue.splice(0, 5);
    toRetry.forEach(error => {
      if (!error.reported) {
        this.sendToRemoteLogging(error);
      }
    });
  }

  /**
   * Log to console based on error severity and environment
   * @private
   */
  private logToConsole(error: ErrorLogEntry): void {
    const logLevel = environment.logging.level || 'error';

    // Only log if level permits
    if (logLevel === 'off') return;

    const logMessage = `[${error.type.toUpperCase()}] ${error?.message}`;
    const logDetails = {
      id: error?.id,
      timestamp: error?.timestamp,
      url: error?.url,
      statusCode: error?.statusCode,
      details: error?.details
    };

    // Determine console method based on error type and status
    if (error.type === 'client' || (error.statusCode && error.statusCode >= 500)) {
      console.error(logMessage, logDetails);
    } else if (error.statusCode && error.statusCode >= 400) {
      console.warn(logMessage, logDetails);
    } else {
      console.log(logMessage, logDetails);
    }
  }

  /**
   * Determine error type from HTTP error
   * @private
   */
  private determineErrorType(error: HttpErrorResponse): ErrorLogEntry['type'] {
    if (error.status === 0) {
      return 'network';
    }
    return 'http';
  }

  /**
   * Extract error message from HTTP error
   * @private
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.statusText) {
      return error.statusText;
    }
    return `HTTP ${error.status} Error`;
  }

  /**
   * Extract HTTP method from error
   * @private
   */
  private extractHttpMethod(error: HttpErrorResponse): string | undefined {
    // Try to extract method from error or request
    return (error as any).method || undefined;
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   * @private
   */
  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie', 'set-cookie'];
    const sanitized: any = {};

    if (!headers || !headers.keys) return sanitized;

    headers.keys().forEach((key: string) => {
      const lowerKey = key.toLowerCase();
      if (sensitiveHeaders.includes(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = headers.get(key);
      }
    });

    return sanitized;
  }

  /**
   * Get current URL
   * @private
   */
  private getCurrentUrl(): string {
    return this.router.url;
  }

  /**
   * Get current user ID from localStorage
   * @private
   */
  private getCurrentUserId(): string | undefined {
    try {
      const authState = localStorage.getItem('auth_state');
      if (authState) {
        const parsed = JSON.parse(authState);
        return parsed.user?.id?.toString();
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  /**
   * Generate unique error ID
   * @private
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
