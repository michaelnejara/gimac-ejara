// src/app/shared/components/modals/change-transaction-status-modal/change-transaction-status-modal.component.ts
import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { BondTransaction, TransactionStatus } from '@core/models/bond-transaction.models';
import { BondTransactionsService } from '@core/services/bond-transactions/bond-transactions.service';
import { BondTransactionsActions } from '@store/bond-transactions/bond-transactions.actions';
import { NotificationService } from '@core/services/notification/notification.service';

export interface ChangeTransactionStatusData {
  transaction: BondTransaction;
  availableStatuses: TransactionStatus[];
}

@Component({
  selector: 'app-change-transaction-status-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './change-transaction-status-modal.html',
  styleUrl: './change-transaction-status-modal.scss'
})
export class ChangeTransactionStatusModal {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ChangeTransactionStatusModal>);
  private store = inject(Store);
  private transactionService = inject(BondTransactionsService);
  private notificationService = inject(NotificationService);

  statusForm!: FormGroup;
  transaction: BondTransaction;
  availableStatuses: TransactionStatus[];

  // UI State
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Transaction initiated', icon: '⏱️', color: '#ff9800' },
    { value: 'processing', label: 'Processing', description: 'Transaction in progress', icon: '🔄', color: '#2196f3' },
    { value: 'completed', label: 'Completed', description: 'Transaction successful', icon: '✅', color: '#4caf50' },
    { value: 'confirmed', label: 'Confirmed', description: 'Transaction confirmed', icon: '✓', color: '#4caf50' },
    { value: 'failed', label: 'Failed', description: 'Transaction failed', icon: '❌', color: '#f44336' },
    { value: 'cancelled', label: 'Cancelled', description: 'Transaction cancelled', icon: '🚫', color: '#9e9e9e' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ChangeTransactionStatusData) {
    this.transaction = data.transaction;
    this.availableStatuses = data.availableStatuses;

    this.initializeForm();
  }

  private initializeForm(): void {
    // Use status if available (backward compatibility), otherwise use blockchainStatus
    const currentStatus = this.transaction.status ||
                         (this.transaction.blockchainStatus === 'confirmed' ? 'confirmed' :
                          this.transaction.blockchainStatus === 'failed' ? 'failed' : 'pending');

    this.statusForm = this.fb.group({
      status: [currentStatus, Validators.required],
      reason: ['', Validators.required]
    });
  }

  get currentStatus(): TransactionStatus {
    return this.transaction.status ||
           (this.transaction.blockchainStatus === 'confirmed' ? 'confirmed' :
            this.transaction.blockchainStatus === 'failed' ? 'failed' : 'pending') as TransactionStatus;
  }

  get transactionReference(): string {
    return this.transaction.transactionReference || 'N/A';
  }

  get availableStatusOptions() {
    return this.statusOptions.filter(opt =>
      this.availableStatuses.includes(opt.value as TransactionStatus)
    );
  }

  getStatusOption(status: string) {
    return this.statusOptions.find(opt => opt.value === status);
  }

  getStatusIcon(status: string): string {
    return this.getStatusOption(status)?.icon || '•';
  }

  onCancel(): void {
    if (!this.isSubmitting) {
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.statusForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const { status, reason } = this.statusForm.value;

      this.transactionService.changeTransactionStatus(
        this.transaction.id,
        status,
        reason
      ).subscribe({
        next: (updatedTransaction) => {
          this.isSubmitting = false;
          this.successMessage = 'Status updated successfully!';

          // Show success notification
          this.notificationService.showSuccess('Transaction status updated successfully');

          // Update store with the new transaction
          this.store.dispatch(BondTransactionsActions.changeTransactionStatusSuccess({
            transaction: updatedTransaction
          }));

          // Reload transactions list
          this.store.dispatch(BondTransactionsActions.loadTransactions({ filters: {} }));

          // Close modal after a short delay to show success message
          setTimeout(() => {
            this.dialogRef.close({ success: true, transaction: updatedTransaction });
          }, 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMsg = error?.error?.message || error?.message || 'Failed to update transaction status';
          this.errorMessage = errorMsg;

          // Show error notification but keep modal open
          this.notificationService.showError(errorMsg);

          // Do NOT register error in store - just show notification
        }
      });
    }
  }
}
