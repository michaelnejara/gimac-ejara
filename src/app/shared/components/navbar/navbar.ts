import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@core/models/auth.models';
import { Store } from '@ngrx/store';
import { AuthActions } from '@store/auth/auth.actions';
import { selectUser } from '@store/auth/auth.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private store = inject(Store);
  private router = inject(Router);

  // State
  user$: Observable<User | null>;
  isProfileMenuOpen = signal<boolean>(false);
  isNotificationsOpen = signal<boolean>(false);
  
  // Mock notifications (replace with real data from store)
  notifications = signal([
    {
      id: '1',
      title: 'New user registration',
      message: 'John Doe just registered',
      time: '2 min ago',
      read: false,
      type: 'user' as const
    },
    {
      id: '2',
      title: 'Transaction completed',
      message: 'Payment of $1,250.00 processed',
      time: '15 min ago',
      read: false,
      type: 'transaction' as const
    },
    {
      id: '3',
      title: 'System update',
      message: 'New features are available',
      time: '1 hour ago',
      read: true,
      type: 'system' as const
    }
  ]);

  // Computed
  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  hasUnread = computed(() => this.unreadCount() > 0);

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  });

  currentUser = signal<User | null>(null);

  constructor() {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.user$.subscribe(user => {
      this.currentUser.set(user);
    });

    // Close menus when clicking outside
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  /**
   * Toggle profile dropdown menu
   */
  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update(value => !value);
    this.isNotificationsOpen.set(false);
  }

  /**
   * Toggle notifications dropdown
   */
  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen.update(value => !value);
    this.isProfileMenuOpen.set(false);
  }

  /**
   * Handle click outside dropdowns
   */
  private handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.profile-dropdown, .notifications-dropdown');
    
    if (!isClickInside) {
      this.isProfileMenuOpen.set(false);
      this.isNotificationsOpen.set(false);
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  /**
   * Navigate to profile page
   */
  goToProfile(): void {
    this.isProfileMenuOpen.set(false);
    this.router.navigate(['/profile']);
  }

  /**
   * Navigate to settings page
   */
  goToSettings(): void {
    this.isProfileMenuOpen.set(false);
    this.router.navigate(['/settings']);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.isProfileMenuOpen.set(false);
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: 'user' | 'transaction' | 'system'): string {
    const icons = {
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      transaction: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      system: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    };
    return icons[type];
  }

  /**
   * Format relative time
   */
  formatTime(time: string): string {
    // Simple implementation - replace with actual date formatting
    return time;
  }
}
