import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Shared Components
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumnDirective, TableActionsDirective } from '@shared/components/data-table/data-table-directives';

// Modals
import { ChangeStatusModal } from '@shared/components/forms/change-status-modal/change-status-modal';
import { AssignBondsModal } from '@shared/components/forms/assign-bonds-modal/assign-bonds-modal';

// Models
import { 
  TableConfig, 
  TableColumn, 
  TablePageEvent, 
  TableSortEvent 
} from '@core/models/table-config.models';
import { Partner, PartnerFilterParams, PartnerStatus } from '@core/models/partner.models';

// Store
import { PartnersActions } from '@store/partners/partners.actions';
import {
  selectCurrentPagePartners,
  selectLoading,
  selectError,
  selectTotal,
  selectPagination,
  selectCreating,
  selectUpdating,
  selectDeleting,
  selectActivePartners,
  selectSuspendedPartners,
  selectInactivePartners
} from '@store/partners/partners.state';

@Component({
  selector: 'app-partners-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    DataTable,
    TableColumnDirective,
    TableActionsDirective
  ],
  templateUrl: './partners-list.html',
  styleUrl: './partners-list.scss'
})
export class PartnersList implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // State
  partners$: Observable<Partner[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  total$: Observable<number>;
  pagination$: Observable<{
    total: number;
    limit: number;
    offset: number;
    currentPage: number;
    totalPages: number;
  }>;

  // Operation states
  creating$: Observable<boolean>;
  updating$: Observable<boolean>;
  deleting$: Observable<boolean>;

  // Stats (typed as any[] to handle Partner | SinglePartner union from store)
  activePartners$: Observable<any[]>;
  suspendedPartners$: Observable<any[]>;
  inactivePartners$: Observable<any[]>;

  // Filter Form
  filterForm!: FormGroup;
  
  // Status options
  statusOptions: { value: PartnerStatus | '', label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Table Configuration
  tableConfig!: TableConfig<Partner>;

  // Active Filters Count
  activeFiltersCount$!: Observable<number>;

  // Add this property
  hasUnappliedFilters = false;

  // Add these properties
  filtersExpanded = false;

  constructor() {
    this.partners$ = this.store.select(selectCurrentPagePartners);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.total$ = this.store.select(selectTotal);
    this.pagination$ = this.store.select(selectPagination);
    this.creating$ = this.store.select(selectCreating);
    this.updating$ = this.store.select(selectUpdating);
    this.deleting$ = this.store.select(selectDeleting);
    
    // Stats selectors
    this.activePartners$ = this.store.select(selectActivePartners);
    this.suspendedPartners$ = this.store.select(selectSuspendedPartners);
    this.inactivePartners$ = this.store.select(selectInactivePartners);
  }

  ngOnInit(): void {
    this.initializeFilterForm();
    this.tableConfig = this.buildTableConfig();
    this.loadPartners();
    this.setupFilterChangeTracking();
    this.setupActiveFiltersCount();
    this.setupPaginationSync();
    this.setupLoadingSync();
  }

  /**
   * Toggle filters collapse/expand
   */
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  ngOnDestroy(): void {
    // Reset to first page when leaving the list view
    this.store.dispatch(PartnersActions.resetToFirstPage());

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize filter form
   */
  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      status: [''],
      code: [''],
      name: [''],
      minCommissionRate: [null],
      maxCommissionRate: [null],
      bondId: [null]
    });
  }

  /**
   * Build table configuration
   */
  private buildTableConfig(): TableConfig<Partner> {
    return {
      columns: this.getColumns(),
      showActions: true,
      actionsLabel: 'Actions',
      actionsWidth: '80px',
      highlightOnHover: true,
      emptyMessage: 'No partners found',
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
   * Get table columns
   */
  private getColumns(): TableColumn<Partner>[] {
    return [
      {
        key: 'name',
        label: 'Partner Name',
        type: 'template',
        sortable: true,
        width: '250px'
      },
      {
        key: 'code',
        label: 'Code',
        type: 'text',
        sortable: true,
        width: '120px'
      },
      {
        key: 'status',
        label: 'Status',
        type: 'template',
        sortable: true,
        width: '120px'
      },
      {
        key: 'commissionRate',
        label: 'Commission',
        type: 'template',
        sortable: true,
        width: '120px'
      },
      {
        key: 'allowedBonds',
        label: 'Bonds',
        type: 'template',
        width: '100px'
      },
      // Note: activeCustomers and totalVolume are not in Partner API response
      // These would require a separate statistics endpoint integration
      {
        key: 'createdAt',
        label: 'Created',
        type: 'template',
        sortable: true,
        width: '140px'
      }
    ];
  }

  /**
   * Setup active filters count
   */
  private setupActiveFiltersCount(): void {
    this.activeFiltersCount$ = this.filterForm.valueChanges.pipe(
      debounceTime(100),
      map(() => this.getActiveFiltersCount())
    );
  }

  /**
   * Sync pagination from store
   */
  private setupPaginationSync(): void {
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
   * Sync loading state
   */
  private setupLoadingSync(): void {
    this.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.tableConfig = {
        ...this.tableConfig,
        loading
      };
    });
  }

  /**
   * Get active filters count
   */
  private getActiveFiltersCount(): number {
    const formValue = this.filterForm.value;
    let count = 0;

    if (formValue.keyword) count++;
    if (formValue.status) count++;
    if (formValue.code) count++;
    if (formValue.name) count++;
    if (formValue.minCommissionRate !== null && formValue.minCommissionRate !== '') count++;
    if (formValue.maxCommissionRate !== null && formValue.maxCommissionRate !== '') count++;
    if (formValue.bondId !== null && formValue.bondId !== '') count++;

    return count;
  }

  /**
   * Load partners with filters
   * Uses cache-aware action to avoid redundant API calls
   */
  loadPartners(): void {
    const formValue = this.filterForm.value;
    const currentPagination = this.tableConfig.pagination;

    const filters: PartnerFilterParams = {
      keyword: formValue.keyword || undefined,
      status: formValue.status || undefined,
      code: formValue.code || undefined,
      name: formValue.name || undefined,
      minCommissionRate: formValue.minCommissionRate || undefined,
      maxCommissionRate: formValue.maxCommissionRate || undefined,
      bondId: formValue.bondId || undefined,
      limit: currentPagination?.pageSize || 20,
      offset: ((currentPagination?.pageIndex || 0) * (currentPagination?.pageSize || 20)),
      sortBy: 'dateCreated',
      sortOrder: 'desc'
    };

    // Use cache-aware action - checks cache before making API call
    this.store.dispatch(PartnersActions.checkAndLoadPartners({ filters }));
  }

  /**
   * Track filter changes without auto-applying
   */
  private setupFilterChangeTracking(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hasUnappliedFilters = true;
    });
  }

  /**
   * Apply filters manually
   * Note: When filters change, we want fresh data (bypass cache)
   */
  applyFilters(): void {
    this.hasUnappliedFilters = false;

    // Reset to first page when applying new filters
    this.tableConfig = {
      ...this.tableConfig,
      pagination: {
        ...this.tableConfig.pagination!,
        pageIndex: 0
      }
    };

    // Get filter values
    const formValue = this.filterForm.value;

    const filters: PartnerFilterParams = {
      keyword: formValue.keyword || undefined,
      status: formValue.status || undefined,
      code: formValue.code || undefined,
      name: formValue.name || undefined,
      minCommissionRate: formValue.minCommissionRate || undefined,
      maxCommissionRate: formValue.maxCommissionRate || undefined,
      bondId: formValue.bondId || undefined,
      limit: 20,
      offset: 0,
      sortBy: 'dateCreated',
      sortOrder: 'desc'
    };

    // Use direct load for filter changes (bypass cache to get fresh data)
    this.store.dispatch(PartnersActions.loadPartners({ filters }));
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      keyword: '',
      status: '',
      code: '',
      name: '',
      minCommissionRate: null,
      maxCommissionRate: null,
      bondId: null
    });
    
    this.hasUnappliedFilters = false;
    
    // Reset pagination to first page
    this.tableConfig = {
      ...this.tableConfig,
      pagination: {
        ...this.tableConfig.pagination!,
        pageIndex: 0
      }
    };
    
    this.loadPartners();
  }

  /**
   * Navigate to add partner page
   */
  addNewPartner(): void {
    this.router.navigate(['/partners/add-partner']);
  }

  /**
   * Handle page change
   */
  onPageChange(event: TablePageEvent): void {
    this.tableConfig = {
      ...this.tableConfig,
      pagination: {
        ...this.tableConfig.pagination!,
        pageIndex: event.pageIndex,
        pageSize: event.pageSize
      }
    };
    
    this.loadPartners();
  }

  /**
   * Handle sort change
   */
  onSortChange(event: TableSortEvent): void {
    console.log('Sort changed:', event);
    // TODO: Update filters with sort and reload
  }

  // Action Handlers (for menu items)

  /**
   * View partner details
   */
  viewPartner(partner: Partner): void {
    this.router.navigate(['/partners/details', partner.id]);
  }

  /**
   * View partner bonds
   */
  viewPartnerBonds(partner: Partner): void {
    this.router.navigate(['/bonds'], {
      queryParams: { partnerId: partner.id }
    });
  }

  /**
   * Edit partner
   */
  editPartner(partner: Partner): void {
    this.router.navigate(['/partners/update-partner/', partner.id]);
  }

  /**
   * Change partner status using modal
   */
  changeStatus(partner: Partner): void {
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
        // Reload partners list to reflect status change
        this.loadPartners();
      }
    });
  }

  /**
   * Assign bonds to partner using modal
   */
  assignBonds(partner: Partner): void {
    const dialogRef = this.dialog.open(AssignBondsModal, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        partnerId: partner.id,
        partnerName: partner.name,
        alreadyAssignedBondIds: partner.allowedBonds?.map(bond => bond.id) || []
      },
      disableClose: false,
      panelClass: 'assign-bonds-modal-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.bondsAssigned) {
        // Reload partners list to reflect bond assignments
        this.loadPartners();
      }
    });
  }

  /**
   * Delete partner
   */
  deletePartner(partner: Partner): void {
    if (confirm(`Are you sure you want to delete ${partner.name}?`)) {
      this.store.dispatch(PartnersActions.deletePartner({ partnerId: partner.id }));
    }
  }

  // Template Helper Methods

  /**
   * Get status badge class
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
  formatCurrency(amount: number): string {
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
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format time
   */
  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format number
   */
  formatNumber(num: number): string {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * Get initials for avatar
   */
  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}