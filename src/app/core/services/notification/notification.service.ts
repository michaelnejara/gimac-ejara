import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as NotificationModels from '@core/models/notification.models';

/**
 * Notification Service
 * Manages application-wide notifications and toasts
 * 
 * @example
 * // Inject in component
 * private notificationService = inject(NotificationService);
 * 
 * // Show success notification
 * this.notificationService.showSuccess('Saved!', 'Your changes have been saved');
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  /** Signal-based reactive notifications array */
  private notifications = signal<NotificationModels.Notification[]>([]);
  
  /** Observable for template subscriptions */
  private notificationsSubject = new BehaviorSubject<NotificationModels.Notification[]>([]);
  
  /** Public observable of notifications */
  readonly notifications$ = this.notificationsSubject.asObservable();
  
  /** Computed count of active notifications */
  readonly notificationCount = computed(() => this.notifications().length);
  
  /** Default duration for auto-dismiss (5 seconds) */
  private readonly DEFAULT_DURATION = 5000;
  
  /** Maximum number of notifications to display */
  private readonly MAX_NOTIFICATIONS = 5;
  
  /** Default position for notifications */
  private readonly DEFAULT_POSITION: NotificationModels.NotificationPosition = 'top-right';

  /**
   * Show a notification
   */
  show(notification: Partial<NotificationModels.Notification>): string {
    const id = this.generateId();
    
    const fullNotification: NotificationModels.Notification = {
      id,
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message,
      duration: notification.duration !== undefined ? notification.duration : this.DEFAULT_DURATION,
      persistent: notification.persistent || false,
      actions: notification.actions,
      timestamp: new Date(),
      dismissing: false,
      icon: notification.icon || this.getDefaultIcon(notification.type || 'info'),
      closable: notification.closable !== undefined ? notification.closable : true,
      position: notification.position || this.DEFAULT_POSITION
    };

    const current = this.notifications();
    const updated = [fullNotification, ...current].slice(0, this.MAX_NOTIFICATIONS);
    
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);

    if (!fullNotification.persistent && fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, fullNotification.duration);
    }

    return id;
  }

  showSuccess(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration: duration || this.DEFAULT_DURATION });
  }

  showError(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration: duration || 8000 });
  }

  showWarning(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration: duration || 6000 });
  }

  showInfo(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration: duration || this.DEFAULT_DURATION });
  }

  dismiss(id: string): void {
    const current = this.notifications();
    const updated = current.map(n => 
      n.id === id ? { ...n, dismissing: true } : n
    );
    
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);

    setTimeout(() => {
      const remaining = this.notifications().filter(n => n.id !== id);
      this.notifications.set(remaining);
      this.notificationsSubject.next(remaining);
    }, 300);
  }

  dismissAll(): void {
    const current = this.notifications();
    const updated = current.map(n => ({ ...n, dismissing: true }));
    
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);

    setTimeout(() => {
      this.notifications.set([]);
      this.notificationsSubject.next([]);
    }, 300);
  }

  getNotifications(): NotificationModels.Notification[] {
    return this.notifications();
  }

  getCount(): number {
    return this.notificationCount();
  }

  hasNotifications(): boolean {
    return this.notificationCount() > 0;
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultIcon(type: NotificationModels.NotificationType): string {
    const iconMap: Record<NotificationModels.NotificationType, string> = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    return iconMap[type];
  }
}