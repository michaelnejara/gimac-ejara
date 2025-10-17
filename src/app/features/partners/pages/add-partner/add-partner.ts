// src/app/features/partners/pages/add-partner/add-partner.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, debounceTime, startWith, map } from 'rxjs/operators';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Store
import { PartnersActions } from '@store/partners/partners.actions';
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectPartnerById,
  selectCreating,
  selectUpdating,
  selectError
} from '@store/partners/partners.state';
import { selectAllBonds, selectLoading } from '@store/bonds/bonds.state';

// Models
import { Partner, SinglePartner, CreatePartnerRequest, UpdatePartnerRequest } from '@core/models/partner.models';
import { Bond } from '@core/models/bond.models';

@Component({
  selector: 'app-add-partner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    FormsModule
  ],
  templateUrl: './add-partner.html',
  styleUrl: './add-partner.scss'
})
export class AddPartner implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Form
  partnerForm!: FormGroup;
  
  // State
  isEditMode = false;
  partnerId: number | null = null;
  partner$!: Observable<Partner | SinglePartner | undefined>;
  creating$: Observable<boolean>;
  updating$: Observable<boolean>;
  error$: Observable<string | null>;
  
  // Bonds
  availableBonds$: Observable<Bond[]>;
  bondsLoading$: Observable<boolean>;
  filteredBonds$!: Observable<Bond[]>;
  bondSearchControl = this.fb.control('');
  
  // IP Address input
  newIpAddress = '';

  // Countries list
  countries = [
    { code: 'CM', name: 'Cameroon' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'KE', name: 'Kenya' },
    { code: 'SN', name: 'Senegal' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'TG', name: 'Togo' },
    { code: 'BJ', name: 'Benin' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' }
  ];

  constructor() {
    this.creating$ = this.store.select(selectCreating);
    this.updating$ = this.store.select(selectUpdating);
    this.error$ = this.store.select(selectError);
    this.availableBonds$ = this.store.select(selectAllBonds);
    this.bondsLoading$ = this.store.select(selectLoading);
  }

  ngOnInit(): void {
    // Load bonds
    this.store.dispatch(BondsActions.loadBonds({ filters: { status: 'active' } }));

    // Initialize form
    this.initializeForm();

    // Setup bond search/filter
    this.setupBondFilter();

    // Check if edit mode
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.partnerId = +params['id'];
        this.loadPartner();
      }
    });

    // Listen for successful creation/update
    this.listenForSuccess();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize form
   */
  private initializeForm(): void {
    this.partnerForm = this.fb.group({
      // Basic Information
      name: ['', [Validators.required, Validators.maxLength(300)]],
      description: ['', [Validators.maxLength(1000)]],
      
      // Configuration
      webhookUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      allowedIpAddresses: this.fb.array([]),
      allowedBonds: [[], [Validators.required, Validators.minLength(1)]],
      
      // Financial Settings
      commissionRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      settlementAccount: [''],
      minTransactionAmount: [0, [Validators.required, Validators.min(0)]],
      maxTransactionAmount: [null, [Validators.min(0)]],
      dailyTransactionLimit: [null, [Validators.min(0)]],
      monthlyTransactionLimit: [null, [Validators.min(0)]],
      
      // Address Information
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: ['']
    });

    // Add cross-field validation
    this.partnerForm.setValidators(this.amountValidator);
  }

  /**
   * Setup bond filtering with search
   */
  private setupBondFilter(): void {
    this.filteredBonds$ = combineLatest([
      this.bondSearchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300)
      ),
      this.availableBonds$
    ]).pipe(
      map(([searchTerm, bonds]) => {
        if (!searchTerm) {
          return bonds;
        }
        const search = searchTerm.toLowerCase();
        return bonds.filter(bond =>
          bond.name.toLowerCase().includes(search) ||
          bond.code.toLowerCase().includes(search)
        );
      })
    );
  }

  /**
   * Load more bonds if needed
   */
  loadMoreBonds(): void {
    // This would be called when scrolling or if search returns no results
    this.store.dispatch(BondsActions.loadBonds({ 
      filters: { 
        status: 'active',
        limit: 50 
      } 
    }));
  }

  /**
   * Custom validator: max amount should be greater than min amount
   */
  private amountValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const minAmount = control.get('minTransactionAmount')?.value;
    const maxAmount = control.get('maxTransactionAmount')?.value;

    if (maxAmount && minAmount && maxAmount <= minAmount) {
      return { maxLessThanMin: true };
    }

    return null;
  }

  /**
   * Get IP addresses form array
   */
  get ipAddresses(): FormArray {
    return this.partnerForm.get('allowedIpAddresses') as FormArray;
  }

  /**
   * Add IP address
   */
  addIpAddress(): void {
    const ip = this.newIpAddress.trim();
    if (ip && this.isValidIpAddress(ip)) {
      this.ipAddresses.push(this.fb.control(ip));
      this.newIpAddress = '';
    }
  }

  /**
   * Remove IP address
   */
  removeIpAddress(index: number): void {
    this.ipAddresses.removeAt(index);
  }

  /**
   * Validate IP address
   */
  private isValidIpAddress(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Load partner for editing
   */
  private loadPartner(): void {
    if (!this.partnerId) return;

    this.partner$ = this.store.select(selectPartnerById(this.partnerId));
    
    this.store.dispatch(PartnersActions.loadPartner({ partnerId: this.partnerId }));

    this.partner$.pipe(
      filter(partner => !!partner),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(partner => {
      if (partner) {
        this.populateForm(partner);
      }
    });
  }

  /**
   * Populate form with partner data
   */
  private populateForm(partner: Partner | SinglePartner): void {
    this.ipAddresses.clear();

    if (partner.allowedIpAddresses) {
      partner.allowedIpAddresses.forEach(ip => {
        this.ipAddresses.push(this.fb.control(ip));
      });
    }

    // Type guard to check if it's SinglePartner (has description field)
    const isSinglePartner = (p: Partner | SinglePartner): p is SinglePartner => {
      return 'description' in p;
    };

    // Extract allowedBonds IDs if Partner, or load from API if SinglePartner
    const allowedBondIds = 'allowedBonds' in partner
      ? (partner as Partner).allowedBonds.map(bond => bond.id)
      : [];

    this.partnerForm.patchValue({
      name: partner.name,
      description: isSinglePartner(partner) ? partner.description || '' : '',
      webhookUrl: partner.webhookUrl || '',
      allowedBonds: allowedBondIds,
      commissionRate: partner.commissionRate,
      settlementAccount: partner.settlementAccount || '',
      minTransactionAmount: partner.minTransactionAmount,
      maxTransactionAmount: partner.maxTransactionAmount,
      dailyTransactionLimit: partner.dailyTransactionLimit,
      monthlyTransactionLimit: partner.monthlyTransactionLimit,
      address: isSinglePartner(partner) ? partner.address || '' : '',
      city: isSinglePartner(partner) ? partner.city || '' : '',
      state: isSinglePartner(partner) ? partner.state || '' : '',
      country: isSinglePartner(partner) ? partner.country || '' : '',
      postalCode: isSinglePartner(partner) ? partner.postalCode || '' : ''
    });
  }

  /**
   * Listen for success
   */
  private listenForSuccess(): void {
    combineLatest([
      this.creating$,
      this.updating$
    ]).pipe(
      debounceTime(100),
      takeUntil(this.destroy$)
    ).subscribe(([creating, updating]) => {
      if (!creating && !updating) {
        this.error$.pipe(take(1)).subscribe(error => {
          if (!error && this.partnerForm.dirty) {
            this.router.navigate(['/partners']);
          }
        });
      }
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.partnerForm.invalid) {
      this.partnerForm.markAllAsTouched();
      return;
    }

    const formValue = this.partnerForm.value;
    const allowedIpAddresses = this.ipAddresses.controls.map(c => c.value);

    if (this.isEditMode && this.partnerId) {
      const updateData: UpdatePartnerRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        webhookUrl: formValue.webhookUrl || undefined,
        allowedIpAddresses: allowedIpAddresses.length > 0 ? allowedIpAddresses : undefined,
        commissionRate: formValue.commissionRate,
        settlementAccount: formValue.settlementAccount || undefined,
        minTransactionAmount: formValue.minTransactionAmount,
        maxTransactionAmount: formValue.maxTransactionAmount || undefined,
        dailyTransactionLimit: formValue.dailyTransactionLimit || undefined,
        monthlyTransactionLimit: formValue.monthlyTransactionLimit || undefined
      };

      this.store.dispatch(PartnersActions.updatePartner({
        partnerId: this.partnerId,
        partnerData: updateData
      }));
    } else {
      const createData: CreatePartnerRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        webhookUrl: formValue.webhookUrl || undefined,
        allowedIpAddresses: allowedIpAddresses.length > 0 ? allowedIpAddresses : undefined,
        allowedBonds: formValue.allowedBonds,
        commissionRate: formValue.commissionRate,
        settlementAccount: formValue.settlementAccount || undefined,
        minTransactionAmount: formValue.minTransactionAmount,
        maxTransactionAmount: formValue.maxTransactionAmount || undefined,
        dailyTransactionLimit: formValue.dailyTransactionLimit || undefined,
        monthlyTransactionLimit: formValue.monthlyTransactionLimit || undefined,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        country: formValue.country || undefined,
        postalCode: formValue.postalCode || undefined
      };

      this.store.dispatch(PartnersActions.createPartner({ partnerData: createData }));
    }
  }

  /**
   * Cancel
   */
  onCancel(): void {
    this.router.navigate(['/partners']);
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.partnerForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.dirty || field?.touched));
  }

  /**
   * Get error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.partnerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('maxlength')) {
      return `Maximum length exceeded`;
    }
    if (field?.hasError('min')) {
      return `Minimum value is ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `Maximum value is ${field.errors?.['max'].max}`;
    }
    if (field?.hasError('pattern')) {
      return 'Invalid format';
    }
    
    return '';
  }

  /**
   * Get bond display name
   */
  getBondDisplayName(bond: Bond): string {
    return `${bond.name} (${bond.code})`;
  }
}