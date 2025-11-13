// src/app/features/partners/components/partner-wizard/partner-wizard.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { PartnersActions } from '@store/partners/partners.actions';
import {
  selectDraft,
  selectDraftStep,
  selectDraftIsEditing,
  selectDraftPartnerId,
  selectCreating,
  selectUpdating
} from '@store/partners/partners.state';

/**
 * Partner Wizard Component
 *
 * Multi-step form wizard for creating/editing partners with draft functionality
 *
 * Steps:
 * 1. Basic Info - name, description
 * 2. Configuration - webhookUrl, allowedIpAddresses, allowedBonds
 * 3. Financial - commissionRate, settlementAccount, transaction limits
 * 4. Address - address, city, state, country, postalCode
 *
 * Features:
 * - Progress indicator
 * - Draft auto-save
 * - Step validation
 * - Navigation between steps
 * - Pre-fill from draft or loaded entity
 */
@Component({
  selector: 'app-partner-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './partner-wizard.html',
  styleUrl: './partner-wizard.scss'
})
export class PartnerWizard implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Wizard state
  currentStep = 0;
  totalSteps = 4;
  isEditing = false;
  partnerId: number | null = null;

  // Observable state
  draft$ = this.store.select(selectDraft);
  draftStep$ = this.store.select(selectDraftStep);
  draftIsEditing$ = this.store.select(selectDraftIsEditing);
  draftPartnerId$ = this.store.select(selectDraftPartnerId);
  creating$ = this.store.select(selectCreating);
  updating$ = this.store.select(selectUpdating);

  // Form
  wizardForm!: FormGroup;

  // Step configuration
  steps = [
    { title: 'Basic Info', icon: 'info' },
    { title: 'Configuration', icon: 'settings' },
    { title: 'Financial', icon: 'attach_money' },
    { title: 'Address', icon: 'location_on' }
  ];

  ngOnInit(): void {
    // Initialize form
    this.initializeForm();

    // Subscribe to route params to detect edit mode
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.partnerId = parseInt(id, 10);
          this.isEditing = true;
          // Load partner and initialize draft
          // This would be done via effects in a full implementation
        } else {
          this.isEditing = false;
          // Initialize new draft
          this.store.dispatch(PartnersActions.initializeNewDraft());
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
        this.store.dispatch(PartnersActions.autoSaveDraft({ data: value }));
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
      name: [''],
      description: [''],

      // Step 2: Configuration
      webhookUrl: [''],
      allowedIpAddresses: [[]],
      allowedBonds: [[]],

      // Step 3: Financial
      commissionRate: [''],
      settlementAccount: [''],
      minTransactionAmount: [''],
      maxTransactionAmount: [''],
      dailyTransactionLimit: [''],
      monthlyTransactionLimit: [''],

      // Step 4: Address
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: ['']
    });
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.store.dispatch(PartnersActions.updateDraftStep({ step: this.currentStep }));
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.store.dispatch(PartnersActions.updateDraftStep({ step: this.currentStep }));
    }
  }

  /**
   * Go to specific step
   */
  goToStep(step: number): void {
    if (step >= 0 && step < this.totalSteps) {
      this.currentStep = step;
      this.store.dispatch(PartnersActions.updateDraftStep({ step: this.currentStep }));
    }
  }

  /**
   * Check if step is completed (has valid data)
   */
  isStepCompleted(step: number): boolean {
    // Basic validation - can be enhanced
    switch (step) {
      case 0: // Basic Info
        return !!this.wizardForm.get('name')?.value;
      case 1: // Configuration
        return true; // Optional fields
      case 2: // Financial
        return !!this.wizardForm.get('commissionRate')?.value &&
               !!this.wizardForm.get('minTransactionAmount')?.value;
      case 3: // Address
        return true; // Optional fields
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

      if (this.isEditing && this.partnerId) {
        // Update partner
        this.store.dispatch(PartnersActions.updatePartner({
          partnerId: this.partnerId,
          partnerData: formData
        }));
      } else {
        // Create partner
        this.store.dispatch(PartnersActions.createPartner({
          partnerData: formData
        }));
      }

      // Clear draft after submission
      this.store.dispatch(PartnersActions.clearDraft());

      // Navigate back to partners list
      this.router.navigate(['/partners']);
    }
  }

  /**
   * Cancel wizard and clear draft
   */
  cancelWizard(): void {
    this.store.dispatch(PartnersActions.clearDraft());
    this.router.navigate(['/partners']);
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }
}
