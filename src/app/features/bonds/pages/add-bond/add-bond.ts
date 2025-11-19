import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectBondById,
  selectCreating,
  selectUpdating
} from '@store/bonds/bonds.state';
import { Bond, BondStatus, CurrencyCode, InterestCalculationPeriod, IssuerType } from '@core/models/bond.models';
import { numericOnly } from '@core/validators/numeric.validator';

@Component({
  selector: 'app-add-bond',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-bond.html',
  styleUrl: './add-bond.scss'
})
export class AddBond implements OnInit, OnDestroy {
  // Use NonNullableFormBuilder for stricter type safety
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private destroy$ = new Subject<void>();

  // Form is ALWAYS defined - initialized immediately
  readonly bondForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    descriptionEn: [''],
    descriptionFr: [''],
    colorCode: ['#3B82F6', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    ejaraInterestRate: [0, [Validators.required, Validators.min(0.01)]],
    customerInterestRate: [0, [Validators.required, Validators.min(0.01)]],
    startDate: ['', Validators.required],
    maturityDate: ['', Validators.required],
    smartContractId: ['', [Validators.required, numericOnly()]],
    defaultFiatCurrency: ['XAF', Validators.required],
    fiatTokenEquivalent: [0, [Validators.required, Validators.min(0.01)]],
    status: ['active', Validators.required],
    isWithdrawalBlocked: [false],
    shouldBeDisplayedInApp: [true],
    momoMinimumDeposit: [0, [Validators.required, Validators.min(0)]],
    bankMinimumDeposit: [0, [Validators.required, Validators.min(0)]],
    interestCalculationPeriod: ['daily', Validators.required],
    rank: [0, [Validators.required, Validators.min(0)]],
    blockchain: ['', Validators.required],
    issuerNameEn: ['', [Validators.required, Validators.minLength(3)]],
    issuerNameFr: ['', [Validators.required, Validators.minLength(3)]],
    issuerDescriptionEn: [''],
    issuerDescriptionFr: [''],
    issuerType: ['', Validators.required],
    issuerIcon: ['', Validators.required],
    withdrawalPeriod: ['maturity', Validators.required],
    unlockingPenaltyRate: [0, [Validators.min(0), Validators.max(100)]]
  });

  isEditMode = false;
  bondId: number | null = null;

  // Observable states
  loading$ = this.store.select(selectCreating);
  updating$ = this.store.select(selectUpdating);

  // Dropdown options
  statusOptions: BondStatus[] = ['active', 'inactive', 'matured', 'pre-allocation', 'sold-out'];
  currencyOptions: CurrencyCode[] = ['XAF', 'USD', 'EUR', 'NGN', 'GHS', 'KES'];
  interestPeriodOptions: InterestCalculationPeriod[] = ['daily', 'monthly', 'annually'];
  issuerTypeOptions: IssuerType[] = ['government', 'institution', 'corporate'];
  blockchainOptions: string[] = ['tezos', 'ethereum'];
  withdrawalPeriodOptions: string[] = ['maturity', 'anytime', 'after_period'];

  ngOnInit(): void {
    // Check if we have a bond ID in the route params
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.isEditMode = true;
          this.bondId = +id;
          this.loadBond(this.bondId);
        } else {
          // Reset to empty form for create mode
          this.resetForm();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load bond data from store
   */
  private loadBond(bondId: number): void {
    // First check if bond exists in store
    this.store.select(selectBondById(bondId))
      .pipe(
        take(1)
      )
      .subscribe(bond => {
        if (bond) {
          // Bond exists in store, patch form with data
          this.patchBondData(bond);
        } else {
          // Bond not in store, dispatch load action
          this.store.dispatch(BondsActions.loadBond({ bondId }));

          // Wait for bond to load
          this.store.select(selectBondById(bondId))
            .pipe(
              filter(b => !!b),
              take(1),
              takeUntil(this.destroy$)
            )
            .subscribe(loadedBond => {
              this.patchBondData(loadedBond);
            });
        }
      });
  }

  /**
   * Patch form with bond data (for edit mode)
   * Uses patchValue instead of recreating form
   */
  private patchBondData(bond: Bond): void {
    this.bondForm.patchValue({
      name: bond.name,
      descriptionEn: bond.descriptionEn || '',
      descriptionFr: bond.descriptionFr || '',
      colorCode: bond.colorCode || '#3B82F6',
      amount: bond.amount,
      ejaraInterestRate: bond.ejaraInterestRate || 0,
      customerInterestRate: bond.customerInterestRate,
      startDate: bond.startDate.split('T')[0],
      maturityDate: bond.maturityDate.split('T')[0],
      smartContractId: bond.smartContractId,
      defaultFiatCurrency: bond.defaultFiatCurrency,
      fiatTokenEquivalent: bond.fiatTokenEquivalent || 0,
      status: bond.status,
      isWithdrawalBlocked: bond.isWithdrawalBlocked || false,
      shouldBeDisplayedInApp: bond.shouldBeDisplayedInApp ?? true,
      momoMinimumDeposit: bond.momoMinimumDeposit || 0,
      bankMinimumDeposit: bond.bankMinimumDeposit || 0,
      interestCalculationPeriod: bond.interestCalculationPeriod || 'daily',
      rank: bond.rank || 0,
      blockchain: bond.blockchain,
      issuerNameEn: bond.issuerNameEn,
      issuerNameFr: bond.issuerNameFr || '',
      issuerDescriptionEn: bond.issuerDescriptionEn || '',
      issuerDescriptionFr: bond.issuerDescriptionFr || '',
      issuerType: bond.issuerType,
      issuerIcon: bond.issuerIcon,
      withdrawalPeriod: bond.withdrawalPeriod || 'maturity',
      unlockingPenaltyRate: bond.unlockingPenaltyRate || 0
    });
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.bondForm.reset({
      name: '',
      descriptionEn: '',
      descriptionFr: '',
      colorCode: '#3B82F6',
      amount: 0,
      ejaraInterestRate: 0,
      customerInterestRate: 0,
      startDate: '',
      maturityDate: '',
      smartContractId: '',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 0,
      status: 'active',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: true,
      momoMinimumDeposit: 0,
      bankMinimumDeposit: 0,
      interestCalculationPeriod: 'daily',
      rank: 0,
      blockchain: '',
      issuerNameEn: '',
      issuerNameFr: '',
      issuerDescriptionEn: '',
      issuerDescriptionFr: '',
      issuerType: '',
      issuerIcon: '',
      withdrawalPeriod: 'maturity',
      unlockingPenaltyRate: 0
    });
  }

  onSubmit(): void {
    if (this.bondForm.invalid) {
      this.bondForm.markAllAsTouched();
      return;
    }

    const formValue = this.bondForm.value;

    const bondData = {
      name: formValue.name,
      descriptionEn: formValue.descriptionEn,
      descriptionFr: formValue.descriptionFr,
      colorCode: formValue.colorCode,
      amount: formValue.amount,
      ejaraInterestRate: formValue.ejaraInterestRate,
      customerInterestRate: formValue.customerInterestRate,
      startDate: formValue.startDate,
      maturityDate: formValue.maturityDate,
      smartContractId: formValue.smartContractId,
      defaultFiatCurrency: formValue.defaultFiatCurrency,
      fiatTokenEquivalent: formValue.fiatTokenEquivalent,
      status: formValue.status,
      isWithdrawalBlocked: formValue.isWithdrawalBlocked,
      shouldBeDisplayedInApp: formValue.shouldBeDisplayedInApp,
      momoMinimumDeposit: formValue.momoMinimumDeposit,
      bankMinimumDeposit: formValue.bankMinimumDeposit,
      interestCalculationPeriod: formValue.interestCalculationPeriod,
      rank: formValue.rank,
      blockchain: formValue.blockchain,
      issuerNameEn: formValue.issuerNameEn,
      issuerNameFr: formValue.issuerNameFr,
      issuerDescriptionEn: formValue.issuerDescriptionEn,
      issuerDescriptionFr: formValue.issuerDescriptionFr,
      issuerType: formValue.issuerType,
      issuerIcon: formValue.issuerIcon,
      withdrawalPeriod: formValue.withdrawalPeriod,
      unlockingPenaltyRate: formValue.unlockingPenaltyRate
    };

    if (this.isEditMode && this.bondId) {
      // Update existing bond
      this.store.dispatch(BondsActions.updateBond({
        bondId: this.bondId,
        bondData
      }));

      // Navigate only on success
      // Errors are handled by effects (toast notifications) and user stays on page
      this.actions$
        .pipe(
          ofType(BondsActions.updateBondSuccess),
          take(1),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          // Success - navigate back to list
          this.router.navigate(['/bonds/list']);
        });
    } else {
      // Create new bond
      this.store.dispatch(BondsActions.createBond({
        bondData
      }));

      // Navigate only on success
      // Errors are handled by effects (toast notifications) and user stays on page
      this.actions$
        .pipe(
          ofType(BondsActions.createBondSuccess),
          take(1),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          // Success - navigate back to list
          this.router.navigate(['/bonds/list']);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/bonds/list']);
  }

  // ============================================
  // Defensive Accessor Methods
  // ============================================

  /**
   * Safe control accessor - returns control or null
   * NEVER throws undefined errors
   */
  getControl(fieldName: string): AbstractControl | null {
    return this.bondForm?.get(fieldName) ?? null;
  }

  /**
   * Check if field has error and should display
   * Safe for template binding - always returns boolean
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.getControl(fieldName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  /**
   * Get error message for field
   * Returns empty string if no error (safe for templates)
   */
  getFieldError(fieldName: string): string {
    const control = this.getControl(fieldName);
    const errors = control?.errors;

    if (!errors) return '';

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['numericOnly']) return 'Only numbers are allowed';

    return 'Invalid value';
  }

  /**
   * Check if specific error exists on a field
   */
  hasSpecificError(fieldName: string, errorKey: string): boolean {
    return !!this.getControl(fieldName)?.hasError(errorKey);
  }

  /**
   * Get control value safely
   */
  getValue<T = any>(fieldName: string, defaultValue: T | null = null): T | null {
    return this.getControl(fieldName)?.value ?? defaultValue;
  }

  /**
   * Set control value safely
   */
  setValue(fieldName: string, value: any): void {
    this.getControl(fieldName)?.setValue(value);
  }

  /**
   * Mark field as touched (for validation display)
   */
  markFieldTouched(fieldName: string): void {
    this.getControl(fieldName)?.markAsTouched();
  }
}