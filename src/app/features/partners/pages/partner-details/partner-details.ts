// src/app/features/partners/pages/partner-details/partner-details.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Store
import { PartnersActions } from '@store/partners/partners.actions';
import {
  selectPartnerById,
  selectPartnerLoading,
  selectPartnerError
} from '@store/partners/partners.state';

// Models
import { SinglePartner, PartnerStatus } from '@core/models/partner.models';

// Components
import { ChangeStatusModal } from '@shared/components/forms/change-status-modal/change-status-modal';

@Component({
  selector: 'app-partner-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './partner-details.html',
  styleUrl: './partner-details.scss'
})
export class PartnerDetails implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  partnerId: number | null = null;
  // Partner details page always loads SinglePartner (from GET /partners/:id)
  partner$!: Observable<SinglePartner | undefined>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  ngOnInit(): void {
    // Get partner ID from route
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.partnerId = +params['id'];
        this.loadPartner();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load partner details
   */
  private loadPartner(): void {
    if (!this.partnerId) return;

    // Cast to SinglePartner as details endpoint returns SinglePartner
    this.partner$ = this.store.select(selectPartnerById(this.partnerId)).pipe(
      map(partner => partner as SinglePartner | undefined)
    );
    this.loading$ = this.store.select(selectPartnerLoading(this.partnerId));
    this.error$ = this.store.select(selectPartnerError(this.partnerId));

    // Dispatch action to load partner
    this.store.dispatch(PartnersActions.loadPartner({ partnerId: this.partnerId }));
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Navigate to edit partner
   */
  editPartner(): void {
    if (this.partnerId) {
      this.router.navigate(['/partners/update-partner', this.partnerId]);
    }
  }

  /**
   * Open change status modal
   */
  changeStatus(partner: SinglePartner): void {
    const dialogRef = this.dialog.open(ChangeStatusModal, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        partnerId: partner.id,
        partnerName: partner.name,
        currentStatus: partner.status
      },
      disableClose: false,
      panelClass: 'status-modal-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.statusChanged) {
        // Reload partner to get updated status
        this.loadPartner();
      }
    });
  }

  /**
   * Open assign bonds modal
   */
  assignBonds(partner: SinglePartner): void {
    import('@shared/components/forms/assign-bonds-modal/assign-bonds-modal').then(m => {
      const dialogRef = this.dialog.open(m.AssignBondsModal, {
        width: '800px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          partnerId: partner.id,
          partnerName: partner.name,
          // SinglePartner doesn't include allowedBonds - modal will load them separately
          alreadyAssignedBondIds: []
        },
        disableClose: false,
        panelClass: 'assign-bonds-modal-panel'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.bondsAssigned) {
          // Reload partner to get updated bond assignments
          this.loadPartner();
        }
      });
    });
  }

  /**
   * View partner bonds
   */
  viewBonds(partnerId: number): void {
    this.router.navigate(['/bonds'], {
      queryParams: { partnerId }
    });
  }

  /**
   * View partner customers
   */
  viewCustomers(partner: SinglePartner): void {
    // this.router.navigate(['/customers/list'], {
    //   queryParams: { partnerId }
    // });
    import('@shared/components/ui/partner-customers-modal/partner-customers-modal').then(m => {
      this.dialog.open(m.PartnerCustomersModal, {
        width: '90vw',
        maxWidth: '1400px',
        height: '90vh',
        maxHeight: '90vh',
        disableClose: true,
        panelClass: 'partner-customers-modal-panel',
        data: {
          partnerId: partner.id,
          partnerName: partner.name
        }
      });
    });
  }

  /**
   * View bond transactions
   */
  viewTransactions(partnerId: number): void {
    this.router.navigate(['/bond-transactions'], {
      queryParams: { partnerId }
    });
  }

  /**
   * Get initials for avatar
   */
  getInitials(name: string): string {
    if (!name) return 'PA';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Get status class
   */
  getStatusClass(status: PartnerStatus): string {
    const statusClasses: Record<PartnerStatus, string> = {
      active: 'status-active',
      suspended: 'status-suspended',
      inactive: 'status-inactive'
    };
    return statusClasses[status] || '';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number | undefined | null): string {
    if (!amount) return 'XAF 0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount).replace('XAF', 'XAF ');
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format number
   */
  formatNumber(num: number | undefined | null): string {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * Copy to clipboard
   */
  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${label} copied to clipboard`);
      // TODO: Add toast notification
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}