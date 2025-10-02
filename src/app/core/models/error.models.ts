/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  /** Error code identifier */
  errorCode?: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  statusCode?: number;
  /** Detailed error information */
  details?: any;
  /** Error timestamp */
  timestamp?: string;
  /** Request path that caused error */
  path?: string;
  /** Validation errors (if any) */
  validationErrors?: ValidationError[];
}

/**
 * Validation error structure
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string;
  /** Validation error message */
  message: string;
  /** Rejected value */
  rejectedValue?: any;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  /** Unique error ID */
  id: string;
  /** Error type */
  type: 'http' | 'client' | 'network';
  /** HTTP status code */
  statusCode?: number;
  /** Error message */
  message: string;
  /** Request URL */
  url?: string;
  /** HTTP method */
  method?: string;
  /** Full error details */
  details?: any;
  /** Timestamp */
  timestamp: Date;
  /** User ID (if authenticated) */
  userId?: string;
  /** Whether error was reported */
  reported: boolean;
}
