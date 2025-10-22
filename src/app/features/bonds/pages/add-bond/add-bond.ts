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
import { Bond, BondStatus, CurrencyCode } from '@core/models/bond.models';

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

  bondForm!: FormGroup;
  isEditMode = false;
  bondId: number | null = null;

  // Observable states
  loading$ = this.store.select(selectCreating);
  updating$ = this.store.select(selectUpdating);

  // Dropdown options
  statusOptions: BondStatus[] = ['active', 'inactive', 'matured', 'pre-allocation', 'sold-out'];
  currencyOptions: CurrencyCode[] = ['XAF', 'USD', 'EUR', 'NGN', 'GHS', 'KES'];
  riskLevelOptions = ['low', 'medium', 'high'];

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
          this.initializeForm();
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

  private initializeForm(bond?: Bond): void {
    if (bond) {
      // Edit mode - populate with bond data
      this.bondForm = this.fb.group({
        name: [bond.name, [Validators.required, Validators.minLength(3)]],
        code: [bond.code, [Validators.required, Validators.minLength(2)]],
        description: [bond.descriptionEn || ''],
        principalAmount: [bond.amount, [Validators.required, Validators.min(1)]],
        interestRate: [bond.interestValue, [Validators.required, Validators.min(0)]],
        couponRate: [bond.maturityPercentage, [Validators.required, Validators.min(0)]],
        issueDate: [bond.startDate.split('T')[0], Validators.required],
        maturityDate: [bond.maturityDate.split('T')[0], Validators.required],
        valueDate: [bond.startDate.split('T')[0], Validators.required],
        tenor: [bond.lifetime ? Math.round(bond.lifetime / 30) : 0, [Validators.required, Validators.min(1)]], // Convert days to months
        fiatCurrency: [bond.defaultFiatCurrency, Validators.required],
        minPurchaseAmount: [0, [Validators.required, Validators.min(0)]],
        maxPurchaseAmount: [bond.amount],
        issuer: [bond.issuerNameEn, [Validators.required, Validators.minLength(3)]],
        status: [bond.status, Validators.required],
        riskLevel: ['low']
      });
    } else {
      // Create mode - empty form
      this.bondForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        code: ['', [Validators.required, Validators.minLength(2)]],
        description: [''],
        principalAmount: [null, [Validators.required, Validators.min(1)]],
        interestRate: [null, [Validators.required, Validators.min(0)]],
        couponRate: [null, [Validators.required, Validators.min(0)]],
        issueDate: ['', Validators.required],
        maturityDate: ['', Validators.required],
        valueDate: ['', Validators.required],
        tenor: [null, [Validators.required, Validators.min(1)]],
        fiatCurrency: ['XAF', Validators.required],
        minPurchaseAmount: [null, [Validators.required, Validators.min(0)]],
        maxPurchaseAmount: [null],
        issuer: ['', [Validators.required, Validators.minLength(3)]],
        status: ['active', Validators.required],
        riskLevel: ['low']
      });
    }
  }

  onSubmit(): void {
    if (this.bondForm.invalid) {
      this.bondForm.markAllAsTouched();
      return;
    }

    const formValue = this.bondForm.value;

    if (this.isEditMode && this.bondId) {
      // Update existing bond
      this.store.dispatch(BondsActions.updateBond({
        bondId: this.bondId,
        bondData: {
          name: formValue.name,
          description: formValue.description,
          principalAmount: formValue.principalAmount,
          interestRate: formValue.interestRate,
          couponRate: formValue.couponRate,
          issueDate: formValue.issueDate,
          maturityDate: formValue.maturityDate,
          valueDate: formValue.valueDate,
          tenor: formValue.tenor,
          fiatCurrency: formValue.fiatCurrency,
          minPurchaseAmount: formValue.minPurchaseAmount,
          maxPurchaseAmount: formValue.maxPurchaseAmount,
          issuer: formValue.issuer,
          status: formValue.status,
          riskLevel: formValue.riskLevel
        }
      }));
    } else {
      // Create new bond
      this.store.dispatch(BondsActions.createBond({
        bondData: {
          name: formValue.name,
          code: formValue.code,
          description: formValue.description,
          principalAmount: formValue.principalAmount,
          interestRate: formValue.interestRate,
          couponRate: formValue.couponRate,
          issueDate: formValue.issueDate,
          maturityDate: formValue.maturityDate,
          valueDate: formValue.valueDate,
          tenor: formValue.tenor,
          fiatCurrency: formValue.fiatCurrency,
          minPurchaseAmount: formValue.minPurchaseAmount,
          maxPurchaseAmount: formValue.maxPurchaseAmount,
          issuer: formValue.issuer,
          status: formValue.status,
          riskLevel: formValue.riskLevel
        }
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
    const field = this.bondForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.bondForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;

    return 'Invalid value';
  }
}
