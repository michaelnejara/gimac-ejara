// src/app/shared/components/modals/change-transaction-status-modal/change-transaction-status-modal.component.ts
import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { BondTransaction, TransactionStatus } from '@core/models/bond-transaction.models';

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
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './change-transaction-status-modal.html',
  styleUrl: './change-transaction-status-modal.scss'
})
export class ChangeTransactionStatusModal {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ChangeTransactionStatusModal>);

  statusForm!: FormGroup;
  transaction: BondTransaction;
  availableStatuses: TransactionStatus[];

  statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Transaction initiated', icon: 'schedule', color: '#ff9800' },
    { value: 'processing', label: 'Processing', description: 'Transaction in progress', icon: 'sync', color: '#2196f3' },
    { value: 'completed', label: 'Completed', description: 'Transaction successful', icon: 'check_circle', color: '#4caf50' },
    { value: 'confirmed', label: 'Confirmed', description: 'Transaction confirmed', icon: 'verified', color: '#4caf50' },
    { value: 'failed', label: 'Failed', description: 'Transaction failed', icon: 'error', color: '#f44336' },
    { value: 'cancelled', label: 'Cancelled', description: 'Transaction cancelled', icon: 'cancel', color: '#9e9e9e' }
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

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.statusForm.valid) {
      this.dialogRef.close(this.statusForm.value);
    }
  }
}