import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

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

  ngOnInit(): void {
    this.initializeForms();
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
   * Initialize all forms
   */
  private initializeForms(): void {
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
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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
          this.resetReference = response.resetReference;
          this.mfaReference = response.reference;
          this.initiatingReset = false;
          this.notificationService.success('Verification code sent successfully!');
          this.stepper.next();
          this.startResendTimer(response.expiresAt);
        },
        error: (error) => {
          this.initiatingReset = false;
          const errorMessage = error?.error?.message || 'Failed to initiate password reset';
          this.notificationService.error(errorMessage);
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
      this.notificationService.error('Invalid session. Please start over.');
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
          this.notificationService.success('Code verified successfully!');
          this.stepper.next();
        },
        error: (error) => {
          this.validatingOtp = false;
          const errorMessage = error?.error?.message || 'Invalid verification code';
          this.notificationService.error(errorMessage);
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
      this.notificationService.error('Invalid session. Please start over.');
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
          this.completingReset = false;
          this.notificationService.success('Password reset successful! Redirecting to login...');

          // Clear sensitive data before redirecting
          this.passwordForm.get('newPassword')?.setValue('');
          this.passwordForm.get('confirmPassword')?.setValue('');

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.completingReset = false;
          const errorMessage = error?.error?.message || 'Failed to reset password';
          this.notificationService.error(errorMessage);
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
    this.stepper.reset();
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
}
