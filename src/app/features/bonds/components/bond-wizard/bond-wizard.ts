// src/app/features/bonds/components/bond-wizard/bond-wizard.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectDraft,
  selectDraftStep,
  selectDraftIsEditing,
  selectDraftBondId,
  selectCreating,
  selectUpdating,
  selectSingleEntity
} from '@store/bonds/bonds.state';

import { DatePicker } from '@shared/components/forms/date-picker/date-picker';
import { ColorPicker } from '@shared/components/forms/color-picker/color-picker';

/**
 * Bond Wizard Component
 *
 * Multi-step form wizard for creating/editing bonds with draft functionality
 *
 * Steps:
 * 1. Basic Info - code, name, tokenSymbol, currency, status
 * 2. Descriptions - descriptions and issuer info (EN/FR)
 * 3. Financial - face value, coupon rate, investment amounts, supply
 * 4. Dates & Settings - issue/maturity dates, redemption terms, color
 *
 * Features:
 * - Progress indicator
 * - Draft auto-save
 * - Step validation
 * - Custom date and color pickers
 */
@Component({
  selector: 'app-bond-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePicker, ColorPicker],
  templateUrl: './bond-wizard.html',
  styleUrl: './bond-wizard.scss'
})
export class BondWizard implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Wizard state
  currentStep = 0;
  totalSteps = 4;
  isEditing = false;
  bondId: number | null = null;
  wasCreating = false;
  wasUpdating = false;

  // Observable state
  draft$ = this.store.select(selectDraft);
  draftStep$ = this.store.select(selectDraftStep);
  draftIsEditing$ = this.store.select(selectDraftIsEditing);
  draftBondId$ = this.store.select(selectDraftBondId);
  creating$ = this.store.select(selectCreating);
  updating$ = this.store.select(selectUpdating);

  // Form
  wizardForm!: FormGroup;

  // Step configuration
  steps = [
    { title: 'Basic Info', icon: 'info' },
    { title: 'Descriptions', icon: 'description' },
    { title: 'Financial', icon: 'account_balance' },
    { title: 'Dates & Settings', icon: 'event' }
  ];

  // Dropdown options
  statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'matured', label: 'Matured' },
    { value: 'pre-allocation', label: 'Pre-Allocation' },
    { value: 'sold-out', label: 'Sold Out' }
  ];
  issuerTypeOptions = [
    { value: 'government', label: 'Government' },
    { value: 'institution', label: 'Institution' },
    { value: 'corporate', label: 'Corporate' }
  ];
  paymentFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' }
  ];

  ngOnInit(): void {
    this.initializeForm();

    // Subscribe to route params to detect edit mode
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.bondId = parseInt(id, 10);
          this.isEditing = true;

          // Make 'code' field read-only in edit mode
          this.wizardForm.get('code')?.disable();

          // Load bond data
          this.store.dispatch(BondsActions.loadBond({ bondId: this.bondId }));

          // Subscribe to loaded bond and initialize draft
          this.store.select(selectSingleEntity(this.bondId))
            .pipe(takeUntil(this.destroy$))
            .subscribe(entity => {
              if (entity && entity.data && !entity.loading) {
                // Initialize draft from loaded bond
                this.store.dispatch(BondsActions.initializeDraftFromEntity({
                  bondId: this.bondId!,
                  bond: entity.data
                }));
              }
            });
        } else {
          this.isEditing = false;
          this.store.dispatch(BondsActions.initializeNewDraft());
        }
      });

    // Subscribe to draft to pre-fill form
    this.draft$
      .pipe(takeUntil(this.destroy$))
      .subscribe(draft => {
        if (draft && draft.data) {
          this.wizardForm.patchValue(draft.data, { emitEvent: false });
          this.currentStep = draft.step;
        }
      });

    // Auto-save draft on form changes (debounced)
    this.wizardForm.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.store.dispatch(BondsActions.autoSaveDraft({ data: value }));
      });

    // Listen for successful create/update and redirect
    this.creating$
      .pipe(takeUntil(this.destroy$))
      .subscribe(creating => {
        // If we were creating and now we're not (and not editing), redirect to list
        if (this.wasCreating && !creating && !this.isEditing) {
          this.wasCreating = false;
          this.store.dispatch(BondsActions.clearDraft());
          this.router.navigate(['/bonds']);
        }
        // Track when creating starts
        if (creating) {
          this.wasCreating = true;
        }
      });

    this.updating$
      .pipe(takeUntil(this.destroy$))
      .subscribe(updating => {
        // If we were updating and now we're not, redirect to detail
        if (this.wasUpdating && !updating && this.isEditing && this.bondId) {
          this.wasUpdating = false;
          this.store.dispatch(BondsActions.clearDraft());
          this.router.navigate(['/bonds/details', this.bondId]);
        }
        // Track when updating starts
        if (updating) {
          this.wasUpdating = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize wizard form with all fields
   */
  private initializeForm(): void {
    this.wizardForm = this.fb.group({
      // Step 1: Basic Info
      code: [''], // Read-only in edit mode
      name: [''],
      defaultFiatCurrency: [''],
      status: ['active'],
      blockchain: [''],
      rank: [0],

      // Step 2: Descriptions
      descriptionEn: [''],
      descriptionFr: [''],
      issuerNameEn: [''],
      issuerNameFr: [''],
      issuerDescriptionEn: [''],
      issuerDescriptionFr: [''],
      issuerType: [''],
      issuerIcon: [''],

      // Step 3: Financial
      amount: [''],
      ejaraInterestRate: [''],
      customerInterestRate: [''],
      interestCalculationPeriod: [''],
      momoMinimumDeposit: [''],
      bankMinimumDeposit: [''],
      fiatTokenEquivalent: [1],
      smartContractId: [''],

      // Step 4: Dates & Settings
      startDate: [''],
      maturityDate: [''],
      colorCode: ['#3b82f6'],
      isWithdrawalBlocked: [false],
      shouldBeDisplayedInApp: [true]
    });
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.store.dispatch(BondsActions.updateDraftStep({ step: this.currentStep }));
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.store.dispatch(BondsActions.updateDraftStep({ step: this.currentStep }));
    }
  }

  /**
   * Go to specific step
   */
  goToStep(step: number): void {
    if (step >= 0 && step < this.totalSteps) {
      this.currentStep = step;
      this.store.dispatch(BondsActions.updateDraftStep({ step: this.currentStep }));
    }
  }

  /**
   * Check if step is completed
   */
  isStepCompleted(step: number): boolean {
    // A step is only completed if we've moved past it OR it's the current step with valid data
    if (step > this.currentStep) {
      return false; // Future steps are never completed
    }

    // For current and past steps, check if they have required data
    switch (step) {
      case 0: // Basic Info
        const code = this.wizardForm.get('code')?.value;
        const name = this.wizardForm.get('name')?.value;
        return !!(code && code.trim() && name && name.trim());
      case 1: // Descriptions
        const descEn = this.wizardForm.get('descriptionEn')?.value;
        const issuerEn = this.wizardForm.get('issuerNameEn')?.value;
        return !!(descEn && descEn.trim() && issuerEn && issuerEn.trim());
      case 2: // Financial
        const amount = this.wizardForm.get('amount')?.value;
        const customerInterestRate = this.wizardForm.get('customerInterestRate')?.value;
        return !!(amount && customerInterestRate);
      case 3: // Dates & Settings
        const startDate = this.wizardForm.get('startDate')?.value;
        const maturityDate = this.wizardForm.get('maturityDate')?.value;
        return !!(startDate && maturityDate);
      default:
        return false;
    }
  }

  /**
   * Submit the wizard
   * Filter form data based on operation type
   */
  submitWizard(): void {
    if (this.wizardForm.valid || (this.isEditing && this.wizardForm.get('code')?.disabled)) {
      // Use getRawValue() to include disabled fields (like 'code' in edit mode)
      const rawFormData = this.wizardForm.getRawValue();

      if (this.isEditing && this.bondId) {
        // For UPDATE: Filter to only include fields in SingleBondUpdateRequest interface
        const bondData = {
          code: rawFormData.code,
          name: rawFormData.name,
          defaultFiatCurrency: rawFormData.defaultFiatCurrency,
          status: rawFormData.status,
          rank: rawFormData.rank,
          descriptionEn: rawFormData.descriptionEn,
          descriptionFr: rawFormData.descriptionFr,
          issuerNameEn: rawFormData.issuerNameEn,
          issuerNameFr: rawFormData.issuerNameFr,
          amount: rawFormData.amount,
          interestCalculationPeriod: rawFormData.interestCalculationPeriod,
          startDate: rawFormData.startDate,
          maturityDate: rawFormData.maturityDate,
          colorCode: rawFormData.colorCode
        };

        this.store.dispatch(BondsActions.updateBond({
          bondId: this.bondId,
          bondData
        }));
      } else {
        // For CREATE: Include all required fields from CreateBondRequest
        const bondData = {
          name: rawFormData.name,
          descriptionEn: rawFormData.descriptionEn,
          descriptionFr: rawFormData.descriptionFr,
          colorCode: rawFormData.colorCode,
          amount: rawFormData.amount,
          ejaraInterestRate: rawFormData.ejaraInterestRate || 0,
          customerInterestRate: rawFormData.customerInterestRate || 0,
          startDate: rawFormData.startDate,
          maturityDate: rawFormData.maturityDate,
          smartContractId: rawFormData.smartContractId || '',
          defaultFiatCurrency: rawFormData.defaultFiatCurrency,
          fiatTokenEquivalent: rawFormData.fiatTokenEquivalent || 1,
          status: rawFormData.status,
          isWithdrawalBlocked: rawFormData.isWithdrawalBlocked || false,
          shouldBeDisplayedInApp: rawFormData.shouldBeDisplayedInApp !== undefined ? rawFormData.shouldBeDisplayedInApp : true,
          momoMinimumDeposit: rawFormData.momoMinimumDeposit || 0,
          bankMinimumDeposit: rawFormData.bankMinimumDeposit || 0,
          interestCalculationPeriod: rawFormData.interestCalculationPeriod,
          rank: rawFormData.rank || 0,
          blockchain: rawFormData.blockchain || '',
          issuerNameEn: rawFormData.issuerNameEn,
          issuerNameFr: rawFormData.issuerNameFr,
          issuerDescriptionEn: rawFormData.issuerDescriptionEn || '',
          issuerDescriptionFr: rawFormData.issuerDescriptionFr || '',
          issuerType: rawFormData.issuerType,
          issuerIcon: rawFormData.issuerIcon || '',
          withdrawalPeriod: 'maturity',
          unlockingPenaltyRate: 0
        };

        this.store.dispatch(BondsActions.createBond({
          bondData
        }));
      }

      // Don't navigate immediately - let the success handler do it
    }
  }

  /**
   * Cancel wizard and clear draft
   */
  cancelWizard(): void {
    this.store.dispatch(BondsActions.clearDraft());
    this.router.navigate(['/bonds']);
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }
}
