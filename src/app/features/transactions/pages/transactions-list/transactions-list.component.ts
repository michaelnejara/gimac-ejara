// src/app/features/transactions/pages/transactions-list/transactions-list.component.ts
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
import { MatDialogModule } from '@angular/material/dialog';
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

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

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
    MatDividerModule,
    DataTable,
    TableColumnDirective,
    TableActionsDirective
  ],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss'
})
export class TransactionsListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  transactions$: Observable<GimacTransaction[]>;
  loading$: Observable<boolean>;
  totalCount$: Observable<number>;
  pagination$: Observable<any>;
  currentFilters$: Observable<GimacTransactionFilterParams>;

  searchControl = new FormControl('');

  activeStatusFilter: string = 'all';
  statusFilters: FilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'completed', label: 'Confirmed' },
    { value: 'failed', label: 'Failed' },
    { value: 'initiated', label: 'Initiated' }
  ];

  tableConfig!: TableConfig<GimacTransaction>;
  unreconciledCount = 0;

  constructor() {
    this.transactions$ = this.store.select(selectCurrentPageTransactions);
    this.loading$ = this.store.select(selectTransactionsLoading);
    this.totalCount$ = this.store.select(selectTransactionsTotalCount);
    this.pagination$ = this.store.select(selectTransactionsPagination);
    this.currentFilters$ = this.store.select(selectCurrentFilters);

    this.tableConfig = this.buildTableConfig();
  }

  ngOnInit(): void {
    this.loadTransactions();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.onSearch(searchTerm || '');
    });

    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination && this.tableConfig.pagination) {
        this.tableConfig = {
          ...this.tableConfig,
          pagination: {
            ...this.tableConfig.pagination,
            pageIndex: pagination.currentPageNumber - 1,
            totalItems: pagination.totalPages * (this.tableConfig.pagination.pageSize || 20)
          }
        };
      }
    });

    this.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.tableConfig = {
        ...this.tableConfig,
        loading
      };
    });

    this.transactions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(transactions => {
      this.unreconciledCount = transactions.filter(t =>
        !t.reconciledAt && this.getStatusValue(t.status) === 'completed'
      ).length;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTransactions(): void {
    this.store.dispatch(TransactionsActions.loadTransactions({ reinitialize: true }));
  }

  private buildTableConfig(): TableConfig<GimacTransaction> {
    return {
      columns: this.getColumns(),
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

  private getColumns(): TableColumn<GimacTransaction>[] {
    return [
      {
        key: 'username',
        label: 'Username',
        type: 'template',
        sortable: false,
        width: '200px'
      },
      {
        key: 'transactionType',
        label: 'Transaction Type',
        type: 'template',
        width: '150px'
      },
      {
        key: 'paymentMode',
        label: 'Payment Mode',
        type: 'template',
        width: '140px'
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
        width: '120px'
      },
      {
        key: 'services',
        label: 'Services',
        type: 'template',
        width: '120px'
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
        width: '150px'
      }
    ];
  }

  // Event Handlers
  onStatusFilterChange(status: string): void {
    this.activeStatusFilter = status;

    const filters: GimacTransactionFilterParams = {
      status: status === 'all' ? undefined : status,
      pageNumber: 1,
      limit: this.tableConfig.pagination?.pageSize || 20
    };

    this.store.dispatch(TransactionsActions.applyFilters({ filters }));
  }

  onSearch(searchTerm: string): void {
    const filters: GimacTransactionFilterParams = {
      keyword: searchTerm || undefined,
      status: this.activeStatusFilter === 'all' ? undefined : this.activeStatusFilter,
      pageNumber: 1,
      limit: this.tableConfig.pagination?.pageSize || 20
    };

    this.store.dispatch(TransactionsActions.applyFilters({ filters }));
  }

  onPageChange(event: TablePageEvent): void {
    const currentPageSize = this.tableConfig.pagination?.pageSize || 20;

    // Check if page size changed
    if (event.pageSize !== currentPageSize) {
      // Dispatch page size change action
      this.onPageSizeChange(event.pageSize)
      // this.store.dispatch(TransactionsActions.changePageSize({ 
      //   pageSize: event.pageSize 
      // }));
    } else {
      // Just a page number change
      this.store.dispatch(TransactionsActions.changePage({
        pageNumber: event.pageIndex + 1
      }));
    }
  }

  /**
 * Handle page size change
 */
  onPageSizeChange(pageSize: number): void {
    this.store.dispatch(TransactionsActions.changePageSize({ pageSize }));
  }

  onSortChange(event: TableSortEvent): void {
    console.log('Sort changed:', event);
  }

  viewTransaction(transaction: GimacTransaction): void {
    this.router.navigate(['/transactions/details', transaction.id]);
  }

  editTransaction(transaction: GimacTransaction): void {
    this.router.navigate(['/transactions/details', transaction.id, 'edit']);
  }

  reconcileTransaction(transaction: GimacTransaction): void {
    console.log('Reconcile transaction:', transaction);
  }

  deleteTransaction(transaction: GimacTransaction): void {
    console.log('Delete transaction:', transaction);
  }

  exportTransactions(): void {
    console.log('Export transactions');
  }

  /**
 * Duplicate transaction
 */
duplicateTransaction(transaction: GimacTransaction): void {
  console.log('Duplicate transaction:', transaction);
  // Navigate to create page with pre-filled data
  this.router.navigate(['/transactions/create'], {
    queryParams: { duplicate: transaction.id }
  });
}

/**
 * Export single transaction
 */
exportTransaction(transaction: GimacTransaction): void {
  console.log('Export transaction:', transaction);
  // TODO: Implement export logic (download as PDF, CSV, etc.)
}

/**
 * Copy transaction reference
 */
  copyReference(transaction: GimacTransaction): void {
    const reference = transaction.internalReference || transaction.externalReference;
    if (reference) {
      navigator.clipboard.writeText(reference).then(() => {
        console.log('Reference copied to clipboard:', reference);
        // You might want to show a toast notification here
      }).catch(err => {
        console.error('Failed to copy reference:', err);
      });
    }
  }

  openFilters(): void {
    console.log('Open advanced filters');
  }

  openFieldsSelector(): void {
    console.log('Open fields selector');
  }

  addTransaction(): void {
    this.router.navigate(['/transactions/create']);
  }

  bulkReconcile(): void {
    this.router.navigate(['/reconciliation']);
  }

  // Helper Methods (all public for template access)
  getStatusValue(status: any): string {
    if (typeof status === 'object' && status !== null) {
      return status.value || status.label || '';
    }
    return status || '';
  }

  getInitials(row: GimacTransaction): string {
    const name = row.senderAccountInfo?.['name'] || row.senderAccountIdentifier || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getSenderName(row: GimacTransaction): string {
    return row.senderAccountInfo?.['name'] || 'Unknown User';
  }

  getTransactionType(row: GimacTransaction): string {
    return row.gimacServiceCode?.['name'] || 'Transfer';
  }

  getPaymentMode(row: GimacTransaction): string {
    const type = row.senderAccountInfo?.['type'];
    const modeMap: Record<string, string> = {
      'mobile': 'Mobile',
      'bank': 'Bank',
      'card': 'Card',
      'wallet': 'Wallet'
    };
    return modeMap[type || 'bank'] || 'Bank';
  }

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

  getCountryName(row: GimacTransaction): string {
    return row.senderAccountInfo?.['country'] || 'N/A';
  }

  getCountryFlag(row: GimacTransaction): string {
    const country = row.senderAccountInfo?.['country'];
    const flagMap: Record<string, string> = {
      'CM': '🇨🇲',
      'USA': '🇺🇸',
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'FR': '🇫🇷',
      'DE': '🇩🇪',
      'NG': '🇳🇬',
      'GH': '🇬🇭',
      'KE': '🇰🇪',
      'SN': '🇸🇳',
    };
    return flagMap[country || ''] || '🌍';
  }

  getAmount(row: GimacTransaction): string {
    const amount = row.baseAmount?.['amount'] || row.rawAmount?.['amount'] || '0.00';
    return amount.toString();
  }

  getServiceName(row: GimacTransaction): string {
    return row.gimacServiceCode?.['name'] || 'Payment';
  }

  getCurrency(row: GimacTransaction): string {
    return row.baseAmount?.['currency'] || row.rawAmount?.['currency'] || 'USD';
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