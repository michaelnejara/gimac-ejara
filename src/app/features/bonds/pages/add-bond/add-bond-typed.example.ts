import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Bond } from '@core/models/bond.models';

/**
 * OPTION 1: Typed FormGroup with Getter Methods
 *
 * Benefits:
 * - Type-safe access to form controls
 * - Null-safety built into getters
 * - Autocomplete support in IDE
 * - Easier to refactor
 * - No runtime undefined errors
 */

// Define a typed interface for the form
interface BondFormControls {
  name: FormControl<string | null>;
  descriptionEn: FormControl<string | null>;
  descriptionFr: FormControl<string | null>;
  colorCode: FormControl<string | null>;
  amount: FormControl<number | null>;
  ejaraInterestRate: FormControl<number | null>;
  customerInterestRate: FormControl<number | null>;
  startDate: FormControl<string | null>;
  maturityDate: FormControl<string | null>;
  smartContractId: FormControl<string | null>;
  defaultFiatCurrency: FormControl<string | null>;
  fiatTokenEquivalent: FormControl<number | null>;
  status: FormControl<string | null>;
  isWithdrawalBlocked: FormControl<boolean | null>;
  shouldBeDisplayedInApp: FormControl<boolean | null>;
  momoMinimumDeposit: FormControl<number | null>;
  bankMinimumDeposit: FormControl<number | null>;
  interestCalculationPeriod: FormControl<string | null>;
  rank: FormControl<number | null>;
  blockchain: FormControl<string | null>;
  issuerNameEn: FormControl<string | null>;
  issuerNameFr: FormControl<string | null>;
  issuerDescriptionEn: FormControl<string | null>;
  issuerDescriptionFr: FormControl<string | null>;
  issuerType: FormControl<string | null>;
  issuerIcon: FormControl<string | null>;
  withdrawalPeriod: FormControl<string | null>;
  unlockingPenaltyRate: FormControl<number | null>;
}

@Component({
  selector: 'app-add-bond-typed',
  template: `
    <form [formGroup]="bondForm" (ngSubmit)="onSubmit()">
      <!-- Using getters - safe and typed -->
      <input formControlName="name"
             [class.error]="name.invalid && name.touched">

      @if (name.invalid && name.touched) {
        <span class="error">{{ getErrorMessage(name) }}</span>
      }

      <input formControlName="amount"
             type="number"
             [class.error]="amount.invalid && amount.touched">

      @if (amount.invalid && amount.touched) {
        <span class="error">{{ getErrorMessage(amount) }}</span>
      }

      <button type="submit" [disabled]="bondForm.invalid">Submit</button>
    </form>
  `
})
export class AddBondTypedExample implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  // Typed FormGroup - never undefined
  bondForm = this.fb.group<BondFormControls>({
    name: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    descriptionEn: this.fb.control(''),
    descriptionFr: this.fb.control(''),
    colorCode: this.fb.control('#3B82F6', [Validators.required]),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    ejaraInterestRate: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    customerInterestRate: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    startDate: this.fb.control('', Validators.required),
    maturityDate: this.fb.control('', Validators.required),
    smartContractId: this.fb.control('', Validators.required),
    defaultFiatCurrency: this.fb.control('XAF', Validators.required),
    fiatTokenEquivalent: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    status: this.fb.control('active', Validators.required),
    isWithdrawalBlocked: this.fb.control(false),
    shouldBeDisplayedInApp: this.fb.control(true),
    momoMinimumDeposit: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    bankMinimumDeposit: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    interestCalculationPeriod: this.fb.control('daily', Validators.required),
    rank: this.fb.control(0, [Validators.required, Validators.min(0)]),
    blockchain: this.fb.control('', Validators.required),
    issuerNameEn: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    issuerNameFr: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    issuerDescriptionEn: this.fb.control(''),
    issuerDescriptionFr: this.fb.control(''),
    issuerType: this.fb.control('', Validators.required),
    issuerIcon: this.fb.control('', Validators.required),
    withdrawalPeriod: this.fb.control('maturity', Validators.required),
    unlockingPenaltyRate: this.fb.control(0, [Validators.min(0), Validators.max(100)])
  });

  // Typed getters - always safe to access
  get name() { return this.bondForm.controls.name; }
  get descriptionEn() { return this.bondForm.controls.descriptionEn; }
  get descriptionFr() { return this.bondForm.controls.descriptionFr; }
  get colorCode() { return this.bondForm.controls.colorCode; }
  get amount() { return this.bondForm.controls.amount; }
  get ejaraInterestRate() { return this.bondForm.controls.ejaraInterestRate; }
  get customerInterestRate() { return this.bondForm.controls.customerInterestRate; }
  get startDate() { return this.bondForm.controls.startDate; }
  get maturityDate() { return this.bondForm.controls.maturityDate; }
  get smartContractId() { return this.bondForm.controls.smartContractId; }
  get defaultFiatCurrency() { return this.bondForm.controls.defaultFiatCurrency; }
  get fiatTokenEquivalent() { return this.bondForm.controls.fiatTokenEquivalent; }
  get status() { return this.bondForm.controls.status; }
  get isWithdrawalBlocked() { return this.bondForm.controls.isWithdrawalBlocked; }
  get shouldBeDisplayedInApp() { return this.bondForm.controls.shouldBeDisplayedInApp; }
  get momoMinimumDeposit() { return this.bondForm.controls.momoMinimumDeposit; }
  get bankMinimumDeposit() { return this.bondForm.controls.bankMinimumDeposit; }
  get interestCalculationPeriod() { return this.bondForm.controls.interestCalculationPeriod; }
  get rank() { return this.bondForm.controls.rank; }
  get blockchain() { return this.bondForm.controls.blockchain; }
  get issuerNameEn() { return this.bondForm.controls.issuerNameEn; }
  get issuerNameFr() { return this.bondForm.controls.issuerNameFr; }
  get issuerDescriptionEn() { return this.bondForm.controls.issuerDescriptionEn; }
  get issuerDescriptionFr() { return this.bondForm.controls.issuerDescriptionFr; }
  get issuerType() { return this.bondForm.controls.issuerType; }
  get issuerIcon() { return this.bondForm.controls.issuerIcon; }
  get withdrawalPeriod() { return this.bondForm.controls.withdrawalPeriod; }
  get unlockingPenaltyRate() { return this.bondForm.controls.unlockingPenaltyRate; }

  ngOnInit(): void {
    // For edit mode, patch values instead of recreating form
    // this.bondForm.patchValue(bondData);
  }

  ngOnDestroy(): void {}

  // Generic error message handler
  getErrorMessage(control: FormControl): string {
    if (!control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
    if (control.errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.bondForm.valid) {
      const formValue = this.bondForm.getRawValue();
      console.log('Form submitted:', formValue);
    }
  }

  // For edit mode - patch instead of recreate
  loadBond(bond: Bond): void {
    this.bondForm.patchValue({
      name: bond.name,
      descriptionEn: bond.descriptionEn,
      amount: bond.amount,
      // ... other fields
    });
  }
}
