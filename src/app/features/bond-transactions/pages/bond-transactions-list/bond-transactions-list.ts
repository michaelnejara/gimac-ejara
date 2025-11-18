// src/app/features/bond-transactions/pages/bond-transactions-list/bond-transactions-list.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, startWith, switchMap, catchError } from 'rxjs/operators';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Shared
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumnDirective, TableActionsDirective } from '@shared/components/data-table/data-table-directives';
import {
  TableConfig,
  TableColumn,
  TablePageEvent,
  TableSortEvent
} from '@core/models/table-config.models';

// Store
import { BondTransactionsActions } from '@store/bond-transactions/bond-transactions.actions';
import {
  selectCurrentPageTransactions,
  selectLoading,
  selectError,
  selectPagination,
  selectTransactionStats
} from '@store/bond-transactions/bond-transactions.state';

// Models
import {
  BondTransaction,
  TransactionFilterParams,
  TransactionStatus,
  TransactionType,
  TransactionStats
} from '@core/models/bond-transaction.models';
import { Partner } from '@core/models/partner.models';
import { Customer } from '@core/models/customer.models';
import { Bond } from '@core/models/bond.models';

// Services
import { PartnersService } from '@core/services/partners/partners.service';
import { CustomersService } from '@core/services/customers/customers.service';
import { BondsService } from '@core/services/bonds/bonds.service';

// Modal
import { ChangeTransactionStatusModal } from '@shared/components/forms/change-transaction-status-modal/change-transaction-status-modal';
import { CapitalizePipe } from '@core/utils/pipes/capitalize.pipe';

@Component({
  selector: 'app-bond-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    MatSnackBarModule,
    MatAutocompleteModule,
    DataTable,
    TableColumnDirective,
    TableActionsDirective,
    CapitalizePipe
  ],
  templateUrl: './bond-transactions-list.html',
  styleUrl: './bond-transactions-list.scss'
})
export class BondTransactionsList implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private partnersService = inject(PartnersService);
  private customersService = inject(CustomersService);
  private bondsService = inject(BondsService);
  private destroy$ = new Subject<void>();
  private filterSubscriptions$ = new Subject<void>();

  // Observables
  transactions$!: Observable<BondTransaction[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  pagination$!: Observable<any>;
  activeFiltersCount$!: Observable<number>;
  stats$!: Observable<TransactionStats | null>;

  // Autocomplete observables
  filteredPartners$!: Observable<Partner[]>;
  filteredCustomers$!: Observable<Customer[]>;
  filteredBonds$!: Observable<Bond[]>;

  // UI State
  filterPanelOpen = false;
  hasUnappliedFilters = false;
  fromPartnerPage = false;
  partnerIdFromQuery: number | null = null;
  partnerInfo: { name: string; code: string } | null = null;

  // Filter Form
  filterForm!: FormGroup;

  // Date constraints
  maxDate = new Date();

  // Dropdown Options
  statusOptions: { value: TransactionStatus | string; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  typeOptions: { value: TransactionType | string; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'withdrawal', label: 'Withdrawal' }
  ];

  // Available statuses for status change (confirmed status is system-managed, not manually settable)
  availableStatusesForChange: TransactionStatus[] = ['pending', 'processing', 'confirmed', 'failed', 'cancelled'];

  // Table Configuration
  tableConfig!: TableConfig<BondTransaction>;

  ngOnInit(): void {
    this.checkQueryParams();
    this.initializeFilterForm();
    this.initializeObservables();
    this.initializeTableConfig();
    this.setupFilterSubscriptions();
    this.setupTableSubscriptions();
    this.setupAutocomplete();
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.filterSubscriptions$.next();
    this.filterSubscriptions$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check for query parameters (partnerId from partner page)
   */
  private checkQueryParams(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['partnerId']) {
        this.partnerIdFromQuery = +params['partnerId'];
        this.fromPartnerPage = true;
      }
    });
  }

  /**
   * Initialize filter form
   */
  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [''],
      type: [''],
      bondId: [''],
      bondSearch: [''],
      partnerId: [{ value: this.partnerIdFromQuery || '', disabled: this.fromPartnerPage }],
      partnerSearch: [{ value: '', disabled: this.fromPartnerPage }],
      customerId: [''],
      customerSearch: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });

    // If coming from partner page, load partner details
    if (this.partnerIdFromQuery) {
      this.loadPartnerDetails(this.partnerIdFromQuery);
    }
  }

  /**
   * Load partner details for display
   */
  private loadPartnerDetails(partnerId: number): void {
    this.partnersService.getPartnerById(partnerId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        // Store partner info for display
        this.partnerInfo = {
          name: response.data.name,
          code: response.data.code
        };

        this.filterForm.patchValue({
          partnerSearch: response.data.name
        });
      },
      error: (err) => {
        console.error('Error loading partner:', err);
        this.snackBar.open('Partner not found', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    this.transactions$ = this.store.select(selectCurrentPageTransactions);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.pagination$ = this.store.select(selectPagination);
    // this.stats$ = this.store.select(selectTransactionStats);

    this.activeFiltersCount$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(formValue => this.countActiveFiltersFromForm(formValue)),
      takeUntil(this.filterSubscriptions$)
    );
  }

  /**
   * Setup autocomplete for searchable dropdowns
   */
  private setupAutocomplete(): void {
    // Partners autocomplete
    this.filteredPartners$ = this.filterForm.get('partnerSearch')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || typeof value !== 'string') return of([]);
        return this.searchPartners(value);
      })
    );

    // Customers autocomplete
    this.filteredCustomers$ = this.filterForm.get('customerSearch')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || typeof value !== 'string') return of([]);
        return this.searchCustomers(value);
      })
    );

    // Bonds autocomplete
    this.filteredBonds$ = this.filterForm.get('bondSearch')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || typeof value !== 'string') return of([]);
        return this.searchBonds(value);
      })
    );
  }

  /**
   * Search partners via API
   */
  private searchPartners(query: string): Observable<Partner[]> {
    return this.partnersService.getPartners({
      keyword: query,
      limit: 10
    }).pipe(
      map(response => response.data),
      catchError(() => {
        this.snackBar.open('Error searching partners', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return of([]);
      })
    );
  }

  /**
   * Search customers via API
   */
  private searchCustomers(query: string): Observable<Customer[]> {
    return this.customersService.getCustomers({
      keyword: query,
      limit: 10
    }).pipe(
      map(response => response.data),
      catchError(() => {
        this.snackBar.open('Error searching customers', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return of([]);
      })
    );
  }

  /**
   * Search bonds via API
   */
  private searchBonds(query: string): Observable<Bond[]> {
    return this.bondsService.getBonds({
      keyword: query,
      limit: 10,
      status: 'active'
    }).pipe(
      map(response => response.bonds),
      catchError(() => {
        this.snackBar.open('Error searching bonds', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return of([]);
      })
    );
  }

  /**
   * Handle partner selection
   */
  onPartnerSelected(partner: Partner): void {
    this.filterForm.patchValue({
      partnerId: partner.id,
      partnerSearch: partner.name
    });
    this.hasUnappliedFilters = true;
  }

  /**
   * Handle customer selection
   */
  onCustomerSelected(customer: Customer): void {
    this.filterForm.patchValue({
      customerId: customer.id,
      customerSearch: `${customer.firstName} ${customer.lastName}`
    });
    this.hasUnappliedFilters = true;
  }

  /**
   * Handle bond selection
   */
  onBondSelected(bond: Bond): void {
    this.filterForm.patchValue({
      bondId: bond.id,
      bondSearch: bond.name
    });
    this.hasUnappliedFilters = true;
  }

  /**
   * Display functions for autocomplete
   */
  displayPartner(partner: Partner): string {
    return partner?.name || '';
  }

  displayCustomer(customer: Customer): string {
    return customer ? `${customer.firstName} ${customer.lastName}` : '';
  }

  displayBond(bond: Bond): string {
    return bond?.name || '';
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
      emptyMessage: 'No transactions found',
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
  private getTableColumns(): TableColumn<BondTransaction>[] {
    return [
      {
        key: 'transactionReference',
        label: 'Reference',
        type: 'template',
        sortable: false,
        width: '180px'
      },
      // {
      //   key: 'transactionReference',
      //   label: 'Reference',
      //   type: 'template',
      //   sortable: false,
      //   width: '180px'
      // },
      {
        key: 'transactionType',
        label: 'Type',
        type: 'badge',
        sortable: false,
        width: '130px',
        badgeConfig: {
          colorMap: {
            'deposit': 'primary',
            'purchase': 'success',
            'withdrawal': 'info'
          }
        }
      },
      {
        key: 'customerFirstName',
        label: 'Customer',
        type: 'template',
        sortable: false,
        width: '220px'
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'template',
        align: 'right',
        sortable: false,
        width: '160px'
      },
      {
        key: 'fee',
        label: 'Fee',
        type: 'template',
        align: 'right',
        sortable: false,
        width: '130px'
      },
      {
        key: 'dateCreated',
        label: 'Date',
        type: 'template',
        sortable: false,
        width: '170px'
      },
      {
        key: 'paymentStatus',
        label: 'Payment',
        type: 'badge',
        sortable: false,
        width: '120px',
        badgeConfig: {
          colorMap: {
            'pending': 'warning',
            'completed': 'success',
            'failed': 'error'
          }
        }
      },
      {
        key: 'blockchainStatus',
        label: 'Blockchain',
        type: 'badge',
        sortable: false,
        width: '130px',
        badgeConfig: {
          colorMap: {
            'pending': 'warning',
            'confirmed': 'success',
            'failed': 'error'
          }
        }
      }
    ];
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
   * Setup filter subscriptions
   */
  private setupFilterSubscriptions(): void {
    // Complete previous filter subscriptions
    this.filterSubscriptions$.next();
    this.filterSubscriptions$.complete();
    // Create new Subject
    this.filterSubscriptions$ = new Subject<void>();

    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.filterSubscriptions$)
    ).subscribe(() => {
      this.hasUnappliedFilters = true;
    });
  }

  /**
   * Load transactions
   */
  loadTransactions(): void {
    const filters: TransactionFilterParams = {
      partnerId: this.partnerIdFromQuery || undefined,
      limit: 20,
      offset: 0
    };
    this.store.dispatch(BondTransactionsActions.loadTransactions({ filters }));
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    const formValue = this.filterForm.value;
    const dateRange = formValue.dateRange;

    const filters: TransactionFilterParams = {
      status: formValue.status || undefined,
      type: formValue.type || undefined,
      bondId: formValue.bondId ? +formValue.bondId : undefined,
      partnerId: this.fromPartnerPage ? this.partnerIdFromQuery! : (formValue.partnerId ? +formValue.partnerId : undefined),
      customerId: formValue.customerId ? +formValue.customerId : undefined,
      dateFrom: dateRange?.start ? this.formatDateForApi(dateRange.start) as any : undefined,
      dateTo: dateRange?.end ? this.formatDateForApi(dateRange.end) as any : undefined,
      limit: 20,
      offset: 0
    };

    this.store.dispatch(BondTransactionsActions.loadTransactions({ filters }));
    this.hasUnappliedFilters = false;
    this.filterPanelOpen = false;
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filterForm.reset();

    // If coming from partner page, maintain partner ID
    if (this.fromPartnerPage && this.partnerIdFromQuery) {
      this.filterForm.patchValue({
        partnerId: this.partnerIdFromQuery
      });
      this.loadPartnerDetails(this.partnerIdFromQuery);
    }

    this.loadTransactions();
    this.hasUnappliedFilters = false;
  }

  /**
   * Show all partners - Reset page to default mode
   */
  showAllPartners(): void {
    // Reset partner page flags
    this.fromPartnerPage = false;
    this.partnerIdFromQuery = null;
    this.partnerInfo = null;

    // Re-enable partner filter fields
    this.filterForm.get('partnerId')?.enable();
    this.filterForm.get('partnerSearch')?.enable();

    // Reset form
    this.filterForm.reset();

    // Navigate to bond transactions without query params
    this.router.navigate(['/bond-transactions']);

    // Load all transactions
    const filters: TransactionFilterParams = {
      limit: 20,
      offset: 0
    };
    this.store.dispatch(BondTransactionsActions.loadTransactions({ filters }));

    this.hasUnappliedFilters = false;
    this.filterPanelOpen = false;

    // Show success message
    this.snackBar.open('Now showing transactions for all partners', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Count active filters from form
   */
  private countActiveFiltersFromForm(formValue: any): number {
    let count = 0;

    if (formValue.status) count++;
    if (formValue.type) count++;
    if (formValue.bondId) count++;
    if (formValue.partnerId && !this.fromPartnerPage) count++; // Don't count locked partner filter
    if (formValue.customerId) count++;
    if (formValue.dateRange?.start || formValue.dateRange?.end) count++;

    return count;
  }

  /**
   * Get active filters count for display
   */
  getActiveFiltersCount(): number {
    return this.countActiveFiltersFromForm(this.filterForm.value);
  }

  /**
   * Toggle filter panel
   */
  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  /**
   * Check if transaction can be status changed
   * Cannot change status if blockchain is confirmed
   */
  canChangeStatus(transaction: BondTransaction): boolean {
    // Cannot change if confirmed on blockchain
    return transaction.blockchainStatus !== 'confirmed';
  }

  /**
   * Change transaction status
   */
  changeStatus(transaction: BondTransaction): void {
    const dialogRef = this.dialog.open(ChangeTransactionStatusModal, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false, // Allow closing
      data: {
        transaction,
        availableStatuses: this.availableStatusesForChange
      }
    });

    // Modal now handles everything internally:
    // - Makes API call
    // - Shows loading state
    // - Dispatches to store on success
    // - Shows success/error notifications
    // - Reloads transaction list
    // Parent component doesn't need to do anything except maybe log
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('Transaction status updated successfully');
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: TablePageEvent): void {
    const currentPageSize = this.tableConfig.pagination?.pageSize || 20;

    if (event.pageSize !== currentPageSize) {
      this.store.dispatch(BondTransactionsActions.changePageSize({ limit: event.pageSize }));
    } else {
      this.store.dispatch(BondTransactionsActions.changePage({ 
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

  /**
   * Format date for API (DD/MM/YYYY format)
   */
  private formatDateForApi(date: Date | string | null): string | null {
    if (!date) return null;
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${year}-${month}-${day}`;
  }

  /**
   * Format currency for display
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
   * Format number with K, M, B suffixes
   */
  formatNumberShort(num: number): string {
    if (num === null || num === undefined) return '0';
    
    const absNum = Math.abs(num);
    
    if (absNum >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (absNum >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (absNum >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString();
  }

  /**
   * Format full number for tooltip
   */
  formatNumberFull(num: number): string {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
  }

  /**
   * Check if number should be abbreviated
   */
  shouldAbbreviate(num: number): boolean {
    return Math.abs(num) >= 1000;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(s => s.value === status);
    return option ? option.label : status;
  }

  /**
   * Get type label
   */
  getTypeLabel(type: string): string {
    const option = this.typeOptions.find(t => t.value === type);
    return option ? option.label : type;
  }
}