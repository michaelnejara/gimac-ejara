import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem } from '@core/models/auth.models';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
private router = inject(Router);

  // State
  isCollapsed = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);
  currentRoute = signal<string>('');

  // Menu Items
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/dashboard'
    },
    {
      label: 'Users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/users',
      badge: 3,
      badgeColor: 'primary'
    },
    {
      label: 'Payments',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      route: '/payments',
      children: [
        { label: 'All Payments', icon: '', route: '/payments/list' },
        { label: 'Reconciliation', icon: '', route: '/payments/reconciliation' }
      ]
    },
    {
      label: 'Bonds',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      route: '/bonds'
    },
    {
      label: 'Audit',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      route: '/audit'
    },
    // {
    //   label: 'Notification Center',
    //   icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    //   route: '/alerts',
    //   badge: 5,
    //   badgeColor: 'error'
    // },
    {
      label: 'Reports',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      route: '/reports'
    }
  ]);

  // Computed
  displayedMenuItems = computed(() => {
    return this.menuItems();
  });

  ngOnInit(): void {
    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute.set(event.url);
      this.isMobileMenuOpen.set(false); // Close mobile menu on navigation
    });

    // Set initial route
    this.currentRoute.set(this.router.url);
  }

  /**
   * Toggle sidebar collapse
   */
  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  /**
   * Check if menu item is active
   */
  isActive(route?: string): boolean {
    if (!route) return false;
    const currentRoute = this.currentRoute();
    return currentRoute === route || currentRoute.startsWith(route + '/');
  }

  /**
   * Toggle submenu expansion
   */
  toggleSubmenu(item: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (item.children) {
      this.menuItems.update(items =>
        items.map(i =>
          i === item ? { ...i, expanded: !i.expanded } : i
        )
      );
    }
  }

  /**
   * Get badge color class
   */
  getBadgeColorClass(color?: string): string {
    const colorMap: Record<string, string> = {
      primary: 'badge-primary',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error'
    };
    return color ? colorMap[color] || 'badge-primary' : 'badge-primary';
  }

  /**
   * Close mobile menu when clicking outside
   */
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
