import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AuthActions } from '@store/auth/auth.actions';
import {
  selectQrCodeUri,
  selectSetupKey,
  selectLoading,
  selectError
} from '@store/auth/auth.state';

/**
 * MFA Setup Component
 *
 * Handles Multi-Factor Authentication setup for users who need to configure MFA
 * for the first time (shouldCompleteMfa: false)
 *
 * Flow:
 * 1. Display QR code for user to scan with authenticator app
 * 2. Show manual setup key as alternative
 * 3. User enters 6-digit code from authenticator
 * 4. Validate and verify code to complete login
 */
@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './mfa-setup.component.html',
  styleUrl: './mfa-setup.component.scss'
})
export class MfaSetupComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  // Form for MFA code entry
  setupForm!: FormGroup;

  // State selectors
  qrCodeUri$ = this.store.select(selectQrCodeUri);
  setupKey$ = this.store.select(selectSetupKey);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  // UI state
  showManualKey = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the MFA code entry form
   */
  private initializeForm(): void {
    this.setupForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/), // Exactly 6 digits
          Validators.minLength(6),
          Validators.maxLength(6)
        ]
      ]
    });
  }

  /**
   * Toggle display of manual setup key
   */
  toggleManualKey(): void {
    this.showManualKey = !this.showManualKey;
  }

  /**
   * Handle form submission
   * Dispatches action to validate authenticator code
   */
  onSubmit(): void {
    if (this.setupForm.valid) {
      const code = this.setupForm.value.code;
      this.store.dispatch(AuthActions.validateMfaAuthenticatorStart({ code }));
    }
  }

  /**
   * Get form control for template access
   */
  get codeControl() {
    return this.setupForm.get('code');
  }

  /**
   * Check if code field has error
   */
  get hasCodeError(): boolean {
    const control = this.codeControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Get error message for code field
   */
  getCodeErrorMessage(): string {
    const control = this.codeControl;
    if (control?.hasError('required')) {
      return 'Verification code is required';
    }
    if (control?.hasError('pattern') || control?.hasError('minlength') || control?.hasError('maxlength')) {
      return 'Code must be exactly 6 digits';
    }
    return '';
  }

  /**
   * Copy setup key to clipboard
   */
  copySetupKey(key: string | null): void {
    if (key) {
      navigator.clipboard.writeText(key).then(() => {
        // Success notification handled by effect
      }).catch(err => {
        console.error('Failed to copy setup key:', err);
      });
    }
  }
}
