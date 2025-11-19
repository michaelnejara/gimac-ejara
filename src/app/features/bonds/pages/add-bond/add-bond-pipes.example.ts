import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Bond } from '@core/models/bond.models';
import {
  FormControlPipe,
  HasErrorPipe,
  ErrorMessagePipe,
  IsValidPipe
} from '@shared/pipes/form-control-error.pipe';

/**
 * OPTION 4: Using Template-Safe Pipes
 *
 * Benefits:
 * - Ultra-clean template code
 * - All null-safety handled in pipes
 * - No component validation methods needed
 * - Reusable across entire application
 * - Zero undefined errors possible
 */

@Component({
  selector: 'app-add-bond-pipes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormControlPipe,
    HasErrorPipe,
    ErrorMessagePipe,
    IsValidPipe
  ],
  template: `
    <form [formGroup]="bondForm" (ngSubmit)="onSubmit()" class="bond-form">

      <!-- Basic Information -->
      <div class="form-field">
        <label for="name">Bond Name <span class="required">*</span></label>
        <input
          type="text"
          id="name"
          formControlName="name"
          placeholder="Enter bond name"
          [class.error]="bondForm | hasError:'name'"
          [class.success]="bondForm | isValid:'name'"
        />
        @if (bondForm | hasError:'name') {
          <span class="error-message">
            {{ bondForm | errorMessage:'name' }}
          </span>
        }
      </div>

      <div class="form-field">
        <label for="amount">Amount <span class="required">*</span></label>
        <input
          type="number"
          id="amount"
          formControlName="amount"
          placeholder="0.00"
          step="0.01"
          [class.error]="bondForm | hasError:'amount'"
          [class.success]="bondForm | isValid:'amount'"
        />
        @if (bondForm | hasError:'amount') {
          <span class="error-message">
            {{ bondForm | errorMessage:'amount' }}
          </span>
        }
      </div>

      <!-- Advanced: Direct control access with pipe -->
      <div class="form-field">
        <label for="status">Status</label>
        <select
          id="status"
          formControlName="status"
          [class.error]="(bondForm | formControl:'status')?.invalid && (bondForm | formControl:'status')?.touched"
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Smart Contract ID with custom validation display -->
      <div class="form-field">
        <label for="smartContractId">Smart Contract ID <span class="required">*</span></label>
        <input
          type="text"
          id="smartContractId"
          formControlName="smartContractId"
          [class.error]="bondForm | hasError:'smartContractId'"
        />
        @if (bondForm | hasError:'smartContractId') {
          <span class="error-message">
            {{ bondForm | errorMessage:'smartContractId' }}
          </span>
        }
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" (click)="onCancel()">
          Cancel
        </button>
        <button
          type="submit"
          class="btn-primary"
          [disabled]="bondForm.invalid || isSubmitting"
        >
          {{ isEditMode ? 'Update Bond' : 'Create Bond' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form-field {
      margin-bottom: 1rem;
    }

    input.error, select.error {
      border-color: #ef4444;
    }

    input.success, select.success {
      border-color: #10b981;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .required {
      color: #ef4444;
    }
  `]
})
export class AddBondPipesExample implements OnInit {
  private fb = inject(FormBuilder).nonNullable;

  isEditMode = false;
  isSubmitting = false;

  // Form - always initialized, never undefined
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

  ngOnInit(): void {
    // No need for complex initialization logic
    // Form is ready to use immediately
  }

  onSubmit(): void {
    if (this.bondForm.invalid) {
      this.bondForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.bondForm.getRawValue();
    console.log('Form submitted:', formValue);

    // Reset after submission
    setTimeout(() => {
      this.isSubmitting = false;
    }, 1000);
  }

  onCancel(): void {
    this.bondForm.reset();
  }

  /**
   * Load bond for editing - simple patchValue
   */
  loadBond(bond: Bond): void {
    this.isEditMode = true;
    this.bondForm.patchValue({
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
