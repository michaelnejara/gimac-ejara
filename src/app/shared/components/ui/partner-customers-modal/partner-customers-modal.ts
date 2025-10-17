// src/app/features/partners/components/partner-customers-modal/partner-customers-modal.component.ts
import { Component, inject, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Store
import { CustomersActions } from '@store/customers/customers.actions';
import {
  selectCurrentPageCustomers,
  selectLoading,
  selectError,
  selectPagination,
  selectFilters
} from '@store/customers/customers.state';

// Models
import { Customer, CustomerFilterParams } from '@core/models/customer.models';
import { 
  TableConfig, 
  TableColumn, 
  TablePageEvent, 
  TableSortEvent 
} from '@core/models/table-config.models';

// Shared Components
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumnDirective, TableActionsDirective } from '@shared/components/data-table/data-table-directives';

export interface PartnerCustomersModalData {
  partnerId: number;
  partnerName: string;
}

@Component({
  selector: 'app-partner-customers-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    DataTable,
    TableColumnDirective,
    TableActionsDirective
  ],
  templateUrl: './partner-customers-modal.html',
  styleUrl: './partner-customers-modal.scss'
})
export class PartnerCustomersModal implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<PartnerCustomersModal>);
  private destroy$ = new Subject<void>();
  Math = Math;

  // Observables
  customers$!: Observable<Customer[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  pagination$!: Observable<any>;
  currentFilters$!: Observable<CustomerFilterParams>;

  // Data from parent
  partnerId: number;
  partnerName: string;

  // Filter Form
  filterForm!: FormGroup;

  // UI State
  filtersExpanded = false;
  hasUnappliedFilters = false;

  // Country codes (common ones, can be expanded)
  countryCodes = [
    { code: '', name: 'All Countries' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'KE', name: 'Kenya' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'SN', name: 'Senegal' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'ET', name: 'Ethiopia' }
  ];

  // Table Configuration
  tableConfig!: TableConfig<Customer>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PartnerCustomersModalData) {
    this.partnerId = data.partnerId;
    this.partnerName = data.partnerName;
  }

  ngOnInit(): void {
    this.initializeFilterForm();
    this.initializeObservables();
    this.initializeTableConfig();
    this.setupFilterSubscriptions();
    this.setupTableSubscriptions();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    // Clear filters when modal closes
    this.store.dispatch(CustomersActions.clearFilters());
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize filter form
   */
  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      customerName: [''],
      email: [''],
      phone: [''],
      countryCode: ['']
    });
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    this.customers$ = this.store.select(selectCurrentPageCustomers);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.pagination$ = this.store.select(selectPagination);
    this.currentFilters$ = this.store.select(selectFilters);
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
      emptyMessage: 'No customers found for this partner',
      loading: false,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
        totalItems: 0,
        pageSizeOptions: [10, 20, 50]
      }
    };
  }

  /**
   * Get table columns
   */
  private getTableColumns(): TableColumn<Customer>[] {
    return [
      {
        key: 'customerInfo',
        label: 'Customer',
        type: 'template',
        sortable: true,
        width: '280px'
      },
      {
        key: 'partnerUserId',
        label: 'Partner User ID',
        type: 'text',
        sortable: true,
        width: '180px'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'template',
        sortable: true,
        width: '250px'
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'template',
        sortable: true,
        width: '180px'
      },
      {
        key: 'countryCode',
        label: 'Country',
        type: 'badge',
        align: 'center',
        sortable: true,
        width: '120px',
        badgeConfig: {
          colorMap: {
            'CM': 'primary',
            'NG': 'accent',
            'GH': 'warn',
            'KE': 'primary',
            'ZA': 'accent'
          },
          defaultColor: 'primary'
        }
      },
      {
        key: 'dateCreated',
        label: 'Date Created',
        type: 'template',
        sortable: true,
        width: '180px'
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
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hasUnappliedFilters = true;
    });
  }

  /**
   * Load customers
   */
  loadCustomers(): void {
    const filters: CustomerFilterParams = {
      partnerId: this.partnerId,
      limit: 10,
      offset: 0
    };
    this.store.dispatch(CustomersActions.loadCustomers({ filters }));
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    const formValue = this.filterForm.value;
    
    const filters: CustomerFilterParams = {
      partnerId: this.partnerId,
      keyword: formValue.keyword || undefined,
      customerName: formValue.customerName || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      countryCode: formValue.countryCode || undefined,
      limit: 10,
      offset: 0
    };

    this.store.dispatch(CustomersActions.applyFilters({ filters }));
    this.hasUnappliedFilters = false;
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      keyword: '',
      customerName: '',
      email: '',
      phone: '',
      countryCode: ''
    });
    
    const filters: CustomerFilterParams = {
      partnerId: this.partnerId,
      limit: 10,
      offset: 0
    };
    
    this.store.dispatch(CustomersActions.applyFilters({ filters }));
    this.hasUnappliedFilters = false;
  }

  /**
   * Toggle filters collapse/expand
   */
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  /**
   * View customer's bonds
   */
  viewCustomerBonds(customer: Customer): void {
    // Close modal and navigate
    this.dialogRef.close();
    this.router.navigate(['/bonds/list'], {
      queryParams: { 
        customerId: customer.id,
        partnerId: this.partnerId
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: TablePageEvent): void {
    const currentPageSize = this.tableConfig.pagination?.pageSize || 10;

    if (event.pageSize !== currentPageSize) {
      this.store.dispatch(CustomersActions.changePageSize({ limit: event.pageSize }));
    } else {
      this.store.dispatch(CustomersActions.changePage({ 
        offset: event.pageIndex * event.pageSize 
      }));
    }
  }

  /**
   * Handle sort change
   */
  onSortChange(event: TableSortEvent): void {
    console.log('Sort changed:', event);
    // TODO: Implement sorting if API supports it
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.dialogRef.close();
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
   * Count active filters
   */
  countActiveFilters(): number {
    const formValue = this.filterForm.value;
    let count = 0;
    
    if (formValue.keyword) count++;
    if (formValue.customerName) count++;
    if (formValue.email) count++;
    if (formValue.phone) count++;
    if (formValue.countryCode) count++;
    
    return count;
  }
}