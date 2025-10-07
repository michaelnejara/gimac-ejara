import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Shared
import { DataTable } from '@shared/components/data-table/data-table';
import { SkeletonLoader } from '@shared/components/ui/skeleton-loader/skeleton-loader';
import { 
  TableConfig, 
  TableColumn, 
  TableAction,
  TablePageEvent,
  TableSortEvent 
} from '@core/models/table-config.models';

// Store
import { TransactionsActions } from '@store/transactions/transactions.actions';
import {
  selectCurrentPageTransactions,
  selectTransactionsLoading,
  selectTransactionsPagination,
  selectTransactionsTotalCount,
  selectCurrentFilters
} from '@store/transactions/transactions.state';
import { 
  GimacTransaction, 
  GimacTransactionFilterParams 
} from '@core/models/transaction.models';
import { MatDivider } from "@angular/material/divider";

/**
 * Transaction Filter Options
 */
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Transactions List Component
 * 
 * Main transactions listing page with:
 * - Filtering by status and other criteria
 * - Search functionality
 * - Pagination
 * - Export capabilities
 * - Bulk reconciliation
 * - Individual transaction actions
 * 
 * @example
 * ```html
 * <app-transactions-list></app-transactions-list>
 * ```
 */
@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    DataTable,
    SkeletonLoader,
    MatDivider
],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
})
export class TransactionsListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // Observables
  transactions$: Observable<GimacTransaction[]>;
  loading$: Observable<boolean>;
  totalCount$: Observable<number>;
  pagination$: Observable<any>;
  currentFilters$: Observable<GimacTransactionFilterParams>;

  // Form controls
  searchControl = new FormControl('');
  
  // Filter state
  activeStatusFilter: string = 'all';
  statusFilters: FilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'completed', label: 'Confirmed' },
    { value: 'failed', label: 'Failed' },
    { value: 'initiated', label: 'Initiated' }
  ];

  // Table configuration
  tableConfig!: TableConfig<GimacTransaction>;

  // Unreconciled count
  unreconciledCount = 0;

  constructor() {
    this.transactions$ = this.store.select(selectCurrentPageTransactions);
    this.loading$ = this.store.select(selectTransactionsLoading);
    this.totalCount$ = this.store.select(selectTransactionsTotalCount);
    this.pagination$ = this.store.select(selectTransactionsPagination);
    this.currentFilters$ = this.store.select(selectCurrentFilters);

    // Initialize table configuration
    this.tableConfig = this.buildTableConfig();
  }

  ngOnInit(): void {
    // Load initial transactions
    this.loadTransactions();

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.onSearch(searchTerm || '');
    });

    // Subscribe to pagination changes to update table config
    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination && this.tableConfig.pagination) {
        this.tableConfig.pagination.pageIndex = pagination.currentPageNumber - 1;
        this.tableConfig.pagination.totalItems = this.totalCount$ as any;
      }
    });

    // Calculate unreconciled count
    this.transactions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(transactions => {
      this.unreconciledCount = transactions.filter(t => !t.reconciledAt && this.getStatusValue(t.status) === 'completed').length;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load transactions with current filters
   */
  private loadTransactions(): void {
    this.store.dispatch(TransactionsActions.loadTransactions({ reinitialize: true }));
  }

  /**
   * Build table configuration
   */
  private buildTableConfig(): TableConfig<GimacTransaction> {
    return {
      columns: this.getColumns(),
      actions: this.getActions(),
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
   * Define table columns based on Figma design
   */
  private getColumns(): TableColumn<GimacTransaction>[] {
    return [
      {
        key: 'username',
        label: 'Username',
        type: 'template',
        sortable: false,
        width: '180px'
      },
      {
        key: 'transactionType',
        label: 'Transaction Type',
        type: 'template',
        width: '140px'
      },
      {
        key: 'paymentMode',
        label: 'Payment Mode',
        type: 'template',
        width: '120px'
      },
      {
        key: 'country',
        label: 'Country',
        type: 'template',
        width: '120px'
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'template',
        align: 'right',
        width: '100px'
      },
      {
        key: 'services',
        label: 'Services',
        type: 'template',
        width: '100px'
      },
      {
        key: 'status',
        label: 'Payment Status',
        type: 'badge',
        width: '140px',
        badgeConfig: {
          colorMap: {
            'completed': 'success',
            'pending': 'warning',
            'failed': 'danger',
            'initiated': 'info',
            'cancelled': 'default'
          },
          transform: (value: any) => {
            if (value && typeof value === 'object') {
              return value.label || value.value;
            }
            return value;
          }
        }
      },
      {
        key: 'approvedBy',
        label: 'Approved by',
        type: 'template',
        width: '120px'
      },
      {
        key: 'updatedBy',
        label: 'Updated by',
        type: 'template',
        width: '120px'
      },
      {
        key: 'providers',
        label: 'Providers',
        type: 'template',
        width: '140px'
      },
      {
        key: 'currency',
        label: 'Currency',
        type: 'template',
        width: '100px'
      },
      {
        key: 'createdAt',
        label: 'Creation Date',
        type: 'template',
        sortable: true,
        width: '140px'
      }
    ];
  }

  /**
   * Define table row actions
   */
  private getActions(): TableAction<GimacTransaction>[] {
    return [
      {
        key: 'view',
        icon: 'visibility',
        tooltip: 'View Details',
        color: 'primary',
        type: 'icon',
        handler: (row) => this.viewTransaction(row)
      },
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'Edit Transaction',
        type: 'icon',
        handler: (row) => this.editTransaction(row),
        hidden: (row) => this.getStatusValue(row.status) === 'completed' || this.getStatusValue(row.status) === 'cancelled'
      },
      {
        key: 'reconcile',
        icon: 'account_balance',
        tooltip: 'Reconcile',
        type: 'icon',
        handler: (row) => this.reconcileTransaction(row),
        hidden: (row) => !!row.reconciledAt || this.getStatusValue(row.status) !== 'completed'
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'Delete Transaction',
        color: 'warn',
        type: 'icon',
        handler: (row) => this.deleteTransaction(row),
        hidden: (row) => this.getStatusValue(row.status) === 'completed'
      }
    ];
  }

  /**
   * Get status value from status object
   */
  public getStatusValue(status: any): string {
    if (typeof status === 'object' && status !== null) {
      return status.value || status.label || '';
    }
    return status || '';
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: string): void {
    this.activeStatusFilter = status;
    
    const filters: GimacTransactionFilterParams = {
      status: status === 'all' ? undefined : status,
      pageNumber: 1,
      limit: this.tableConfig.pagination?.pageSize || 20
    };

    this.store.dispatch(TransactionsActions.applyFilters({ filters }));
  }

  /**
   * Handle search
   */
  onSearch(searchTerm: string): void {
    const filters: GimacTransactionFilterParams = {
      keyword: searchTerm || undefined,
      status: this.activeStatusFilter === 'all' ? undefined : this.activeStatusFilter,
      pageNumber: 1,
      limit: this.tableConfig.pagination?.pageSize || 20
    };

    this.store.dispatch(TransactionsActions.applyFilters({ filters }));
  }

  /**
   * Handle page change
   */
  onPageChange(event: TablePageEvent): void {
    this.store.dispatch(TransactionsActions.changePage({ 
      pageNumber: event.pageIndex + 1
    }));
  }

  /**
   * Handle sort change
   */
  onSortChange(event: TableSortEvent): void {
    console.log('Sort changed:', event);
    // Implement sorting if backend supports it
  }

  /**
   * View transaction details
   */
  viewTransaction(transaction: GimacTransaction): void {
    this.router.navigate(['/transactions', transaction.id]);
  }

  /**
   * Edit transaction
   */
  editTransaction(transaction: GimacTransaction): void {
    this.router.navigate(['/transactions', transaction.id, 'edit']);
  }

  /**
   * Reconcile single transaction
   */
  reconcileTransaction(transaction: GimacTransaction): void {
    console.log('Reconcile transaction:', transaction);
    // Implement reconciliation logic
  }

  /**
   * Delete transaction
   */
  deleteTransaction(transaction: GimacTransaction): void {
    console.log('Delete transaction:', transaction);
    // Implement delete with confirmation dialog
  }

  /**
   * Export transactions
   */
  exportTransactions(): void {
    console.log('Export transactions');
    // Implement export logic (CSV, Excel, PDF)
  }

  /**
   * Open filters panel
   */
  openFilters(): void {
    console.log('Open advanced filters');
    // Implement advanced filters dialog
  }

  /**
   * Open fields selector
   */
  openFieldsSelector(): void {
    console.log('Open fields selector');
    // Implement column visibility toggle
  }

  /**
   * Navigate to add transaction
   */
  addTransaction(): void {
    this.router.navigate(['/transactions/create']);
  }

  /**
   * Bulk reconciliation
   */
  bulkReconcile(): void {
    console.log('Bulk reconcile unreconciled transactions');
    this.router.navigate(['/reconciliation']);
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: any): string {
    const statusValue = this.getStatusValue(status);
    const classMap: Record<string, string> = {
      'completed': 'status-confirmed',
      'pending': 'status-pending',
      'failed': 'status-failed',
      'initiated': 'status-initiated'
    };
    return classMap[statusValue] || 'status-default';
  }

  /**
 * Get initials from sender name
 */
getInitials(row: GimacTransaction): string {
  const name = row.senderAccountInfo?.['name'] || row.senderAccountIdentifier || 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get sender name
 */
getSenderName(row: GimacTransaction): string {
  return row.senderAccountInfo?.['name'] || 'Unknown User';
}

/**
 * Get transaction type
 */
getTransactionType(row: GimacTransaction): string {
  return row.gimacServiceCode?.['name'] || 'Transfer';
}

/**
 * Get payment mode
 */
getPaymentMode(row: GimacTransaction): string {
  return row.senderAccountInfo?.['type'] || 'Bank';
}

/**
 * Get payment mode icon
 */
getPaymentModeIcon(row: GimacTransaction): string {
  const type = row.senderAccountInfo?.['type']?.toLowerCase();
  const iconMap: Record<string, string> = {
    'bank': 'account_balance',
    'mobile': 'smartphone',
    'card': 'credit_card',
    'wallet': 'account_balance_wallet'
  };
  return iconMap[type || 'bank'] || 'account_balance';
}

/**
 * Get country name
 */
getCountryName(row: GimacTransaction): string {
  return row.senderAccountInfo?.['country'] || 'N/A';
}

/**
 * Get country flag emoji
 */
getCountryFlag(row: GimacTransaction): string {
  const country = row.senderAccountInfo?.['country'];
  const flagMap: Record<string, string> = {
    'CM': '🇨🇲', // Cameroon
    'USA': '🇺🇸',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'NG': '🇳🇬', // Nigeria
    'GH': '🇬🇭', // Ghana
    'KE': '🇰🇪', // Kenya
    'SN': '🇸🇳', // Senegal
  };
  return flagMap[country || ''] || '🌍';
}

/**
 * Get formatted amount
 */
getAmount(row: GimacTransaction): string {
  const amount = row.baseAmount?.['amount'] || row.rawAmount?.['amount'] || '0.00';
  return amount.toString();
}

/**
 * Get service name
 */
getServiceName(row: GimacTransaction): string {
  return row.gimacServiceCode?.['name'] || 'Payment';
}

/**
 * Get approved by
 */
getApprovedBy(row: GimacTransaction): string {
  // This would come from actual approval data
  return 'Simon Beta';
}

/**
 * Get updated by
 */
getUpdatedBy(row: GimacTransaction): string {
  // This would come from actual update data
  return 'Edouard Franck';
}

/**
 * Get provider name
 */
getProviderName(row: GimacTransaction): string {
  return 'Shell';
}

/**
 * Get provider icon
 */
getProviderIcon(row: GimacTransaction): string {
  return 'business';
}

/**
 * Get provider tooltip
 */
getProviderTooltip(row: GimacTransaction): string {
  return `Sender: Provider ${row.senderServiceProviderId}\nReceiver: Provider ${row.receiverServiceProviderId}`;
}

/**
 * Get currency
 */
getCurrency(row: GimacTransaction): string {
  return row.baseAmount?.['currency'] || row.rawAmount?.['currency'] || 'USD';
}

/**
 * Format date (e.g., "Mar 12, 2022")
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
 * Format time (e.g., "7:01 am")
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
}
