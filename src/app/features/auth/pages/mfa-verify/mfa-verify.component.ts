import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification/notification.service';
import { Store } from '@ngrx/store';
import { AuthActions } from '@store/auth/auth.actions';
import { selectError, selectLoading, selectLoginReference } from '@store/auth/auth.state';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mfa-verify',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    // MatFormFieldModule,
    // MatInputModule,
    // MatButtonModule,
    // MatIconModule,
    // MatProgressSpinnerModule
  ],
  templateUrl: './mfa-verify.component.html',
  styleUrl: './mfa-verify.component.scss'
})
export class MfaVerifyComponent implements OnInit, OnDestroy {
  // Dependency injection using inject()
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Signals for reactive state management
  otpCode = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  loginReference = signal<string>('');

  // Computed signals
  isOtpComplete = computed(() => this.otpCode().length === 6);
  canSubmit = computed(() => this.isOtpComplete() && !this.isLoading());

  // Form
  mfaForm!: FormGroup;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor() {
    // Effect to watch for store loading state
    effect(() => {
      this.isLoading();
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToStoreState();
    this.checkLoginReference();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the reactive form
   */
  private initializeForm(): void {
    this.mfaForm = this.fb.group({
      otpCode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/) // Exactly 6 digits
        ]
      ]
    });
  }

  /**
   * Subscribe to NgRx store state
   */
  private subscribeToStoreState(): void {
    // Subscribe to loading state
    this.store.select(selectLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading.set(loading);
      });

    // Subscribe to error state
    this.store.select(selectError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.handleVerificationError(error?.message);
        }
      });

    // Subscribe to login reference
    this.store.select(selectLoginReference)
      .pipe(takeUntil(this.destroy$))
      .subscribe(ref => {
        if (ref) {
          this.loginReference.set(ref);
        }
      });
  }

  /**
   * Check if login reference exists, redirect to login if not
   */
  private checkLoginReference(): void {
    const reference = this.loginReference();
    if (!reference) {
      this.notificationService.showWarning(
        'Session Required',
        'Please login first to verify MFA.'
      );
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Handle OTP input changes
   */
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Only allow numeric characters
    value = value.replace(/\D/g, '');

    // Limit to 6 digits
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    // Update signal and form
    this.otpCode.set(value);
    this.mfaForm.patchValue({ otpCode: value });
    input.value = value;

    // Clear any error message when user types
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }

    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      this.verifyOtp();
    }
  }

  /**
   * Handle paste events
   */
  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Extract only digits
    const digits = pastedText.replace(/\D/g, '');
    
    if (digits.length === 0) {
      this.notificationService.showError(
        'Invalid Code',
        'Please paste a valid numeric code.'
      );
      return;
    }

    // Take first 6 digits
    const code = digits.slice(0, 6);
    
    // Update signal and form
    this.otpCode.set(code);
    this.mfaForm.patchValue({ otpCode: code });
    
    // Update input value
    const input = event.target as HTMLInputElement;
    input.value = code;

    // Auto-verify if 6 digits
    if (code.length === 6) {
      this.verifyOtp();
    }
  }

  /**
   * Handle keydown events (for backspace, delete, etc.)
   */
  onOtpKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].includes(event.keyCode)) {
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((event.ctrlKey || event.metaKey) && [65, 67, 86, 88].includes(event.keyCode)) {
      return;
    }
    
    // Allow: home, end, left, right
    if (event.keyCode >= 35 && event.keyCode <= 39) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress if not
    if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  /**
   * Verify the OTP code
   */
  verifyOtp(): void {
    const code = this.otpCode();
    const reference = this.loginReference();

    // Validate code length
    if (code.length !== 6) {
      return;
    }

    // Validate code format (digits only)
    if (!/^\d{6}$/.test(code)) {
      this.errorMessage.set('Please enter a valid 6-digit code');
      return;
    }

    // Check if loading
    if (this.isLoading()) {
      return;
    }

    // Check login reference
    if (!reference) {
      this.notificationService.showError(
        'Session Error',
        'Login session not found. Please login again.'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    // Dispatch verify MFA action
    this.store.dispatch(
      AuthActions.completeLoginStart({
          otpCode: code
      })
    );
  }

  /**
   * Handle verification errors
   */
  private handleVerificationError(error: string): void {
    this.errorMessage.set(error || 'Invalid verification code. Please try again.');
    
    // Clear the OTP input
    this.otpCode.set('');
    this.mfaForm.patchValue({ otpCode: '' });
    
    // Show notification
    this.notificationService.showError(
      'Verification Failed',
      this.errorMessage()
    );
  }

  /**
   * Navigate back to login page
   */
  goBackToLogin(): void {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/auth/login']);
  }

  /**
   * Utility method to check form errors
   */
  hasError(field: string, error: string): boolean {
    const control = this.mfaForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }
}
