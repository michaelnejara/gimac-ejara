import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Notification } from '@core/models/notification.models';
import { NotificationService } from '@core/services/notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-container.html',
  styleUrl: './notification-container.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationContainer implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  position: string = 'top-right';
  private subscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to notification changes
    this.subscription = this.notificationService.notifications$.subscribe(
      (notifications: Notification[]) => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Dismiss notification by ID
   */
  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  /**
   * Handle action button click
   */
  handleAction(notification: Notification, action: any): void {
    // Execute action callback
    action.action();

    // Close notification if specified
    if (action.closeOnClick !== false) {
      this.dismiss(notification.id);
    }
  }
}
