import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';

// Store
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectBondById,
  selectBondLoading,
  selectBondError,
  selectBondsContext,
  BondsContext
} from '@store/bonds/bonds.state';

// Models
import { Bond } from '@core/models/bond.models';

// Components
import { ConfirmBondsModal } from '@shared/components/forms/confirm-bonds-modal/confirm-bonds-modal';

@Component({
  selector: 'app-bond-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTabsModule
  ],
  templateUrl: './bond-details.component.html',
  styleUrl: './bond-details.component.scss'
})
export class BondDetailsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // Observables
  bond$!: Observable<Bond | null>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  bondsContext$!: Observable<BondsContext>;

  // Current bond
  bond: Bond | null = null;
  bondId: number | null = null;

  // Context for navigation
  returnUrl: string = '/bonds';
  bondsContext: BondsContext = { page: 'default' };

  ngOnInit(): void {
    // Get bond ID from route
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.bondId = +params['id'];
        this.initializeObservables();
        // this.loadBondFromRoute();
        this.setupBondSubscription();
        this.setupReturnUrl();

        // Use cache-aware action - checks cache before making API call
        this.store.dispatch(BondsActions.checkAndLoadBond({
          bondId: this.bondId
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    console.log('Bond Id', this.bondId);
    this.bond$ = this.store.select(selectBondById(this.bondId!));
    this.loading$ = this.store.select(selectBondLoading(this.bondId!));
    this.error$ = this.store.select(selectBondError(this.bondId!));
    this.bondsContext$ = this.store.select(selectBondsContext);

    this.bond$.subscribe(bond => {
      console.log('bond$', bond);
    })
  }

  /**
   * Load bond from route params
   */
  // private loadBondFromRoute(): void {
  //   this.route.params.pipe(
  //     takeUntil(this.destroy$)
  //   ).subscribe(params => {
  //     const id = params['id'];
  //     if (id) {
  //       this.bondId = +id;
  //       console.log('Loading bond with ID:', this.bondId, id);
  //       this.store.dispatch(BondsActions.loadBond({ bondId: this.bondId }));
  //     }
  //   });
  // }

  /**
   * Setup bond subscription
   */
  private setupBondSubscription(): void {
    this.bond$.pipe(
      filter(bond => bond !== null),
      takeUntil(this.destroy$)
    ).subscribe(bond => {
      this.bond = bond;
    });
  }

  /**
   * Setup return URL based on context from store
   * Uses the context object from bonds store to determine correct return URL
   */
  private setupReturnUrl(): void {
    // Subscribe to bonds context from store
    this.bondsContext$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(context => {
      this.bondsContext = context;

      // Build return URL based on context
      if (context.page === 'partner' && context.partnerId) {
        // Return to partner's bonds
        this.returnUrl = `/bonds?partnerId=${context.partnerId}`;
      } else if (context.page === 'customer' && context.partnerId && context.customerId) {
        // Return to customer's bonds
        this.returnUrl = `/bonds?partnerId=${context.partnerId}&customerId=${context.customerId}`;
      } else {
        // Return to default bonds list
        this.returnUrl = '/bonds';
      }
    });

    // Also check query params as fallback (for direct navigation)
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  /**
   * Navigate to edit bond page
   */
  editBond(): void {
    if (this.bondId) {
      this.router.navigate(['/bonds/update-bond', this.bondId], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  /**
   * Delete bond
   */
  deleteBond(): void {
    if (!this.bond) return;

    const dialogRef = this.dialog.open(ConfirmBondsModal, {
      width: '450px',
      data: {
        title: 'Delete Bond',
        message: `Are you sure you want to delete "${this.bond.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.bondId) {
        this.store.dispatch(BondsActions.deleteBond({ bondId: this.bondId }));

        // Navigate back after deletion
        setTimeout(() => {
          this.goBack();
        }, 1000);
      }
    });
  }

  /**
   * Retry loading bond
   */
  retryLoad(): void {
    if (this.bondId) {
      this.store.dispatch(BondsActions.loadBond({ bondId: this.bondId }));
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      active: 'status-active',
      inactive: 'status-inactive',
      matured: 'status-matured'
    };
    return statusClasses[status] || 'status-inactive';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'XAF'): string {
    if (!amount) return `${currency} 0`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount).replace(currency, `${currency} `);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date with time
   */
  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value}%`;
  }

  /**
   * Format lifetime (in days) to human-readable format
   */
  formatLifetime(days: number): string {
    if (!days) return '-';

    if (days < 30) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      const months = Math.floor(remainingDays / 30);

      if (months === 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}`;
      }
      return `${years}y ${months}m`;
    }
  }

  /**
   * Calculate days until maturity
   */
  getDaysUntilMaturity(maturityDate: string): number {
    if (!maturityDate) return 0;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get maturity status text
   */
  getMaturityStatus(maturityDate: string): string {
    const days = this.getDaysUntilMaturity(maturityDate);
    if (days < 0) {
      return 'Matured';
    } else if (days === 0) {
      return 'Matures today';
    } else if (days === 1) {
      return 'Matures tomorrow';
    } else if (days <= 30) {
      return `Matures in ${days} days`;
    } else if (days <= 365) {
      const months = Math.floor(days / 30);
      return `Matures in ${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(days / 365);
      return `Matures in ${years} ${years === 1 ? 'year' : 'years'}`;
    }
  }

  /**
   * Get initials from bond name
   */
  getInitials(name: string): string {
    if (!name) return 'B';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Calculate interest earned to date (if bond is active)
   */
  calculateInterestEarned(bond: Bond): number {
    if (!bond || bond.status !== 'active') return 0;

    const startDate = new Date(bond.startDate || bond.dateCreated);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const yearFraction = daysElapsed / 365;
    const interestEarned = bond.amount * (bond.interestValue / 100) * yearFraction;

    return interestEarned;
  }

  /**
   * Calculate current value (principal + accrued interest)
   */
  calculateCurrentValue(bond: Bond): number {
    return bond.amount + this.calculateInterestEarned(bond);
  }

  /**
   * Format color code to ensure it has # prefix for CSS
   */
  formatColorCode(colorCode: string | undefined, color: string | undefined): string {
    const colorValue = colorCode || color;
    if (!colorValue) return '';

    // If already has #, return as is
    if (colorValue.startsWith('#')) {
      return colorValue;
    }

    // If it's a hex code without #, add it
    if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) {
      return `#${colorValue}`;
    }

    // Return as is for other formats (named colors, rgb, etc.)
    return colorValue;
  }

  /**
   * Get display text for color code
   */
  getColorDisplayText(colorCode: string | undefined, color: string | undefined): string {
    const colorValue = colorCode || color;
    if (!colorValue) return '-';

    // If it's a 6-digit hex without #, add # for display
    if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) {
      return `#${colorValue}`;
    }

    return colorValue;
  }
}
