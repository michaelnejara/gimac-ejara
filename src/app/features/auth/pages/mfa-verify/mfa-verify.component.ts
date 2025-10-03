import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
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

  // Reactive signals
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  otpCode = signal<string>('');
  canResend = signal<boolean>(false);
  countdown = signal<number>(30); // 30 seconds countdown
  loginReference = signal<string>('');

  // Computed signals
  isOtpComplete = computed(() =>
    this.otpCode().length === 6
  );

  canSubmit = computed(() =>
    this.isOtpComplete() && !this.isLoading()
  );

  // Form group
  mfaForm!: FormGroup;

  // Subject for cleanup
  private destroy$ = new Subject<void>();

  // Timer reference
  private countdownTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToStore();
    this.checkLoginReference();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  /**
   * Initialize the form with validators
   */
  private initializeForm(): void {
    this.mfaForm = this.fb.group({
      otpCode: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/),
        Validators.minLength(6),
        Validators.maxLength(6)
      ]]
    });
  }

  /**
   * Subscribe to store state changes
   */
  private subscribeToStore(): void {
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
          this.errorMessage.set(error.message || 'Verification failed. Please try again.');
          this.clearOtpInput();
        }
      });

    // Subscribe to login reference
    this.store.select(selectLoginReference)
      .pipe(takeUntil(this.destroy$))
      .subscribe(reference => {
        if (reference) {
          this.loginReference.set(reference);
        }
      });
  }

  /**
   * Check if login reference exists, redirect if not
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
   * Start countdown timer for resend
   */
  private startCountdown(): void {
    this.countdown.set(30);
    this.canResend.set(false);

    this.countdownTimer = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.canResend.set(true);
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
        }
      }
    }, 1000);
  }

  /**
   * Handle input in OTP field
   * @param event - Input event
   */
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Only allow digits
    value = value.replace(/\D/g, '');

    // Limit to 6 digits
    if (value.length > 6) {
      value = value.substring(0, 6);
    }

    // Update form and signal
    this.mfaForm.patchValue({ otpCode: value });
    this.otpCode.set(value);

    // Clear error on input
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }

    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      this.verifyOtp();
    }
  }

  /**
   * Handle paste event for 6-digit code
   * @param event - Clipboard event
   */
  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');

    if (pastedData) {
      // Extract only digits
      const digits = pastedData.replace(/\D/g, '');

      if (digits.length >= 6) {
        const otpValue = digits.substring(0, 6);
        this.mfaForm.patchValue({ otpCode: otpValue });
        this.otpCode.set(otpValue);

        // Auto-verify
        this.verifyOtp();
      } else if (digits.length > 0) {
        // Partial paste
        this.mfaForm.patchValue({ otpCode: digits });
        this.otpCode.set(digits);
      } else {
        this.notificationService.showError(
          'Invalid Code',
          'Please paste a valid numeric code.'
        );
      }
    }
  }

  /**
   * Handle keydown events
   * @param event - Keyboard event
   */
  onOtpKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true)) {
      return;
    }

    // Ensure that it is a number and stop the keypress if not
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
      (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  /**
   * Submit OTP for verification
   */
  verifyOtp(): void {
    if (!this.canSubmit()) {
      return;
    }

    const otpCode = this.otpCode();
    const loginReference = this.loginReference();

    if (!loginReference) {
      this.notificationService.showError(
        'Session Error',
        'Login session not found. Please login again.'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otpCode)) {
      this.errorMessage.set('Please enter a valid 6-digit code');
      return;
    }

    // Dispatch verification action
    this.store.dispatch(AuthActions.completeLoginStart({
      otpCode
    }));
  }

  /**
   * Resend OTP code (if needed)
   * Note: This would require a backend endpoint
   */
  resendCode(): void {
    if (!this.canResend()) {
      return;
    }

    // TODO: Implement resend logic if backend supports it
    this.notificationService.showInfo(
      'Code Sent',
      'A new verification code has been sent.'
    );

    this.startCountdown();
    this.clearOtpInput();
  }

  /**
   * Clear OTP input
   */
  private clearOtpInput(): void {
    this.otpCode.set('');
    this.mfaForm.patchValue({ otpCode: '' });

    // Focus input
    const input = document.querySelector('.otp-input') as HTMLInputElement;
    input?.focus();
  }

  /**
   * Go back to login
   */
  goBackToLogin(): void {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/auth/login']);
  }

  /**
   * Format countdown for display
   */
  get formattedCountdown(): string {
    const seconds = this.countdown();
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
