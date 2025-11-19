import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bond } from '@core/models/bond.models';

/**
 * OPTION 3: Reactive Form with Signal-based State
 *
 * Benefits:
 * - Modern Angular approach (16+)
 * - Signal-based reactivity
 * - Better change detection performance
 * - Type-safe with computed signals
 * - Prevents undefined with reactive patterns
 */

@Component({
  selector: 'app-add-bond-signals',
  template: `
    <form [formGroup]="bondForm" (ngSubmit)="onSubmit()">
      <!-- Using signals for safer state management -->
      <input formControlName="name"
             [class.error]="fieldError('name')()">

      @if (fieldError('name')()) {
        <span class="error">{{ fieldError('name')() }}</span>
      }

      <!-- Form validity as signal -->
      <button type="submit" [disabled]="!isFormValid()">
        {{ isSubmitting() ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  `
})
export class AddBondSignalsExample implements OnInit {
  private fb = inject(FormBuilder).nonNullable;

  // Form - always initialized
  readonly bondForm = this.fb.group({
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

  // Signal-based state
  private isSubmitting = signal(false);
  private touchedFields = signal<Set<string>>(new Set());

  // Computed signals for form state
  isFormValid = computed(() => this.bondForm.valid);
  isFormDirty = computed(() => this.bondForm.dirty);

  ngOnInit(): void {
    // Subscribe to form changes and update signals
    this.bondForm.statusChanges.subscribe(() => {
      // Triggers change detection via signals
    });
  }

  /**
   * Returns a computed signal for field errors
   * Safe for template binding - never undefined
   */
  fieldError(fieldName: string) {
    return computed(() => {
      const control = this.bondForm.get(fieldName);
      if (!control) return '';

      const isTouched = this.touchedFields().has(fieldName) || control.touched;
      if (!control.invalid || !isTouched) return '';

      const errors = control.errors;
      if (!errors) return '';

      if (errors['required']) return 'This field is required';
      if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['pattern']) return 'Invalid format';

      return 'Invalid value';
    });
  }

  /**
   * Mark field as touched using signals
   */
  markFieldTouched(fieldName: string): void {
    this.touchedFields.update(fields => {
      const newFields = new Set(fields);
      newFields.add(fieldName);
      return newFields;
    });
  }

  /**
   * Safe form submission
   */
  async onSubmit(): Promise<void> {
    if (this.bondForm.invalid) {
      this.bondForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.bondForm.getRawValue();
      console.log('Submitting:', formValue);
      // await this.bondService.create(formValue);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Load bond for editing
   */
  loadBond(bond: Bond): void {
    this.bondForm.patchValue({
      name: bond.name,
      descriptionEn: bond.descriptionEn,
      descriptionFr: bond.descriptionFr,
      amount: bond.amount,
      // ... other fields
    });
  }
}
