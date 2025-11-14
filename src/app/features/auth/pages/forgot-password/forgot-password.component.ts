import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@core/services/api/auth.service';
import { NotificationService } from '@core/services/notification/notification.service';
import * as AuthModels from '@core/models/auth.models';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Current step tracking
  currentStep: 1 | 2 | 3 = 1;

  // Forms for each step
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;

  // Loading states
  initiatingReset = false;
  validatingOtp = false;
  completingReset = false;

  // Password visibility toggles
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Store references between steps
  private resetReference: string | null = null;
  private mfaReference: string | null = null;
  private deviceId: string = this.generateDeviceId();
  emailOrPhone: string = '';

  // OTP resend timer
  canResendOtp = false;
  resendTimer = 0;
  private resendInterval: any;

  /**
   * Get formatted countdown timer (MM:SS)
   */
  get formattedTimer(): string {
    const minutes = Math.floor(this.resendTimer / 60);
    const seconds = this.resendTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Password validation getters
   */
  get passwordHasMinLength(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  get passwordHasCapitalLetter(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  get passwordHasNumber(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  get passwordHasSpecialChar(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return /[@#*&]/.test(password);
  }

  get passwordsMatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value || '';
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value || '';
    return newPassword === confirmPassword && newPassword !== '';
  }

  constructor() {
    // Initialize forms in constructor to ensure they're available before template rendering
    this.emailForm = this.fb.group({
      emailOrPhoneNumber: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@#*&]).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Ensure forms are initialized (safety check)
    if (!this.emailForm || !this.otpForm || !this.passwordForm) {
      this.initializeForms();
    }
  }

  /**
   * Initialize all forms (safety method)
   */
  private initializeForms(): void {
    if (!this.emailForm) {
      this.emailForm = this.fb.group({
        emailOrPhoneNumber: ['', [Validators.required, Validators.email]]
      });
    }

    if (!this.otpForm) {
      this.otpForm = this.fb.group({
        digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
        digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
        digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
        digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
        digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
        digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      });
    }

    if (!this.passwordForm) {
      this.passwordForm = this.fb.group({
        newPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@#*&]).+$/)
        ]],
        confirmPassword: ['', [Validators.required]]
      }, { validators: this.passwordMatchValidator });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }

    // Clear sensitive data
    this.passwordForm?.get('newPassword')?.setValue('');
    this.passwordForm?.get('confirmPassword')?.setValue('');
  }


  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Step 1: Initiate password reset
   */
  onInitiateReset(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.initiatingReset = true;
    const emailOrPhoneNumber = this.emailForm.get('emailOrPhoneNumber')?.value;
    this.emailOrPhone = emailOrPhoneNumber;

    // Determine reset option based on input format
    const resetOption = emailOrPhoneNumber.includes('@') ? 'email' : 'phone';

    const payload: AuthModels.InitiatePasswordResetPayload = {
      deviceId: this.deviceId,
      emailOrPhoneNumber,
      resetOption
    };

    this.authService.initiatePasswordReset(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('response data: ', response)
          this.resetReference = response.data.resetReference;
          this.mfaReference = response.data.reference;
          this.initiatingReset = false;
          this.notificationService.showSuccess('Success', 'Verification code sent successfully!');
          this.currentStep = 2;
          this.startResendTimer(response.data.expiresAt);
        },
        error: (error) => {
          this.initiatingReset = false;
          const errorMessage = error?.error?.message || 'Failed to initiate password reset';
          this.notificationService.showError('Error', errorMessage);
        }
      });
  }

  /**
   * Step 2: Validate OTP code
   */
  onValidateOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    if (!this.mfaReference) {
      this.notificationService.showError('Error', 'Invalid session. Please start over.');
      return;
    }

    this.validatingOtp = true;
    const otpCode = this.getOtpCode();

    const payload: AuthModels.ValidatePasswordResetCodePayload = {
      mfaReference: this.mfaReference,
      otpCode
    };

    this.authService.validatePasswordResetCode(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.validatingOtp = false;
          this.notificationService.showSuccess('Success', 'Code verified successfully!');
          this.currentStep = 3;
        },
        error: (error) => {
          this.validatingOtp = false;
          const errorMessage = error?.error?.message || 'Invalid verification code';
          this.notificationService.showError('Error', errorMessage);
        }
      });
  }

  /**
   * Step 3: Complete password reset
   */
  onCompleteReset(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (!this.mfaReference || !this.resetReference) {
      this.notificationService.showError('Error', 'Invalid session. Please start over.');
      return;
    }

    this.completingReset = true;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    const payload: AuthModels.CompletePasswordResetPayload = {
      mfaReference: this.mfaReference,
      resetReference: this.resetReference,
      newPassword
    };

    this.authService.completePasswordReset(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Success', 'Password reset successful! Redirecting to login...');

          // Clear sensitive data before redirecting
          this.passwordForm.get('newPassword')?.setValue('');
          this.passwordForm.get('confirmPassword')?.setValue('');

          // Keep loading state active while redirecting
          setTimeout(() => {
            this.completingReset = false;
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.completingReset = false;
          const errorMessage = error?.error?.message || 'Failed to reset password';
          this.notificationService.showError('Error', errorMessage);
        }
      });
  }

  /**
   * Get OTP code from individual digit inputs
   */
  private getOtpCode(): string {
    return Object.values(this.otpForm.value).join('');
  }

  /**
   * Handle OTP input auto-focus
   */
  onOtpInput(event: any, nextInput: string | null): void {
    const input = event.target as HTMLInputElement;
    const maxLength = 1;

    if (input.value.length >= maxLength && nextInput) {
      const nextElement = document.getElementById(nextInput) as HTMLInputElement;
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  /**
   * Handle OTP input backspace
   */
  onOtpKeyDown(event: KeyboardEvent, currentInput: string, previousInput: string | null): void {
    if (event.key === 'Backspace') {
      const input = document.getElementById(currentInput) as HTMLInputElement;
      if (input && !input.value && previousInput) {
        const prevElement = document.getElementById(previousInput) as HTMLInputElement;
        if (prevElement) {
          prevElement.focus();
        }
      }
    }
  }

  /**
   * Handle OTP paste
   */
  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text');

    if (pasteData && /^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      this.otpForm.patchValue({
        digit1: digits[0],
        digit2: digits[1],
        digit3: digits[2],
        digit4: digits[3],
        digit5: digits[4],
        digit6: digits[5]
      });

      // Focus the last input
      const lastInput = document.getElementById('digit6') as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }
  }

  /**
   * Start resend timer
   */
  private startResendTimer(expiresAt: number): void {
    console.log('expiresat: ',expiresAt)
    this.resendTimer = expiresAt;
    this.canResendOtp = false;

    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResendOtp = true;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  /**
   * Resend OTP code
   */
  onResendOtp(): void {
    if (!this.canResendOtp) return;

    this.otpForm.reset();
    this.onInitiateReset();
  }

  /**
   * Reset and start over
   */
  onStartOver(): void {
    this.currentStep = 1;
    this.emailForm.reset();
    this.otpForm.reset();
    this.passwordForm.reset();
    this.resetReference = null;
    this.mfaReference = null;
    this.emailOrPhone = '';

    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }

  /**
   * Helper to check if control has error
   */
  hasError(formGroup: FormGroup, controlName: string, errorType: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.hasError(errorType) && control.touched);
  }
}
