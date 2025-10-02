import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import * as ErrorModels from '@core/models/error.models';

@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService {
private http = inject(HttpClient);
  
  /** In-memory error log (last 50 errors) */
  private errorLog: ErrorModels.ErrorLogEntry[] = [];
  
  /** Maximum number of errors to keep in memory */
  private readonly MAX_LOG_SIZE = 50;

  /**
   * Log an error
   * 
   * @param {ErrorModels.ErrorLogEntry} error - Error entry to log
   */
  logError(error: Omit<ErrorModels.ErrorLogEntry, 'id' | 'timestamp' | 'reported'>): void {
    const entry: ErrorModels.ErrorLogEntry = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      reported: false,
      ...error
    };

    // Add to in-memory log
    this.errorLog.unshift(entry);
    
    // Keep only last MAX_LOG_SIZE errors
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(0, this.MAX_LOG_SIZE);
    }

    // Log to console in development
    if (!environment.production) {
      console.error('[Error Logged]', entry);
    }

    // Send to remote logging service in production
    if (environment.production && environment.logging.enableRemoteLogging) {
      this.sendToRemoteLogging(entry);
    }
  }

  /**
   * Get all logged errors
   * 
   * @returns {ErrorModels.ErrorLogEntry[]} Array of error log entries
   */
  getErrorLog(): ErrorModels.ErrorLogEntry[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   * 
   * @returns Statistics object
   */
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    byStatusCode: Record<number, number>;
  } {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<string, number>,
      byStatusCode: {} as Record<number, number>
    };

    this.errorLog.forEach(error => {
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Count by status code
      if (error.statusCode) {
        stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Send error to remote logging service
   * @private
   */
  private sendToRemoteLogging(error: ErrorModels.ErrorLogEntry): void {
    // Send to your logging service (e.g., Sentry, LogRocket, etc.)
    this.http.post(`${environment.apiUrl}/logging/errors`, error, {
      headers: { 'X-Skip-Error-Handler': 'true' }
    }).subscribe({
      next: () => {
        // Mark as reported
        const loggedError = this.errorLog.find(e => e.id === error.id);
        if (loggedError) {
          loggedError.reported = true;
        }
      },
      error: (err) => {
        console.warn('Failed to send error to remote logging:', err);
      }
    });
  }

  /**
   * Generate unique error ID
   * @private
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
