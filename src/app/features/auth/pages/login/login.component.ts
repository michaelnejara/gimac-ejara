import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { selectError, selectLoading } from '@store/auth/auth.state';
import { AuthActions } from '@store/auth/auth.actions';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Form
  loginForm!: FormGroup;
  submitted = false;
  hidePassword = true;

  // Observables from store
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear sensitive data
    this.loginForm.get('password')?.setValue('');
  }

  /**
   * Initialize login form with validators
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      usernameOrPhoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Subscribe to form value changes to clear errors
   */
  private subscribeToFormChanges(): void {
    this.loginForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.submitted) {
          this.store.dispatch(AuthActions.clearError());
        }
      });
  }

  /**
   * Determine login option based on input format
   */
  getLoginOption(input: string): 'username' | 'email' | 'phone' {
    if (input.includes('@')) {
      return 'email';
    }
    if (input.startsWith('+')) {
      return 'phone';
    }
    return 'username';
  }

  /**
   * Handle login form submission
   */
  onLogin(): void {
    this.submitted = true;

    // Validate form
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Get form values
    const { usernameOrPhoneNumber, password } = this.loginForm.value;
    const loginOption = this.getLoginOption(usernameOrPhoneNumber);

    // Dispatch login action
    this.store.dispatch(AuthActions.loginStart({
      usernameOrPhoneNumber,
      password,
      loginOption
    }));
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Navigate to forgot password page
   */
  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName === 'usernameOrPhoneNumber' ? 'Username' : 'Password'} is required`;
    }
    
    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    
    return '';
  }
}