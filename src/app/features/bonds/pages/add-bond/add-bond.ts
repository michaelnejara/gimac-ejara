import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectBondById,
  selectCreating,
  selectUpdating
} from '@store/bonds/bonds.state';
import { Bond, BondStatus, CurrencyCode, InterestCalculationPeriod, IssuerType } from '@core/models/bond.models';

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
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  bondForm: FormGroup;
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

  constructor () {
    // Initialize form immediately to prevent undefined access
    this.bondForm = this.createEmptyForm();
  }

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
          // Already initialized in constructor, just reset to empty form
          this.bondForm = this.createEmptyForm();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBond(bondId: number): void {
    // First check if bond exists in store
    this.store.select(selectBondById(bondId))
      .pipe(
        take(1)
      )
      .subscribe(bond => {
        if (bond) {
          // Bond exists in store, initialize form with data
          this.initializeForm(bond);
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
              this.initializeForm(loadedBond);
            });
        }
      });
  }

  private createEmptyForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      descriptionEn: [''],
      descriptionFr: [''],
      colorCode: ['#3B82F6', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      ejaraInterestRate: [null, [Validators.required, Validators.min(0)]],
      customerInterestRate: [null, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      maturityDate: ['', Validators.required],
      smartContractId: ['', Validators.required],
      defaultFiatCurrency: ['XAF', Validators.required],
      fiatTokenEquivalent: [null, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
      isWithdrawalBlocked: [false],
      shouldBeDisplayedInApp: [true],
      momoMinimumDeposit: [null, [Validators.required, Validators.min(0)]],
      bankMinimumDeposit: [null, [Validators.required, Validators.min(0)]],
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
  }

  private initializeForm(bond?: Bond): void {
    if (bond) {
      // Edit mode - populate with bond data
      this.bondForm = this.fb.group({
        name: [bond.name, [Validators.required, Validators.minLength(3)]],
        descriptionEn: [bond.descriptionEn || ''],
        descriptionFr: [bond.descriptionFr || ''],
        colorCode: [bond.colorCode || '#3B82F6', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
        amount: [bond.amount, [Validators.required, Validators.min(1)]],
        ejaraInterestRate: [bond.ejaraInterestRate || 0, [Validators.required, Validators.min(0)]],
        customerInterestRate: [bond.customerInterestRate, [Validators.required, Validators.min(0)]],
        startDate: [bond.startDate.split('T')[0], Validators.required],
        maturityDate: [bond.maturityDate.split('T')[0], Validators.required],
        smartContractId: [bond.smartContractId, Validators.required],
        defaultFiatCurrency: [bond.defaultFiatCurrency, Validators.required],
        fiatTokenEquivalent: [bond.fiatTokenEquivalent || 0, [Validators.required, Validators.min(0)]],
        status: [bond.status, Validators.required],
        isWithdrawalBlocked: [bond.isWithdrawalBlocked || false],
        shouldBeDisplayedInApp: [bond.shouldBeDisplayedInApp || true],
        momoMinimumDeposit: [bond.momoMinimumDeposit || 0, [Validators.required, Validators.min(0)]],
        bankMinimumDeposit: [bond.bankMinimumDeposit || 0, [Validators.required, Validators.min(0)]],
        interestCalculationPeriod: [bond.interestCalculationPeriod || 'daily', Validators.required],
        rank: [bond.rank || 0, [Validators.required, Validators.min(0)]],
        blockchain: [bond.blockchain, Validators.required],
        issuerNameEn: [bond.issuerNameEn, [Validators.required, Validators.minLength(3)]],
        issuerNameFr: [bond.issuerNameFr || '', [Validators.required, Validators.minLength(3)]],
        issuerDescriptionEn: [bond.issuerDescriptionEn || ''],
        issuerDescriptionFr: [bond.issuerDescriptionFr || ''],
        issuerType: [bond.issuerType, Validators.required],
        issuerIcon: [bond.issuerIcon, Validators.required],
        withdrawalPeriod: [bond.withdrawalPeriod || 'maturity', Validators.required],
        unlockingPenaltyRate: [bond.unlockingPenaltyRate || 0, [Validators.min(0), Validators.max(100)]]
      });
    } else {
      // Create mode - use empty form
      this.bondForm = this.createEmptyForm();
    }
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
    } else {
      // Create new bond
      this.store.dispatch(BondsActions.createBond({
        bondData
      }));
    }

    // Listen for success and navigate back
    // Note: You may want to add success/failure listeners in effects
    // For now, navigate after a short delay
    setTimeout(() => {
      this.router.navigate(['/bonds/list']);
    }, 1000);
  }

  onCancel(): void {
    this.router.navigate(['/bonds/list']);
  }

  // Helper methods for validation display
  isFieldInvalid(fieldName: string): boolean {
    if (!this.bondForm) return false;
    const field = this.bondForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    if (!this.bondForm) return '';
    const field = this.bondForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    if (field.errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }
}