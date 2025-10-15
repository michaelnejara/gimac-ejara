import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Store
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectBondById,
  selectCreating,
  selectUpdating,
  selectError
} from '@store/bonds/bonds.state';

// Models
import { 
  Bond, 
  CreateBondRequest, 
  UpdateBondRequest,
  BondStatus,
  BondRiskLevel,
  CurrencyCode
} from '@core/models/bond.models';

@Component({
  selector: 'app-add-bond',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './add-bond.html',
  styleUrl: './add-bond.scss'
})
export class AddBond implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Mode
  isEditMode = false;
  bondId: number | null = null;
  currentBond: Bond | null = null;

  // Form
  bondForm!: FormGroup;

  // Observables
  creating$!: Observable<boolean>;
  updating$!: Observable<boolean>;
  error$!: Observable<string | null>;
  loading$!: Observable<boolean>;

  // Date constraints
  minIssueDate = new Date();
  minMaturityDate = new Date();
  minValueDate = new Date();

  // Dropdown Options
  statusOptions: { value: BondStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'matured', label: 'Matured' }
  ];

  riskLevelOptions: { value: BondRiskLevel; label: string }[] = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ];

  currencyOptions: { value: CurrencyCode; label: string }[] = [
    { value: 'XAF', label: 'XAF - Central African CFA Franc' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'NGN', label: 'NGN - Nigerian Naira' },
    { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
    { value: 'KES', label: 'KES - Kenyan Shilling' }
  ];

  ngOnInit(): void {
    this.initializeMode();
    this.initializeForm();
    this.initializeObservables();
    this.setupFormSubscriptions();
    this.loadBondIfEdit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize mode based on route
   */
  private initializeMode(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.bondId = +params['id'];
      } else {
        this.isEditMode = false;
        this.bondId = null;
      }
    });
  }

  /**
   * Initialize form with validators
   */
  private initializeForm(): void {
    this.bondForm = this.fb.group({
      // Basic Information
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(1000)]],

      // Financial Information
      principalAmount: ['', [Validators.required, Validators.min(0.01)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      couponRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      fiatCurrency: ['XAF', [Validators.required]],

      // Purchase Limits
      minPurchaseAmount: ['', [Validators.required, Validators.min(0.01)]],
      maxPurchaseAmount: ['', [Validators.min(0)]],

      // Dates
      issueDate: ['', [Validators.required]],
      maturityDate: ['', [Validators.required]],
      valueDate: ['', [Validators.required]],
      tenor: ['', [Validators.required, Validators.min(1), Validators.max(600)]],

      // Other Information
      issuer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      status: ['active', [Validators.required]],
      riskLevel: ['medium']
    });

    // In edit mode, disable the code field
    if (this.isEditMode) {
      this.bondForm.get('code')?.disable();
    }
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    this.creating$ = this.store.select(selectCreating);
    this.updating$ = this.store.select(selectUpdating);
    this.error$ = this.store.select(selectError);
  }

  /**
   * Setup form subscriptions for dynamic behavior
   */
  private setupFormSubscriptions(): void {
    // Update minimum maturity date when issue date changes
    this.bondForm.get('issueDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(issueDate => {
      if (issueDate) {
        const minMaturity = new Date(issueDate);
        minMaturity.setMonth(minMaturity.getMonth() + 1); // At least 1 month after issue
        this.minMaturityDate = minMaturity;

        // Validate current maturity date
        const currentMaturityDate = this.bondForm.get('maturityDate')?.value;
        if (currentMaturityDate && new Date(currentMaturityDate) <= new Date(issueDate)) {
          this.bondForm.get('maturityDate')?.setErrors({ maturityBeforeIssue: true });
        }
      }
    });

    // Calculate tenor when dates change
    this.bondForm.get('issueDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.calculateTenor());

    this.bondForm.get('maturityDate')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.calculateTenor());

    // Validate max purchase amount against min
    this.bondForm.get('minPurchaseAmount')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(minAmount => {
      const maxAmount = this.bondForm.get('maxPurchaseAmount')?.value;
      if (minAmount && maxAmount && parseFloat(maxAmount) < parseFloat(minAmount)) {
        this.bondForm.get('maxPurchaseAmount')?.setErrors({ lessThanMin: true });
      }
    });

    this.bondForm.get('maxPurchaseAmount')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(maxAmount => {
      const minAmount = this.bondForm.get('minPurchaseAmount')?.value;
      if (minAmount && maxAmount && parseFloat(maxAmount) < parseFloat(minAmount)) {
        this.bondForm.get('maxPurchaseAmount')?.setErrors({ lessThanMin: true });
      } else if (this.bondForm.get('maxPurchaseAmount')?.hasError('lessThanMin')) {
        this.bondForm.get('maxPurchaseAmount')?.setErrors(null);
      }
    });

    // Listen for store errors
    this.error$.pipe(
      filter(error => !!error),
      takeUntil(this.destroy$)
    ).subscribe(error => {
      this.snackBar.open(error!, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    });
  }

  /**
   * Calculate tenor in months based on issue and maturity dates
   */
  private calculateTenor(): void {
    const issueDate = this.bondForm.get('issueDate')?.value;
    const maturityDate = this.bondForm.get('maturityDate')?.value;

    if (issueDate && maturityDate) {
      const issue = new Date(issueDate);
      const maturity = new Date(maturityDate);

      if (maturity > issue) {
        const months = this.getMonthsDifference(issue, maturity);
        this.bondForm.patchValue({ tenor: months }, { emitEvent: false });
      }
    }
  }

  /**
   * Get months difference between two dates
   */
  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth());
    return Math.max(1, months);
  }

  /**
   * Load bond data if in edit mode
   */
  private loadBondIfEdit(): void {
    if (this.isEditMode && this.bondId) {
      // Dispatch load bond action
      this.store.dispatch(BondsActions.loadBond({ bondId: this.bondId }));

      // Subscribe to bond data
      this.store.select(selectBondById(this.bondId)).pipe(
        filter(bond => !!bond),
        take(1)
      ).subscribe(bond => {
        this.currentBond = bond!;
        this.populateForm(bond!);
      });
    }
  }

  /**
   * Populate form with existing bond data
   */
  private populateForm(bond: Bond): void {
    this.bondForm.patchValue({
      name: bond.name,
      code: bond.code,
      description: bond.description || '',
      principalAmount: bond.principalAmount,
      interestRate: bond.interestRate,
      couponRate: bond.couponRate,
      fiatCurrency: bond.fiatCurrency,
      minPurchaseAmount: bond.minPurchaseAmount,
      maxPurchaseAmount: bond.maxPurchaseAmount || '',
      issueDate: bond.issueDate,
      maturityDate: bond.maturityDate,
      valueDate: bond.valueDate,
      tenor: bond.tenor,
      issuer: bond.issuer,
      status: bond.status,
      riskLevel: bond.riskLevel || 'medium'
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.bondForm.invalid) {
      this.markFormGroupTouched(this.bondForm);
      this.snackBar.open('Please fix all validation errors', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.bondForm.getRawValue();

    if (this.isEditMode && this.bondId) {
      this.updateBond(formValue);
    } else {
      this.createBond(formValue);
    }
  }

  /**
   * Create new bond
   */
  private createBond(formValue: any): void {
    const bondData: CreateBondRequest = {
      name: formValue.name.trim(),
      code: formValue.code.trim().toUpperCase(),
      description: formValue.description?.trim(),
      principalAmount: parseFloat(formValue.principalAmount),
      interestRate: parseFloat(formValue.interestRate),
      couponRate: parseFloat(formValue.couponRate),
      fiatCurrency: formValue.fiatCurrency,
      minPurchaseAmount: parseFloat(formValue.minPurchaseAmount),
      maxPurchaseAmount: formValue.maxPurchaseAmount ? parseFloat(formValue.maxPurchaseAmount) : undefined,
      issueDate: this.formatDateForApi(formValue.issueDate),
      maturityDate: this.formatDateForApi(formValue.maturityDate),
      valueDate: this.formatDateForApi(formValue.valueDate),
      tenor: parseInt(formValue.tenor),
      issuer: formValue.issuer.trim(),
      status: formValue.status,
      riskLevel: formValue.riskLevel
    };

    this.store.dispatch(BondsActions.createBond({ bondData }));

    // Listen for success
    this.creating$.pipe(
      filter(creating => !creating),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.snackBar.open('Bond created successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
      // Navigate back to bonds list
      setTimeout(() => {
        this.router.navigate(['/bonds']);
      }, 500);
    });
  }

  /**
   * Update existing bond
   */
  private updateBond(formValue: any): void {
    const bondData: UpdateBondRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim(),
      principalAmount: parseFloat(formValue.principalAmount),
      interestRate: parseFloat(formValue.interestRate),
      couponRate: parseFloat(formValue.couponRate),
      fiatCurrency: formValue.fiatCurrency,
      minPurchaseAmount: parseFloat(formValue.minPurchaseAmount),
      maxPurchaseAmount: formValue.maxPurchaseAmount ? parseFloat(formValue.maxPurchaseAmount) : undefined,
      issueDate: this.formatDateForApi(formValue.issueDate),
      maturityDate: this.formatDateForApi(formValue.maturityDate),
      valueDate: this.formatDateForApi(formValue.valueDate),
      tenor: parseInt(formValue.tenor),
      issuer: formValue.issuer.trim(),
      status: formValue.status,
      riskLevel: formValue.riskLevel
    };

    this.store.dispatch(BondsActions.updateBond({ 
      bondId: this.bondId!,
      bondData 
    }));

    // Listen for success
    this.updating$.pipe(
      filter(updating => !updating),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.snackBar.open('Bond updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
      // Navigate back to bond details
      setTimeout(() => {
        this.router.navigate(['/bonds/details', this.bondId]);
      }, 500);
    });
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDateForApi(date: any): string {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    if (this.isEditMode && this.bondId) {
      this.router.navigate(['/bonds/details', this.bondId]);
    } else {
      this.router.navigate(['/bonds']);
    }
  }

  /**
   * Reset form
   */
  onReset(): void {
    if (this.isEditMode && this.currentBond) {
      this.populateForm(this.currentBond);
    } else {
      this.bondForm.reset({
        fiatCurrency: 'XAF',
        status: 'active',
        riskLevel: 'medium'
      });
    }
    
    this.snackBar.open('Form reset', 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.bondForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (control.hasError('min')) {
      const min = control.errors['min'].min;
      return `Minimum value is ${min}`;
    }
    if (control.hasError('max')) {
      const max = control.errors['max'].max;
      return `Maximum value is ${max}`;
    }
    if (control.hasError('maturityBeforeIssue')) {
      return 'Maturity date must be after issue date';
    }
    if (control.hasError('lessThanMin')) {
      return 'Maximum must be greater than minimum';
    }

    return 'Invalid value';
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const control = this.bondForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'XAF'): string {
    if (!amount) return `${currency} 0`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount).replace(currency, `${currency} `);
  }

  /**
   * Format tenor for display
   */
  formatTenor(months: number): string {
    if (!months) return '';
    
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    return `${years}y ${remainingMonths}m`;
  }
}