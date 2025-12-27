// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-bonds-modal.html',
  styleUrl: './confirm-bonds-modal.scss'
})
export class ConfirmBondsModal {
  private dialogRef = inject(MatDialogRef<ConfirmBondsModal>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {
    // Set defaults
    this.data.confirmText = data.confirmText || 'Confirm';
    this.data.cancelText = data.cancelText || 'Cancel';
    this.data.type = data.type || 'info';
  }

  /**
   * Get icon based on dialog type
   */
  get icon(): string {
    const iconMap: Record<string, string> = {
      info: 'info',
      warning: 'warning',
      danger: 'error',
      success: 'check_circle'
    };
    return iconMap[this.data.type || 'info'] || 'info';
  }

  /**
   * Get icon class based on dialog type
   */
  get iconClass(): string {
    return `icon-${this.data.type}`;
  }

  /**
   * Confirm action
   */
  confirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Cancel action
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}