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

// Store
import { DashboardActions } from '@store/dashboard/dashboard.actions';
import { 
  selectDashboardStats, 
  selectDashboardLoading, 
  selectDashboardError,
  DashboardStatsDTO 
} from '@store/dashboard/dashboard.state';

import { dashboardAnimations } from './dashboard.animations';
import { SkeletonLoader } from "@shared/components/ui/skeleton-loader/skeleton-loader";
import { selectUser } from '@store/auth/auth.state';

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
  }

  /**
   * OnInit Lifecycle Hook
   * 
   * Loads dashboard statistics on component initialization
   * and subscribes to stats for local calculations
   */
  ngOnInit(): void {
    // Dispatch action to load dashboard stats
    this.store.dispatch(DashboardActions.loadStats());
    
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
    this.store.dispatch(DashboardActions.loadStats());
    
    // Reset refresh animation after 1 second
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  /**
   * Calculate transaction success rate
   * 
   * @returns Success rate as percentage or null if no data
   */
  getSuccessRate(): number | null {
    if (!this.currentStats || this.currentStats.totalTransactions === 0) {
      return null;
    }
    return Math.round(
      (this.currentStats.successfulTransactions / this.currentStats.totalTransactions) * 100
    );
  }

  /**
   * Calculate bond settlement rate
   * 
   * @returns Settlement rate as percentage or null if no data
   */
  getSettlementRate(): number | null {
    if (!this.currentStats || this.currentStats.bondsSold === 0) {
      return null;
    }
    return Math.round(
      (this.currentStats.bondsSettled / this.currentStats.bondsSold) * 100
    );
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
   * Navigate to customers page
   */
  goToCustomers(): void {
    this.router.navigate(['/customers']);
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
   * Get user's first name for greeting
   * 
   * @param user - User object
   * @returns First name or 'User' as fallback
   */
  getUserFirstName(user: any): string {
    return user?.firstName || 'User';
  }
}
