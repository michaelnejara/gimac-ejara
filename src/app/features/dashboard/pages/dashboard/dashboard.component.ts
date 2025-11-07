import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';

// Store
import { DashboardActions } from '@store/dashboard/dashboard.actions';
import {
  selectDashboardStats,
  selectDashboardLoading,
  selectDashboardError,
  selectHasActiveFilters,
  selectDashboardFilters
} from '@store/dashboard/dashboard.state';

import { dashboardAnimations } from './dashboard.animations';
import { SkeletonLoader } from "@shared/components/ui/skeleton-loader/skeleton-loader";
import { selectUser } from '@store/auth/auth.state';
import { DashboardStatsDTO, DashboardFilterParams } from '@core/models/dashboard.models';
import { DashboardFilterDialogComponent } from '../../components/dashboard-filter-dialog/dashboard-filter-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRippleModule,
    MatDialogModule,
    MatBadgeModule,
    SkeletonLoader
],
  animations: [
    dashboardAnimations.fadeIn,
    dashboardAnimations.slideIn,
    dashboardAnimations.listAnimation
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  /** NgRx store instance for state management */
  private store = inject(Store);

  /** Router for navigation */
  private router = inject(Router);

  /** Dialog service for filter modal */
  private dialog = inject(MatDialog);

  /** Subject for managing subscriptions */
  private destroy$ = new Subject<void>();

  /** Observable stream of dashboard statistics */
  stats$: Observable<DashboardStatsDTO | null>;

  /** Observable stream indicating if data is being loaded */
  loading$: Observable<boolean>;

  /** Observable stream of error messages */
  error$: Observable<string | null>;

  /** Observable stream of current user */
  user$: Observable<any>;

  /** Observable stream indicating if filters are active */
  hasActiveFilters$: Observable<boolean>;

  /** Observable stream of active filters */
  activeFilters$: Observable<DashboardFilterParams>;

  /** Current statistics snapshot for calculations */
  currentStats: DashboardStatsDTO | null = null;

  /** Whether refresh animation is active */
  isRefreshing = false;

  /**
   * Constructor
   *
   * Initializes observables by selecting data from NgRx store.
   * These observables automatically emit new values when store state changes.
   */
  constructor() {
    this.stats$ = this.store.select(selectDashboardStats);
    this.loading$ = this.store.select(selectDashboardLoading);
    this.error$ = this.store.select(selectDashboardError);
    this.user$ = this.store.select(selectUser);
    this.hasActiveFilters$ = this.store.select(selectHasActiveFilters);
    this.activeFilters$ = this.store.select(selectDashboardFilters);
  }

  /**
   * OnInit Lifecycle Hook
   *
   * Loads dashboard statistics on component initialization
   * and subscribes to stats for local calculations
   */
  ngOnInit(): void {
    // Dispatch action to load dashboard stats
    this.store.dispatch(DashboardActions.loadStats({ filters: {} }));

    // Subscribe to stats for local access
    this.stats$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stats => {
      this.currentStats = stats;
    });
  }

  /**
   * OnDestroy Lifecycle Hook
   * 
   * Cleans up subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Refresh Dashboard Data
   *
   * Manually triggers a reload of dashboard statistics with visual feedback.
   * Adds a brief animation to indicate refresh is happening.
   *
   * @example
   * ```html
   * <button (click)="refresh()">Refresh</button>
   * ```
   */
  refresh(): void {
    this.isRefreshing = true;
    this.store.dispatch(DashboardActions.loadStats({}));

    // Reset refresh animation after 1 second
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  /**
   * Open filter dialog
   *
   * Opens a dialog to configure dashboard filters (date range, partner)
   */
  openFilterDialog(): void {
    const dialogRef = this.dialog.open(DashboardFilterDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'filter-dialog-panel',
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe((filters: DashboardFilterParams) => {
      if (filters) {
        this.applyFilters(filters);
      }
    });
  }

  /**
   * Apply filters to dashboard
   *
   * @param filters - Filter parameters to apply
   */
  applyFilters(filters: DashboardFilterParams): void {
    this.store.dispatch(DashboardActions.loadStats({ filters }));
  }

  /**
   * Clear all active filters
   */
  clearFilters(): void {
    this.store.dispatch(DashboardActions.clearFilters());
  }

  /**
   * Calculate percentage of active partners
   *
   * @returns Active partners percentage or null if no data
   */
  getActivePartnersPercentage(): number | null {
    if (!this.currentStats || this.currentStats.totalPartners === 0) {
      return null;
    }
    return Math.round(
      (this.currentStats.totalActivePartners / this.currentStats.totalPartners) * 100
    );
  }

  /**
   * Calculate net transaction amount (deposits - withdrawals)
   *
   * @returns Net amount or null if no data
   */
  getNetTransactionAmount(): number | null {
    if (!this.currentStats) {
      return null;
    }
    return this.currentStats.totalDepositAmount - this.currentStats.totalWithdrawalAmount;
  }

  /**
   * Navigate to transactions page
   */
  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  /**
   * Navigate to bonds page
   */
  goToBonds(): void {
    this.router.navigate(['/bonds']);
  }

  /**
   * Navigate to partners page
   */
  goToPartners(): void {
    this.router.navigate(['/partners']);
  }

  /**
   * Navigate to bond transactions page
   */
  goToBondTransactions(): void {
    this.router.navigate(['/bond-transactions']);
  }

  /**
   * Navigate to reconciliation page
   */
  goToReconciliation(): void {
    this.router.navigate(['/reconciliation']);
  }

  /**
   * Navigate to create new bond page
   */
  createNewBond(): void {
    this.router.navigate(['/bonds/create']);
  }

  /**
   * Navigate to manual transaction entry
   */
  manualTransaction(): void {
    this.router.navigate(['/transactions/manual']);
  }

  /**
   * Format large numbers with k/M suffix
   *
   * @param value - Number to format
   * @returns Formatted string (e.g., "1.2k", "3.5M")
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  }

  /**
   * Format currency values with proper symbols and separators
   *
   * @param value - Amount to format
   * @param currency - Currency code (default: 'XAF')
   * @returns Formatted currency string
   */
  formatCurrency(value: number, currency: string = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Format financial values with abbreviated suffixes (k/M/B)
   * Used for displaying large financial amounts in a compact format
   *
   * @param value - Financial amount to format
   * @param currency - Currency code (default: 'XAF')
   * @returns Formatted string with currency symbol and suffix
   *
   * @example
   * formatFinancialValue(2500000) // "2.5M FCFA"
   * formatFinancialValue(125000) // "125k FCFA"
   */
  formatFinancialValue(value: number, currency: string = 'XAF'): string {
    const currencySymbol = currency === 'XAF' ? 'FCFA' : currency;

    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B ${currencySymbol}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currencySymbol}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ${currencySymbol}`;
    }
    return `${value.toLocaleString('fr-FR')} ${currencySymbol}`;
  }

  /**
   * Get user's first name for greeting
   *
   * @param user - User object
   * @returns First name or 'User' as fallback
   */
  getUserFirstName(user: any): string {
    return user?.firstName || 'User';
  }

  /**
   * Format date for display
   *
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Get filter summary text
   *
   * @param filters - Active filters
   * @returns Formatted filter summary string
   */
  getFilterSummary(filters: DashboardFilterParams): string {
    const parts: string[] = [];

    if (filters.startDate && filters.endDate) {
      parts.push(`${this.formatDate(filters.startDate)} - ${this.formatDate(filters.endDate)}`);
    } else if (filters.startDate) {
      parts.push(`From ${this.formatDate(filters.startDate)}`);
    } else if (filters.endDate) {
      parts.push(`Until ${this.formatDate(filters.endDate)}`);
    }

    if (filters.partnerName) {
      parts.push(filters.partnerName);
    }

    return parts.join(' • ');
  }
}
