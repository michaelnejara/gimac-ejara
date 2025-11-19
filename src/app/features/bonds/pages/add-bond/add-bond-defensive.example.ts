import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Bond } from '@core/models/bond.models';

/**
 * OPTION 2: NonNullable FormBuilder with Defensive Accessors
 *
 * Benefits:
 * - Uses Angular's NonNullableFormBuilder for stricter typing
 * - Safe accessor methods with null-coalescing
 * - Template-friendly helper methods
 * - Works with existing template structure
 * - Prevents all undefined errors
 */

@Component({
  selector: 'app-add-bond-defensive',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Safe property binding - no undefined errors -->
      <input formControlName="name"
             [class.error]="hasError('name')">

      @if (hasError('name')) {
        <span class="error">{{ getError('name') }}</span>
      }

      <!-- Alternative: Using optional chaining in template -->
      <input formControlName="amount"
             type="number"
             [class.error]="getControl('amount')?.invalid && getControl('amount')?.touched">

      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class AddBondDefensiveExample implements OnInit {
  // Use NonNullableFormBuilder for stricter type safety
  private fb = inject(FormBuilder).nonNullable;

  // Form is ALWAYS defined - no undefined possible
  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    descriptionEn: [''],
    descriptionFr: [''],
    colorCode: ['#3B82F6', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    ejaraInterestRate: [0, [Validators.required, Validators.min(0)]],
    customerInterestRate: [0, [Validators.required, Validators.min(0)]],
    startDate: ['', Validators.required],
    maturityDate: ['', Validators.required],
    smartContractId: ['', Validators.required],
    defaultFiatCurrency: ['XAF', Validators.required],
    fiatTokenEquivalent: [0, [Validators.required, Validators.min(0)]],
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

  ngOnInit(): void {}

  /**
   * Safe control accessor - returns control or null
   * NEVER throws undefined errors
   */
  getControl(fieldName: string): AbstractControl | null {
    return this.form?.get(fieldName) ?? null;
  }

  /**
   * Check if field has error and should display
   * Safe for template binding
   */
  hasError(fieldName: string): boolean {
    const control = this.getControl(fieldName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  /**
   * Get error message for field
   * Returns empty string if no error (safe for templates)
   */
  getError(fieldName: string): string {
    const control = this.getControl(fieldName);
    const errors = control?.errors;

    if (!errors) return '';

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }

  /**
   * Check if specific error exists
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
   * Patch multiple values safely
   */
  patchValues(values: Partial<Bond>): void {
    this.form?.patchValue(values);
  }

  /**
   * Mark field as touched (for validation display)
   */
  markTouched(fieldName: string): void {
    this.getControl(fieldName)?.markAsTouched();
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.form?.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    console.log('Form submitted:', formValue);
  }

  /**
   * Load bond data for editing
   * Uses patchValue instead of recreating form
   */
  loadBond(bond: Bond): void {
    this.patchValues({
      name: bond.name,
      descriptionEn: bond.descriptionEn,
      descriptionFr: bond.descriptionFr,
      colorCode: bond.colorCode,
      amount: bond.amount,
      ejaraInterestRate: bond.ejaraInterestRate,
      customerInterestRate: bond.customerInterestRate,
      startDate: bond.startDate.split('T')[0],
      maturityDate: bond.maturityDate.split('T')[0],
      smartContractId: bond.smartContractId,
      defaultFiatCurrency: bond.defaultFiatCurrency,
      fiatTokenEquivalent: bond.fiatTokenEquivalent,
      status: bond.status,
      isWithdrawalBlocked: bond.isWithdrawalBlocked,
      shouldBeDisplayedInApp: bond.shouldBeDisplayedInApp,
      momoMinimumDeposit: bond.momoMinimumDeposit,
      bankMinimumDeposit: bond.bankMinimumDeposit,
      interestCalculationPeriod: bond.interestCalculationPeriod,
      rank: bond.rank,
      blockchain: bond.blockchain,
      issuerNameEn: bond.issuerNameEn,
      issuerNameFr: bond.issuerNameFr,
      issuerDescriptionEn: bond.issuerDescriptionEn,
      issuerDescriptionFr: bond.issuerDescriptionFr,
      issuerType: bond.issuerType,
      issuerIcon: bond.issuerIcon,
      withdrawalPeriod: bond.withdrawalPeriod,
      unlockingPenaltyRate: bond.unlockingPenaltyRate
    });
  }
}
