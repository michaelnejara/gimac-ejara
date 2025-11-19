// src/app/features/partners/pages/partner-details/partner-details.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Store
import { PartnersActions } from '@store/partners/partners.actions';
import {
  selectPartnerById,
  selectPartnerLoading,
  selectPartnerError
} from '@store/partners/partners.state';
import { CustomersActions } from '@store/customers/customers.actions';
import {
  selectCurrentPageCustomers,
  selectLoading as selectCustomersLoading,
  selectPagination as selectCustomersPagination
} from '@store/customers/customers.state';

// Models
import { SinglePartner, PartnerStatus } from '@core/models/partner.models';
import { Customer, CustomerFilterParams } from '@core/models/customer.models';

// Components
import { ChangeStatusModal } from '@shared/components/forms/change-status-modal/change-status-modal';

@Component({
  selector: 'app-partner-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatPaginatorModule
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
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  partnerId: number | null = null;
  // Partner details page always loads SinglePartner (from GET /partners/:id)
  partner$!: Observable<SinglePartner | undefined>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  // Customers
  customers$!: Observable<Customer[]>;
  customersLoading$!: Observable<boolean>;
  customersPagination$!: Observable<any>;

  // Customer filters
  customerFilterForm!: FormGroup;
  filtersExpanded = false;
  pageSize = 10;
  pageIndex = 0;

  // Country codes
  countryCodes = [
    { code: '', name: 'All Countries' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'KE', name: 'Kenya' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'CI', name: "Côte d'Ivoire" },
    { code: 'SN', name: 'Senegal' }
  ];

  // UI state
  showApiSecret = false;
  fabMenuOpen = false;

  /**
   * Toggle API secret visibility
   */
  toggleApiSecret(): void {
    this.showApiSecret = !this.showApiSecret;
  }

  /**
   * Toggle FAB menu
   */
  toggleFabMenu(): void {
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  /**
   * Close FAB menu
   */
  closeFabMenu(): void {
    this.fabMenuOpen = false;
  }

  /**
   * Mask secret string
   */
  maskSecret(secret: string): string {
    if (!secret) return '••••••••';
    if (secret.length <= 8) return '••••••••';
    return secret.substring(0, 4) + '••••••••' + secret.substring(secret.length - 4);
  }

  ngOnInit(): void {
    // Initialize customer filter form
    this.customerFilterForm = this.fb.group({
      keyword: [''],
      email: [''],
      phone: [''],
      countryCode: ['']
    });

    // Get partner ID from route
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.partnerId = +params['id'];
        this.loadPartner();
      }
    });

    // Setup filter form subscription
    this.customerFilterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.applyCustomerFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load partner details
   * Uses cache-aware action to avoid redundant API calls
   */
  private loadPartner(): void {
    if (!this.partnerId) return;

    // Cast to SinglePartner as details endpoint returns SinglePartner
    this.partner$ = this.store.select(selectPartnerById(this.partnerId)).pipe(
      map(partner => partner as SinglePartner | undefined)
    );
    this.loading$ = this.store.select(selectPartnerLoading(this.partnerId));
    this.error$ = this.store.select(selectPartnerError(this.partnerId));

    // Use cache-aware action - checks cache before making API call
    this.store.dispatch(PartnersActions.checkAndLoadPartner({
      partnerId: this.partnerId
    }));

    // Load customers for this partner
    this.loadCustomers();
  }

  /**
   * Load partner customers
   */
  private loadCustomers(): void {
    if (!this.partnerId) return;

    // Setup customers observables
    this.customers$ = this.store.select(selectCurrentPageCustomers);
    this.customersLoading$ = this.store.select(selectCustomersLoading);
    this.customersPagination$ = this.store.select(selectCustomersPagination);

    // Load customers with partner filter
    this.applyCustomerFilters();
  }

  /**
   * Apply customer filters
   */
  applyCustomerFilters(): void {
    if (!this.partnerId) return;

    const formValue = this.customerFilterForm?.value || {};

    const filters: CustomerFilterParams = {
      partnerId: this.partnerId,
      keyword: formValue.keyword || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      countryCode: formValue.countryCode || undefined,
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize
    };

    this.store.dispatch(CustomersActions.loadCustomers({ filters }));
  }

  /**
   * Handle customer page change
   */
  onCustomerPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyCustomerFilters();
  }

  /**
   * Toggle filters expanded
   */
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  /**
   * Reset customer filters
   */
  resetCustomerFilters(): void {
    this.customerFilterForm.reset({
      keyword: '',
      email: '',
      phone: '',
      countryCode: ''
    });
    this.pageIndex = 0;
    this.applyCustomerFilters();
  }

  /**
   * Count active filters
   */
  countActiveFilters(): number {
    if (!this.customerFilterForm) return 0;
    const formValue = this.customerFilterForm.value;
    let count = 0;
    if (formValue.keyword) count++;
    if (formValue.email) count++;
    if (formValue.phone) count++;
    if (formValue.countryCode) count++;
    return count;
  }

  /**
   * Get customer initials
   */
  getCustomerInitials(customer: Customer): string {
    const firstInitial = customer.firstName?.[0] || '';
    const lastInitial = customer.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'CU';
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
      if (result?.statusChanged && this.partnerId) {
        // Force reload partner to get updated status (bypass cache)
        this.store.dispatch(PartnersActions.checkAndLoadPartner({
          partnerId: this.partnerId,
          forceReload: true
        }));
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