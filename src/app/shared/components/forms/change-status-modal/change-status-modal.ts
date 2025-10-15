// src/app/features/partners/components/change-status-modal/change-status-modal.component.ts
import { Component, inject, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Store
import { PartnersActions } from '@store/partners/partners.actions';

// Models
import { PartnerStatus, UpdatePartnerStatusRequest } from '@core/models/partner.models';

export interface ChangeStatusData {
  partnerId: number;
  partnerName: string;
  currentStatus: PartnerStatus;
}

@Component({
  selector: 'app-change-status-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './change-status-modal.html',
  styleUrl: './change-status-modal.scss'
})
export class ChangeStatusModal implements OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ChangeStatusModal>);
  private destroy$ = new Subject<void>();

  statusForm: FormGroup;
  submitting = false;

  statusOptions: { value: PartnerStatus; label: string; description: string }[] = [
    {
      value: 'active',
      label: 'Active',
      description: 'Partner can access all services and APIs'
    },
    {
      value: 'suspended',
      label: 'Suspended',
      description: 'Temporarily blocked from accessing services'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      description: 'Permanently disabled, cannot access services'
    }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ChangeStatusData) {
    // Initialize form with status and reason
    this.statusForm = this.fb.group({
      status: [data.currentStatus, [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
   * Check if status has changed
   */
  get hasChanged(): boolean {
    return this.statusForm.get('status')?.value !== this.data.currentStatus;
  }

  /**
   * Get current status value
   */
  get currentStatusValue(): PartnerStatus {
    return this.statusForm.get('status')?.value;
  }

  /**
   * Get reason error message
   */
  get reasonErrorMessage(): string {
    const reasonControl = this.statusForm.get('reason');
    
    if (reasonControl?.hasError('required')) {
      return 'Reason is required';
    }
    if (reasonControl?.hasError('minlength')) {
      return 'Reason must be at least 10 characters';
    }
    if (reasonControl?.hasError('maxlength')) {
      return 'Reason must not exceed 500 characters';
    }
    return '';
  }

  /**
   * Apply status change
   */
  applyChange(): void {
    if (this.statusForm.invalid || this.submitting || !this.hasChanged) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.statusForm.controls).forEach(key => {
        this.statusForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.statusForm.value;
    this.submitting = true;

    // Create the status update request with reason
    const statusRequest: UpdatePartnerStatusRequest = {
      status: formValue.status,
      reason: formValue.reason
    };

    // Dispatch the correct action: updatePartnerStatus
    this.store.dispatch(PartnersActions.updatePartnerStatus({
      partnerId: this.data.partnerId,
      status: statusRequest
    }));

    // Close modal after a delay
    // In production, you should listen to the success/failure actions
    setTimeout(() => {
      this.submitting = false;
      this.dialogRef.close({ statusChanged: true, newStatus: formValue.status });
    }, 1000);
  }

  /**
   * Cancel and close modal
   */
  cancel(): void {
    this.dialogRef.close({ statusChanged: false });
  }
}