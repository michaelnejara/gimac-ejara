/**
 * Notification type enumeration
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification position on screen
 */
export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'top-center' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'bottom-center';

/**
 * Notification action button interface
 */
export interface NotificationAction {
  /** Button label text */
  label: string;
  /** Callback function when button is clicked */
  action: () => void;
  /** Button style variant */
  style?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Whether to close notification after action */
  closeOnClick?: boolean;
}

/**
 * Complete notification interface
 */
export interface Notification {
  /** Unique notification identifier */
  id: string;
  /** Notification type */
  type: NotificationType;
  /** Main title text */
  title: string;
  /** Optional detailed message */
  message?: string;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Whether notification persists until manually closed */
  persistent?: boolean;
  /** Optional action buttons */
  actions?: NotificationAction[];
  /** Timestamp when notification was created */
  timestamp: Date;
  /** Whether notification is currently being dismissed */
  dismissing?: boolean;
  /** Icon to display (auto-determined if not provided) */
  icon?: string;
  /** Whether notification can be closed */
  closable?: boolean;
  /** Position on screen */
  position?: NotificationPosition;
}