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
  statusOptions = ['ACTIVE', 'INACTIVE', 'PENDING', 'MATURED'];
  issuerTypeOptions = ['GOVERNMENT', 'CORPORATE', 'MUNICIPAL'];
  paymentFrequencyOptions = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'];

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
      code: [''],
      name: [''],
      defaultFiatCurrency: [''],
      status: ['ACTIVE'],

      // Step 2: Descriptions
      descriptionEn: [''],
      descriptionFr: [''],
      issuerNameEn: [''],
      issuerNameFr: [''],
      issuerType: [''],

      // Step 3: Financial
      faceValue: [''],
      couponRate: [''],
      paymentFrequency: [''],
      minimumInvestment: [''],
      maximumInvestment: [''],
      totalSupply: [''],

      // Step 4: Dates & Settings
      issueDate: [''],
      maturityDate: [''],
      colorCode: ['#3b82f6']
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
        const faceValue = this.wizardForm.get('faceValue')?.value;
        const couponRate = this.wizardForm.get('couponRate')?.value;
        const minInvestment = this.wizardForm.get('minimumInvestment')?.value;
        return !!(faceValue && couponRate && minInvestment);
      case 3: // Dates & Settings
        const issueDate = this.wizardForm.get('issueDate')?.value;
        const maturityDate = this.wizardForm.get('maturityDate')?.value;
        return !!(issueDate && maturityDate);
      default:
        return false;
    }
  }

  /**
   * Submit the wizard
   */
  submitWizard(): void {
    if (this.wizardForm.valid) {
      const formData = this.wizardForm.value;

      if (this.isEditing && this.bondId) {
        this.store.dispatch(BondsActions.updateBond({
          bondId: this.bondId,
          bondData: formData
        }));
      } else {
        this.store.dispatch(BondsActions.createBond({
          bondData: formData
        }));
      }

      this.store.dispatch(BondsActions.clearDraft());
      this.router.navigate(['/bonds']);
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
