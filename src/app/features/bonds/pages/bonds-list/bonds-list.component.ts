// src/app/features/bonds/pages/bonds-list/bonds-list.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Shared
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumnDirective, TableActionsDirective } from '@shared/components/data-table/data-table-directives';
import {
  TableConfig,
  TableColumn,
  TablePageEvent,
  TableSortEvent
} from '@core/models/table-config.models';

// Store - Bonds Actions
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectCurrentPageBonds,
  selectCustomerBonds,
  selectLoading,
  selectError,
  selectPagination,
  selectFilters
} from '@store/bonds/bonds.state';

// Store - Partners Actions (for assigning/removing bonds)
import { PartnersActions } from '@store/partners/partners.actions';

// Models
import { 
  Bond, 
  CustomerBondHolding,
  BondFilterParams,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  BondStatus,
  CurrencyCode
} from '@core/models/bond.models';
import {
  RemoveBondsRequest
} from '@core/models/partner.models';

// Components
import { AssignBondsModal } from '@shared/components/forms/assign-bonds-modal/assign-bonds-modal';
import { ConfirmBondsModal } from '@shared/components/forms/confirm-bonds-modal/confirm-bonds-modal';

// Types
type BondContextType = 'default' | 'partner' | 'customer';

@Component({
  selector: 'app-bonds-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    DataTable,
    TableColumnDirective,
    TableActionsDirective,
    RouterModule
  ],
  templateUrl: './bonds-list.component.html',
  styleUrl: './bonds-list.component.scss'
})
export class BondsListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // Context
  context: BondContextType = 'default';
  partnerId: number | null = null;
  customerId: number | null = null;

  // Observables
  bonds$!: Observable<Bond[] | CustomerBondHolding[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  pagination$!: Observable<any>;
  currentFilters$!: Observable<any>;
  activeFiltersCount$!: Observable<number>;

  // UI State
  filtersExpanded = false;
  hasUnappliedFilters = false;

  // Filter Form
  filterForm!: FormGroup;

  // Date validators
  maxDate = new Date(); // Today

  // Dropdown Options
  statusOptions: { value: BondStatus | string; label: string }[] = [];
  currencyOptions: { value: CurrencyCode; label: string }[] = [
    { value: 'XAF', label: 'XAF - Central African CFA Franc' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'NGN', label: 'NGN - Nigerian Naira' },
    { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
    { value: 'KES', label: 'KES - Kenyan Shilling' }
  ];

  // Table Configuration
  tableConfig!: TableConfig<Bond | CustomerBondHolding>;

  // Customer Holdings Stats (computed from bonds$ for customer context)
  activeHoldingsCount = 0;
  maturedHoldingsCount = 0;

  ngOnInit(): void {
    this.initializeContext();
    this.initializeStatusOptions();
    this.initializeFilterForm();
    this.initializeObservables();
    this.initializeTableConfig();
    this.setupFilterSubscriptions();
    this.setupTableSubscriptions();
    this.setupHoldingsStatsSubscription();
    this.setupDateValidation();
    this.loadBonds();
  }

  ngOnDestroy(): void {
    // Reset to first page when leaving the bonds list
    this.store.dispatch(BondsActions.resetToFirstPage());

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize context from query params
   */
  private initializeContext(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const hasPartnerId = params['partnerId'];
      const hasCustomerId = params['customerId'];

      if (hasPartnerId && hasCustomerId) {
        this.context = 'customer';
        this.partnerId = +params['partnerId'];
        this.customerId = +params['customerId'];

        // Reset store when entering customer context (fresh data needed)
        this.store.dispatch(BondsActions.resetForContextView());
        this.store.dispatch(BondsActions.setViewMode({ mode: 'customer' }));
        this.store.dispatch(BondsActions.setActivePartner({ partnerId: this.partnerId }));
      } else if (hasPartnerId && !hasCustomerId) {
        this.context = 'partner';
        this.partnerId = +params['partnerId'];
        this.customerId = null;

        // Reset store when entering partner context (fresh data needed)
        this.store.dispatch(BondsActions.resetForContextView());
        this.store.dispatch(BondsActions.setViewMode({ mode: 'partner' }));
        this.store.dispatch(BondsActions.setActivePartner({ partnerId: this.partnerId }));
      } else {
        this.context = 'default';
        this.partnerId = null;
        this.customerId = null;
        this.store.dispatch(BondsActions.setViewMode({ mode: 'all' }));
        this.store.dispatch(BondsActions.setActivePartner({ partnerId: null }));
      }
    });
  }

  /**
   * Initialize status options based on context
   */
  private initializeStatusOptions(): void {
    if (this.context === 'customer') {
      this.statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'matured', label: 'Matured' },
        { value: 'withdrawn', label: 'Withdrawn' }
      ];
    } else {
      this.statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'sold-out', label: 'Sold Out' },
        { value: 'pre-allocation', label: 'Pre Allocation' },
        { value: 'matured', label: 'Matured' }
      ];
    }
  }

  /**
   * Initialize filter form based on context
   */
  private initializeFilterForm(): void {
    if (this.context === 'customer') {
      this.filterForm = this.fb.group({
        partnerId: [this.partnerId || ''],
        customerId: [this.customerId || ''],
        bondId: [''],
        bondName: [''],
        status: [''],
        keyword: ['']
      });
    } else if (this.context === 'partner') {
      this.filterForm = this.fb.group({
        status: [''],
        keyword: [''],
        bondCode: [''],
        bondName: ['']
      });
    } else {
      this.filterForm = this.fb.group({
        bondName: [''],
        bondCode: [''],
        status: [''],
        defaultFiatCurrency: [''],
        issuerNameEn: [''],
        keyword: [''],
        // Date range for creation date
        creationDateStart: [''],
        creationDateEnd: [''],
        // Date range for maturity date
        maturityDateStart: [''],
        maturityDateEnd: ['']
      });
    }
  }

  /**
   * Setup date validation
   */
  private setupDateValidation(): void {
    if (this.context === 'default') {
      // Validate creation dates are not in the future
      this.validateDateNotFuture('creationDateStart');
      this.validateDateNotFuture('creationDateEnd');

      // Validate date ranges
      this.setupDateRangeValidation('creationDateStart', 'creationDateEnd');
      this.setupDateRangeValidation('maturityDateStart', 'maturityDateEnd');
    }
  }

  /**
   * Date validator - ensures date is not in the future
   */
  private validateDateNotFuture(controlName: string): void {
    const control = this.filterForm.get(controlName);
    if (control) {
      control.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(value => {
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999); // End of today
          
          if (selectedDate > today) {
            control.setErrors({ futureDate: true });
          } else if (control.hasError('futureDate')) {
            // Clear the error if it was previously set
            const errors = { ...control.errors };
            delete errors['futureDate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      });
    }
  }

  /**
   * Setup date range validation (start date must be before end date)
   */
  private setupDateRangeValidation(startControlName: string, endControlName: string): void {
    const startControl = this.filterForm.get(startControlName);
    const endControl = this.filterForm.get(endControlName);

    if (startControl && endControl) {
      // Validate when start date changes
      startControl.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.validateDateRange(startControl, endControl);
      });

      // Validate when end date changes
      endControl.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.validateDateRange(startControl, endControl);
      });
    }
  }

  /**
   * Validate date range
   */
  private validateDateRange(startControl: any, endControl: any): void {
    const startDate = startControl.value;
    const endDate = endControl.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        endControl.setErrors({ dateRangeInvalid: true });
      } else if (endControl.hasError('dateRangeInvalid')) {
        // Clear the error if it was previously set
        const errors = { ...endControl.errors };
        delete errors['dateRangeInvalid'];
        endControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.pagination$ = this.store.select(selectPagination);
    this.currentFilters$ = this.store.select(selectFilters);

    if (this.context === 'customer') {
      this.bonds$ = this.store.select(selectCustomerBonds);
    } else {
      this.bonds$ = this.store.select(selectCurrentPageBonds);
    }

    this.activeFiltersCount$ = this.currentFilters$.pipe(
      map(filters => this.countActiveFilters(filters))
    );
  }

  /**
   * Initialize table configuration
   */
  private initializeTableConfig(): void {
    this.tableConfig = {
      columns: this.getTableColumns(),
      showActions: true,
      actionsLabel: 'Actions',
      highlightOnHover: true,
      emptyMessage: 'No bonds found',
      loading: false,
      pagination: {
        pageIndex: 0,
        pageSize: 20,
        totalItems: 0,
        pageSizeOptions: [10, 20, 50, 100]
      }
    };
  }

  /**
   * Get table columns based on context
   */
  private getTableColumns(): TableColumn<Bond | CustomerBondHolding>[] {
    if (this.context === 'customer') {
      return [
        {
          key: 'bondName',
          label: 'Bond Name',
          type: 'template',
          sortable: true,
          width: '280px'
        },
        {
          key: 'bondCode',
          label: 'Bond Code',
          type: 'template',
          sortable: true,
          width: '180px'
        },
        {
          key: 'partnerName',
          label: 'Partner',
          type: 'template',
          sortable: true,
          width: '220px'
        },
        {
          key: 'investmentAmount',
          label: 'Investment',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '180px'
        },
        {
          key: 'currentValue',
          label: 'Current Value',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '180px'
        },
        {
          key: 'interestEarned',
          label: 'Interest Earned',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '180px'
        },
        {
          key: 'purchaseDate',
          label: 'Purchase Date',
          type: 'template',
          sortable: true,
          width: '170px'
        },
        {
          key: 'maturityDate',
          label: 'Maturity Date',
          type: 'template',
          sortable: true,
          width: '170px'
        },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: true,
          width: '140px',
          badgeConfig: {
            colorMap: {
              'active': 'success',
              'matured': 'info',
              'withdrawn': 'default'
            }
          }
        }
      ];
    } else if (this.context === 'partner') {
      return [
        {
          key: 'name',
          label: 'Bond Name',
          type: 'template',
          sortable: true,
          width: '280px'
        },
        {
          key: 'code',
          label: 'Bond Code',
          type: 'template',
          sortable: true,
          width: '180px'
        },
        {
          key: 'issuerNameEn',
          label: 'Issuer',
          type: 'template',
          sortable: true,
          width: '220px'
        },
        {
          key: 'amount',
          label: 'Total Amount',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '180px'
        },
        {
          key: 'interestValue',
          label: 'Interest Rate',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '160px'
        },
        {
          key: 'lifetime',
          label: 'Lifetime',
          type: 'template',
          sortable: true,
          width: '150px'
        },
        {
          key: 'maturityDate',
          label: 'Maturity Date',
          type: 'template',
          sortable: true,
          width: '170px'
        },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: true,
          width: '140px',
          badgeConfig: {
            colorMap: {
              'active': 'success',
              'inactive': 'default',
              'matured': 'info'
            }
          }
        }
      ];
    } else {
      return [
        {
          key: 'name',
          label: 'Bond Name',
          type: 'template',
          sortable: true,
          width: '260px'
        },
        {
          key: 'code',
          label: 'Bond Code',
          type: 'template',
          sortable: true,
          width: '180px'
        },
        {
          key: 'issuerNameEn',
          label: 'Issuer',
          type: 'template',
          sortable: true,
          width: '200px'
        },
        {
          key: 'amount',
          label: 'Total Amount',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '170px'
        },
        {
          key: 'interestValue',
          label: 'Interest Rate',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '150px'
        },
        {
          key: 'maturityPercentage',
          label: 'Maturity %',
          type: 'template',
          align: 'right',
          sortable: true,
          width: '150px'
        },
        {
          key: 'lifetime',
          label: 'Lifetime',
          type: 'template',
          sortable: true,
          width: '130px'
        },
        {
          key: 'defaultFiatCurrency',
          label: 'Currency',
          type: 'template',
          sortable: true,
          width: '130px'
        },
        {
          key: 'maturityDate',
          label: 'Maturity Date',
          type: 'template',
          sortable: true,
          width: '170px'
        },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: true,
          width: '140px',
          badgeConfig: {
            colorMap: {
              'active': 'success',
              'inactive': 'default',
              'matured': 'info'
            }
          }
        }
      ];
    }
  }

  /**
   * Setup table subscriptions
   */
  private setupTableSubscriptions(): void {
    this.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.tableConfig = {
        ...this.tableConfig,
        loading
      };
    });

    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination && this.tableConfig.pagination) {
        this.tableConfig = {
          ...this.tableConfig,
          pagination: {
            ...this.tableConfig.pagination,
            pageIndex: pagination.currentPage - 1,
            pageSize: pagination.limit,
            totalItems: pagination.total
          }
        };
      }
    });
  }

  /**
   * Setup holdings stats subscription (customer context only)
   */
  private setupHoldingsStatsSubscription(): void {
    if (this.context === 'customer') {
      this.bonds$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(bonds => {
        const customerBonds = bonds as CustomerBondHolding[];
        this.activeHoldingsCount = customerBonds.filter(b => b.status === 'active').length;
        this.maturedHoldingsCount = customerBonds.filter(b => b.status === 'matured').length;
      });
    }
  }

  /**
   * Setup filter subscriptions
   */
  private setupFilterSubscriptions(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hasUnappliedFilters = true;
    });
  }

  /**
   * Load bonds based on context
   * Note: Partner/customer contexts always load fresh data (resetForContextView already called)
   * Default context uses cache-aware loading
   */
  loadBonds(): void {
    if (this.context === 'customer') {
      if (!this.partnerId || !this.customerId) {
        console.error('Customer bonds require both partnerId and customerId');
        return;
      }

      const filters: CustomerBondFilterParams = {
        partnerId: this.partnerId,
        customerId: this.customerId,
        limit: 20,
        offset: 0
      };
      // Direct load for customer context (cache already cleared in initializeContext)
      this.store.dispatch(BondsActions.loadCustomerBonds({ filters }));
    } else if (this.context === 'partner') {
      if (!this.partnerId) {
        console.error('Partner bonds require partnerId');
        return;
      }

      const filters: PartnerBondFilterParams = {
        partnerId: this.partnerId,
        limit: 20,
        offset: 0
      };
      // Direct load for partner context (cache already cleared in initializeContext)
      this.store.dispatch(BondsActions.loadPartnerBonds({ filters }));
    } else {
      const filters: BondFilterParams = {
        limit: 20,
        offset: 0
      };
      // Use cache-aware action for default context
      this.store.dispatch(BondsActions.checkAndLoadBonds({ filters }));
    }
  }

  /**
   * Apply filters
   * Note: When filters change, we want fresh data (bypass cache)
   */
  applyFilters(): void {
    const formValue = this.filterForm.value;

    if (this.context === 'customer') {
      if (!this.partnerId || !this.customerId) {
        console.error('Customer bonds require both partnerId and customerId');
        return;
      }

      const filters: CustomerBondFilterParams = {
        partnerId: this.partnerId,
        customerId: this.customerId,
        ...formValue,
        limit: 20,
        offset: 0
      };
      // Update filters in store first (for activeFiltersCount)
      this.store.dispatch(BondsActions.applyFilters({ filters: filters as any }));
      // Then load filtered data (bypass cache)
      this.store.dispatch(BondsActions.loadCustomerBonds({ filters }));
    } else if (this.context === 'partner') {
      if (!this.partnerId) {
        console.error('Partner bonds require partnerId');
        return;
      }

      const filters: PartnerBondFilterParams = {
        partnerId: this.partnerId,
        ...formValue,
        limit: 20,
        offset: 0
      };
      // Update filters in store first (for activeFiltersCount)
      this.store.dispatch(BondsActions.applyFilters({ filters: filters as any }));
      // Then load filtered data (bypass cache)
      this.store.dispatch(BondsActions.loadPartnerBonds({ filters }));
    } else {
      const filters: BondFilterParams = {
        ...formValue,
        startDate: formValue.creationDateStart,
        endDate: formValue.creationDateEnd,
        startMaturityDate: formValue.maturityDateStart,
        endMaturityDate: formValue.maturityDateEnd,
        limit: 20,
        offset: 0
      };
      // Update filters in store first (for activeFiltersCount)
      this.store.dispatch(BondsActions.applyFilters({ filters }));
      // Then load filtered data (bypass cache)
      this.store.dispatch(BondsActions.loadBonds({ filters }));
    }

    this.hasUnappliedFilters = false;
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    // Reset the form UI
    this.filterForm.reset();

    // Restore context-specific required values
    if (this.context === 'customer') {
      this.filterForm.patchValue({
        partnerId: this.partnerId,
        customerId: this.customerId
      });
    }

    // Dispatch clear filters action which will reload with empty filters
    this.store.dispatch(BondsActions.clearFilters());
    this.hasUnappliedFilters = false;
  }

  /**
   * Count active filters
   */
  private countActiveFilters(filters: any): number {
    let count = 0;
    const excludeKeys = ['limit', 'offset', 'partnerId', 'customerId'];

    Object.keys(filters).forEach(key => {
      if (!excludeKeys.includes(key) && filters[key]) {
        count++;
      }
    });
    return count;
  }

  /**
   * Toggle filters collapse/expand
   */
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  /**
   * Navigate back to partner profile
   */
  goBack(): void {
    if (this.partnerId) {
      this.router.navigate(['/partners/details', this.partnerId]);
    } else {
      this.router.navigate(['/bonds']);
    }
  }

  /**
   * Navigate to add bond
   */
  addBond(): void {
    this.router.navigate(['/bonds/add-bond']);
  }

  /**
   * View bond details
   */
  viewBond(bond: Bond | CustomerBondHolding): void {
    const bondId = 'bondId' in bond ? bond.bondId : bond.id;
    this.router.navigate(['/bonds/details', bondId]);
  }

  /**
   * Open assign bonds modal (Partner context)
   * Uses PartnersActions.assignBonds
   */
  openAssignBondsModal(): void {
    if (!this.partnerId) return;

    const dialogRef = this.dialog.open(AssignBondsModal, {
      width: '700px',
      maxWidth: '90vw',
      data: { partnerId: this.partnerId },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.bondsAssigned) {
        // Reload partner bonds after assignment
        this.loadBonds();
      }
    });
  }

  /**
   * Unassign bond from partner
   * Uses PartnersActions.removeBonds
   */
  unassignBond(bond: Bond): void {
    if (!this.partnerId) return;

    const dialogRef = this.dialog.open(ConfirmBondsModal, {
      width: '450px',
      data: {
        title: 'Unassign Bond',
        message: `Are you sure you want to unassign "${bond.name}" from this partner?`,
        confirmText: 'Unassign',
        cancelText: 'Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Use PartnersActions.removeBonds (not BondsActions)
        const removeBondsData: RemoveBondsRequest = {
          bondIds: [bond.id]
        };

        this.store.dispatch(PartnersActions.removeBonds({
          partnerId: this.partnerId!,
          bondsData: removeBondsData
        }));

        // Optionally reload bonds after successful removal
        // You might want to listen to PartnersActions.removeBondsSuccess instead
        setTimeout(() => {
          this.loadBonds();
        }, 1000);
      }
    });
  }

  /**
   * Delete bond (Default context only)
   * Uses BondsActions.deleteBond
   */
  deleteBond(bond: Bond): void {
    const dialogRef = this.dialog.open(ConfirmBondsModal, {
      width: '450px',
      data: {
        title: 'Delete Bond',
        message: `Are you sure you want to delete "${bond.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Use BondsActions.deleteBond
        this.store.dispatch(BondsActions.deleteBond({ bondId: bond.id }));

        // Optionally reload bonds after successful deletion
        setTimeout(() => {
          this.loadBonds();
        }, 1000);
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: TablePageEvent): void {
    const currentPageSize = this.tableConfig.pagination?.pageSize || 20;

    if (event.pageSize !== currentPageSize) {
      this.store.dispatch(BondsActions.changePageSize({ limit: event.pageSize }));
    } else {
      this.store.dispatch(BondsActions.changePage({ 
        offset: event.pageIndex * event.pageSize 
      }));
    }
  }

  /**
   * Handle sort change
   */
  onSortChange(event: TableSortEvent): void {
    console.log('Sort changed:', event);
    // TODO: Implement sorting
  }

  // Helper methods for templates
  getInitials(name: string): string {
    if (!name) return 'B';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatCurrency(amount: number, currency: string = 'XAF'): string {
    if (!amount) return `${currency} 0`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount).replace(currency, `${currency} `);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatPercentage(value: number): string {
    return `${value}%`;
  }

  formatTenor(months: number): string {
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${years}y ${remainingMonths}m`;
  }

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
}