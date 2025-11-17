// src/app/features/bonds/pages/bonds-list/bonds-list.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Shared
import { DataTable } from '@shared/components/data-table/data-table';
import { TableColumnDirective, TableActionsDirective } from '@shared/components/data-table/data-table-directives';
import {
  TableConfig,
  TableColumn,
  TablePageEvent,
  TableSortEvent
} from '@core/models/table-config.models';

// Store - Bonds Actions
import { BondsActions } from '@store/bonds/bonds.actions';
import {
  selectCurrentPageBonds,
  selectPartnerBonds,
  selectCustomerBonds,
  selectLoading,
  selectError,
  selectPagination
} from '@store/bonds/bonds.state';

// Store - Partners Actions (for assigning/removing bonds)
import { PartnersActions } from '@store/partners/partners.actions';
import { selectPartnerById } from '@store/partners/partners.state';

// Models
import {
  Bond,
  PartnerBond,
  CustomerBondHolding,
  BondFilterParams,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  BondStatus,
  CurrencyCode
} from '@core/models/bond.models';
import {
  RemoveBondsRequest
} from '@core/models/partner.models';

// Components
import { AssignBondsModal } from '@shared/components/forms/assign-bonds-modal/assign-bonds-modal';
import { ConfirmBondsModal } from '@shared/components/forms/confirm-bonds-modal/confirm-bonds-modal';

// Types
type BondContextType = 'default' | 'partner' | 'customer';

@Component({
  selector: 'app-bonds-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    DataTable,
    TableColumnDirective,
    TableActionsDirective,
    RouterModule
  ],
  templateUrl: './bonds-list.component.html',
  styleUrl: './bonds-list.component.scss'
})
export class BondsListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private filterSubscriptions$ = new Subject<void>(); // For filter-specific subscriptions

  // Context
  context: BondContextType = 'default';
  partnerId: number | null = null;
  customerId: number | null = null;

  // Observables
  bonds$!: Observable<Bond[] | PartnerBond[] | CustomerBondHolding[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  pagination$!: Observable<any>;
  partner$!: Observable<any>; // Partner data for partner context

  // Active filters count (computed from local form)
  activeFiltersCount = 0;
  activeFiltersCount$!: Observable<number>; // Observable for template async pipe

  // UI State
  filtersExpanded = false;
  hasUnappliedFilters = false;
  filterPanelOpen = false; // Offcanvas panel state

  // Filter Form
  filterForm!: FormGroup;

  // Date validators
  maxDate = new Date(); // Today

  // Dropdown Options
  statusOptions: { value: BondStatus | string; label: string }[] = [];
  currencyOptions: { value: CurrencyCode; label: string }[] = [
    { value: 'XAF', label: 'XAF - Central African CFA Franc' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'NGN', label: 'NGN - Nigerian Naira' },
    { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
    { value: 'KES', label: 'KES - Kenyan Shilling' }
  ];

  // Table Configuration
  tableConfig!: TableConfig<Bond | PartnerBond | CustomerBondHolding>;

  // Customer Holdings Stats (computed from bonds$ for customer context)
  activeHoldingsCount = 0;
  maturedHoldingsCount = 0;

  ngOnInit(): void {
    this.initializeContext();
    this.initializeStatusOptions();
    this.initializeFilterForm();
    this.initializeObservables();
    this.initializeTableConfig();
    this.setupFilterSubscriptions();
    this.setupTableSubscriptions();
    this.setupHoldingsStatsSubscription();
    this.setupDateValidation();
    this.loadBonds();
  }

  ngOnDestroy(): void {
    // Reset to first page when leaving the bonds list
    this.store.dispatch(BondsActions.resetToFirstPage());

    this.filterSubscriptions$.next();
    this.filterSubscriptions$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize context from query params
   */
  private initializeContext(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const hasPartnerId = params['partnerId'];
      const hasCustomerId = params['customerId'];
      const previousContext = this.context;
      let contextChanged = false;

      if (hasPartnerId && hasCustomerId) {
        this.context = 'customer';
        this.partnerId = +params['partnerId'];
        this.customerId = +params['customerId'];
        contextChanged = previousContext !== 'customer';

        // Reset store when entering customer context (fresh data needed)
        this.store.dispatch(BondsActions.resetForContextView());
        this.store.dispatch(BondsActions.setViewMode({ mode: 'customer' }));
        this.store.dispatch(BondsActions.setActivePartner({ partnerId: this.partnerId }));
        this.store.dispatch(BondsActions.setBondsContext({
          context: {
            page: 'customer',
            partnerId: this.partnerId,
            customerId: this.customerId
          }
        }));
      } else if (hasPartnerId && !hasCustomerId) {
        this.context = 'partner';
        this.partnerId = +params['partnerId'];
        this.customerId = null;
        contextChanged = previousContext !== 'partner';

        // Reset store when entering partner context (fresh data needed)
        this.store.dispatch(BondsActions.resetForContextView());
        this.store.dispatch(BondsActions.setViewMode({ mode: 'partner' }));
        this.store.dispatch(BondsActions.setActivePartner({ partnerId: this.partnerId }));
        this.store.dispatch(BondsActions.setBondsContext({
          context: {
            page: 'partner',
            partnerId: this.partnerId
          }
        }));
      } else {
        this.context = 'default';
        this.partnerId = null;
        this.customerId = null;
        contextChanged = previousContext !== 'default' && previousContext !== undefined;

        // Reset store when switching to default context from partner/customer context
        // This ensures old totals from partner/customer context don't persist
        if (contextChanged) {
          this.store.dispatch(BondsActions.resetForContextView());
        }

        this.store.dispatch(BondsActions.setViewMode({ mode: 'all' }));
        this.store.dispatch(BondsActions.setActivePartner({ partnerId: null }));
        this.store.dispatch(BondsActions.setBondsContext({
          context: {
            page: 'default'
          }
        }));
      }

      // Reinitialize everything if context actually changed (not initial load)
      if (contextChanged) {
        this.initializeStatusOptions();
        this.initializeFilterForm();
        this.setupFilterSubscriptions(); // Re-setup filter subscriptions for new form
        this.reinitializeObservablesForContext(); // Re-bind observables to correct selectors
        this.initializeTableConfig();
        this.setupDateValidation();
        this.setupHoldingsStatsSubscription(); // Re-setup stats for customer context
        this.loadBonds(); // Reload bonds for new context
      }
    });
  }

  /**
   * Initialize status options based on context
   */
  private initializeStatusOptions(): void {
    if (this.context === 'customer') {
      this.statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'matured', label: 'Matured' },
        { value: 'withdrawn', label: 'Withdrawn' }
      ];
    } else {
      this.statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'sold-out', label: 'Sold Out' },
        { value: 'pre-allocation', label: 'Pre Allocation' },
        { value: 'matured', label: 'Matured' }
      ];
    }
  }

  /**
   * Initialize filter form based on context
   */
  private initializeFilterForm(): void {
    if (this.context === 'customer') {
      this.filterForm = this.fb.group({
        partnerId: [this.partnerId || ''],
        customerId: [this.customerId || ''],
        bondId: [''],
        bondName: [''],
        status: [''],
        keyword: ['']
      });
    } else if (this.context === 'partner') {
      this.filterForm = this.fb.group({
        status: [''],
        keyword: [''],
        bondCode: [''],
        bondName: ['']
      });
    } else {
      this.filterForm = this.fb.group({
        bondName: [''],
        bondCode: [''],
        status: [''],
        defaultFiatCurrency: [''],
        issuerNameEn: [''],
        keyword: [''],
        // Date range for creation date
        creationDateStart: [''],
        creationDateEnd: [''],
        // Date range for maturity date
        maturityDateStart: [''],
        maturityDateEnd: ['']
      });
    }
  }

  /**
   * Setup date validation
   */
  private setupDateValidation(): void {
    if (this.context === 'default') {
      // Validate creation dates are not in the future
      this.validateDateNotFuture('creationDateStart');
      this.validateDateNotFuture('creationDateEnd');

      // Validate date ranges
      this.setupDateRangeValidation('creationDateStart', 'creationDateEnd');
      this.setupDateRangeValidation('maturityDateStart', 'maturityDateEnd');
    }
  }

  /**
   * Date validator - ensures date is not in the future
   */
  private validateDateNotFuture(controlName: string): void {
    const control = this.filterForm.get(controlName);
    if (control) {
      control.valueChanges.pipe(
        takeUntil(this.filterSubscriptions$)
      ).subscribe(value => {
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999); // End of today
          
          if (selectedDate > today) {
            control.setErrors({ futureDate: true });
          } else if (control.hasError('futureDate')) {
            // Clear the error if it was previously set
            const errors = { ...control.errors };
            delete errors['futureDate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      });
    }
  }

  /**
   * Setup date range validation (start date must be before end date)
   */
  private setupDateRangeValidation(startControlName: string, endControlName: string): void {
    const startControl = this.filterForm.get(startControlName);
    const endControl = this.filterForm.get(endControlName);

    if (startControl && endControl) {
      // Validate when start date changes
      startControl.valueChanges.pipe(
        takeUntil(this.filterSubscriptions$)
      ).subscribe(() => {
        this.validateDateRange(startControl, endControl);
      });

      // Validate when end date changes
      endControl.valueChanges.pipe(
        takeUntil(this.filterSubscriptions$)
      ).subscribe(() => {
        this.validateDateRange(startControl, endControl);
      });
    }
  }

  /**
   * Validate date range
   */
  private validateDateRange(startControl: any, endControl: any): void {
    const startDate = startControl.value;
    const endDate = endControl.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        endControl.setErrors({ dateRangeInvalid: true });
      } else if (endControl.hasError('dateRangeInvalid')) {
        // Clear the error if it was previously set
        const errors = { ...endControl.errors };
        delete errors['dateRangeInvalid'];
        endControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.pagination$ = this.store.select(selectPagination);

    // Select bonds based on context
    if (this.context === 'customer') {
      this.bonds$ = this.store.select(selectCustomerBonds);
    } else if (this.context === 'partner') {
      // Use partner bonds selector for partner context
      this.bonds$ = this.store.select(selectPartnerBonds);
    } else {
      // Use default bonds selector for default context
      this.bonds$ = this.store.select(selectCurrentPageBonds);
    }

    // Load partner data if in partner context
    if (this.context === 'partner' && this.partnerId) {
      this.partner$ = this.store.select(selectPartnerById(this.partnerId));

      // Load partner if not already cached
      this.store.dispatch(PartnersActions.checkAndLoadPartner({
        partnerId: this.partnerId
      }));
    }
  }

  /**
   * Reinitialize observables when context changes
   * This is needed to rebind to the correct selectors
   */
  private reinitializeObservablesForContext(): void {
    // Rebind bonds$ to correct selector based on new context
    if (this.context === 'customer') {
      this.bonds$ = this.store.select(selectCustomerBonds);
    } else if (this.context === 'partner') {
      this.bonds$ = this.store.select(selectPartnerBonds);
    } else {
      this.bonds$ = this.store.select(selectCurrentPageBonds);
    }

    // Load partner data if switching to partner context
    if (this.context === 'partner' && this.partnerId) {
      this.partner$ = this.store.select(selectPartnerById(this.partnerId));
      this.store.dispatch(PartnersActions.checkAndLoadPartner({
        partnerId: this.partnerId
      }));
    }
  }

  /**
   * Initialize table configuration
   */
  private initializeTableConfig(): void {
    this.tableConfig = {
      columns: this.getTableColumns(),
      showActions: true,
      actionsLabel: 'Actions',
      highlightOnHover: true,
      emptyMessage: 'No bonds found',
      loading: false,
      pagination: {
        pageIndex: 0,
        pageSize: 20,
        totalItems: 0,
        pageSizeOptions: [10, 20, 50, 100]
      }
    };
  }

  /**
   * Get table columns based on context
   */
  private getTableColumns(): TableColumn<Bond | PartnerBond | CustomerBondHolding>[] {
    if (this.context === 'customer') {
      return [
        {
          key: 'bondName',
          label: 'Bond Name',
          type: 'template',
          sortable: false,
          width: '280px'
        },
        {
          key: 'bondCode',
          label: 'Bond Code',
          type: 'template',
          sortable: false,
          width: '180px'
        },
        {
          key: 'partnerName',
          label: 'Partner',
          type: 'template',
          sortable: false,
          width: '220px'
        },
        {
          key: 'investmentAmount',
          label: 'Investment',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '180px'
        },
        {
          key: 'currentValue',
          label: 'Current Value',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '180px'
        },
        {
          key: 'interestEarned',
          label: 'Interest Earned',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '180px'
        },
        {
          key: 'purchaseDate',
          label: 'Purchase Date',
          type: 'template',
          sortable: false,
          width: '170px'
        },
        {
          key: 'maturityDate',
          label: 'Maturity Date',
          type: 'template',
          sortable: false,
          width: '170px'
        },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: false,
          width: '140px',
          badgeConfig: {
            colorMap: {
              'active': 'success',
              'matured': 'info',
              'withdrawn': 'default'
            }
          }
        }
      ];
    } else if (this.context === 'partner') {
      // Partner context - Full Bond objects assigned to a partner
      return [
        {
          key: 'name',
          label: 'Bond Name',
          type: 'template',
          sortable: false,
          width: '220px'
        },
        {
          key: 'code',
          label: 'Bond Code',
          type: 'template',
          sortable: false,
          width: '160px'
        },
        {
          key: 'colorCode',
          label: 'Color',
          type: 'color',
          sortable: false,
          width: '160px',
          cellRenderer: (row: Bond | PartnerBond | CustomerBondHolding) => {
            // Type guard: only Bond/PartnerBond have color fields
            if ('colorCode' in row || 'color' in row) {
              return (row as Bond).colorCode || (row as Bond).color;
            }
            return '';
          }
        },
        {
          key: 'issuerNameEn',
          label: 'Issuer',
          type: 'template',
          sortable: false,
          width: '180px'
        },
        {
          key: 'issuerType',
          label: 'Issuer Type',
          type: 'template',
          sortable: false,
          width: '140px'
        },
        {
          key: 'customerInterestRate',
          label: 'Customer Rate',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '140px'
        },
        {
          key: 'dailyCustomerEarningRate',
          label: 'Daily Rate',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '130px'
        },
        {
          key: 'currency',
          label: 'Currency',
          type: 'template',
          sortable: false,
          width: '110px'
        },
        {
          key: 'maturityDate',
          label: 'Maturity Date',
          type: 'template',
          sortable: false,
          width: '150px'
        },
        {
          key: 'rank',
          label: 'Rank',
          type: 'template',
          align: 'center',
          sortable: false,
          width: '90px'
        },
        {
          key: 'shouldBeDisplayedInApp',
          label: 'In App',
          type: 'template',
          align: 'center',
          sortable: false,
          width: '100px'
        },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: false,
          width: '120px',
          badgeConfig: {
            colorMap: {
              'active': 'success',
              'inactive': 'default',
              'matured': 'info'
            }
          }
        }
      ];
    } else {
      // Default context - show comprehensive bond information
      return [
        {
          key: 'name',
          label: 'Bond Name',
          type: 'template',
          sortable: false,
          width: '220px'
        },
        {
          key: 'code',
          label: 'Code',
          type: 'template',
          sortable: false,
          width: '140px'
        },
        {
          key: 'issuerNameEn',
          label: 'Issuer',
          type: 'template',
          sortable: false,
          width: '180px'
        },
        // {
        //   key: 'issuerType',
        //   label: 'Type',
        //   type: 'template',
        //   sortable: false,
        //   width: '120px'
        // },
        {
          key: 'amount',
          label: 'Total Amount',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '150px'
        },
        {
          key: 'amountPurchased',
          label: 'Purchased',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '150px'
        },
        {
          key: 'availableBalance',
          label: 'Available',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '150px'
        },
        {
          key: 'interestValue',
          label: 'Interest',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '110px'
        },
        {
          key: 'defaultFiatCurrency',
          label: 'Currency',
          type: 'template',
          sortable: false,
          width: '110px'
        },
        {
          key: 'lifetime',
          label: 'Lifetime',
          type: 'template',
          sortable: false,
          width: '120px'
        },
        {
          key: 'dateCreated',
          label: 'Creation Date',
          type: 'template',
          sortable: false,
          width: '150px'
        },
        {
          key: 'startDate',
          label: 'Start Date',
          type: 'template',
          sortable: false,
          width: '250px'
        },
        {
          key: 'maturityDate',
          label: 'Maturity Date',
          type: 'template',
          sortable: false,
          width: '150px'
        },
        {
          key: 'maturityPercentage',
          label: 'Progress',
          type: 'template',
          align: 'right',
          sortable: false,
          width: '120px'
        },
        // {
        //   key: 'blockchain',
        //   label: 'Blockchain',
        //   type: 'template',
        //   sortable: false,
        //   width: '130px'
        // },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: false,
          width: '120px',
          badgeConfig: {
            colorMap: {
              'active': 'success',
              'inactive': 'default',
              'matured': 'info',
              'pre-allocation': 'warning',
              'sold-out': 'error'
            }
          }
        }
      ];
    }
  }

  /**
   * Setup table subscriptions
   */
  private setupTableSubscriptions(): void {
    this.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.tableConfig = {
        ...this.tableConfig,
        loading
      };
    });

    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination && this.tableConfig.pagination) {
        this.tableConfig = {
          ...this.tableConfig,
          pagination: {
            ...this.tableConfig.pagination,
            pageIndex: pagination.currentPage - 1,
            pageSize: pagination.limit,
            totalItems: pagination.total
          }
        };
      }
    });
  }

  /**
   * Setup holdings stats subscription (customer context only)
   */
  private setupHoldingsStatsSubscription(): void {
    if (this.context === 'customer') {
      this.bonds$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(bonds => {
        const customerBonds = bonds as CustomerBondHolding[];
        this.activeHoldingsCount = customerBonds.filter(b => b.status === 'active').length;
        this.maturedHoldingsCount = customerBonds.filter(b => b.status === 'matured').length;
      });
    }
  }

  /**
   * Setup filter subscriptions
   */
  private setupFilterSubscriptions(): void {
    // Complete previous filter subscriptions if they exist
    this.filterSubscriptions$.next();
    this.filterSubscriptions$.complete();
    // Create new Subject for this set of subscriptions
    this.filterSubscriptions$ = new Subject<void>();

    // Create observable for active filters count
    this.activeFiltersCount$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(formValue => this.countActiveFilters(formValue)),
      takeUntil(this.filterSubscriptions$)
    );

    // Also update the property value
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.filterSubscriptions$)
    ).subscribe(() => {
      this.hasUnappliedFilters = true;
      // Update active filters count from local form
      this.activeFiltersCount = this.countActiveFilters(this.filterForm.value);
    });
  }

  /**
   * Load bonds based on context
   * Note: Partner/customer contexts always load fresh data (resetForContextView already called)
   * Default context uses cache-aware loading
   */
  loadBonds(): void {
    if (this.context === 'customer') {
      if (!this.partnerId || !this.customerId) {
        console.error('Customer bonds require both partnerId and customerId');
        return;
      }

      const filters: CustomerBondFilterParams = {
        partnerId: this.partnerId,
        customerId: this.customerId,
        limit: 20,
        offset: 0
      };
      // Direct load for customer context (cache already cleared in initializeContext)
      this.store.dispatch(BondsActions.loadCustomerBonds({ filters }));
    } else if (this.context === 'partner') {
      if (!this.partnerId) {
        console.error('Partner bonds require partnerId');
        return;
      }

      const filters: PartnerBondFilterParams = {
        partnerId: this.partnerId,
        limit: 20,
        offset: 0
      };
      // Direct load for partner context (cache already cleared in initializeContext)
      this.store.dispatch(BondsActions.loadPartnerBonds({ filters }));
    } else {
      const filters: BondFilterParams = {
        limit: 20,
        offset: 0
      };
      // Use cache-aware action for default context
      this.store.dispatch(BondsActions.checkAndLoadBonds({ filters }));
    }
  }

  /**
   * Apply filters
   * Note: When filters change, we want fresh data (bypass cache)
   */
  applyFilters(): void {
    const formValue = this.filterForm.value;

    if (this.context === 'customer') {
      if (!this.partnerId || !this.customerId) {
        console.error('Customer bonds require both partnerId and customerId');
        return;
      }

      const filters: CustomerBondFilterParams = {
        partnerId: this.partnerId,
        customerId: this.customerId,
        ...formValue,
        limit: 20,
        offset: 0
      };
      // Load filtered data directly (filters managed locally)
      this.store.dispatch(BondsActions.loadCustomerBonds({ filters }));
    } else if (this.context === 'partner') {
      if (!this.partnerId) {
        console.error('Partner bonds require partnerId');
        return;
      }

      const filters: PartnerBondFilterParams = {
        partnerId: this.partnerId,
        ...formValue,
        limit: 20,
        offset: 0
      };
      // Load filtered data directly (filters managed locally)
      this.store.dispatch(BondsActions.loadPartnerBonds({ filters }));
    } else {
      const filters: BondFilterParams = {
        ...formValue,
        fiatCurrency: formValue.defaultFiatCurrency, // Map to correct filter parameter name
        startDate: this.formatDateForApi(formValue.creationDateStart) as any,
        endDate: this.formatDateForApi(formValue.creationDateEnd) as any,
        startMaturityDate: this.formatDateForApi(formValue.maturityDateStart) as any,
        endMaturityDate: this.formatDateForApi(formValue.maturityDateEnd) as any,
        limit: 20,
        offset: 0
      };

      // Remove the incorrectly named field and undefined/null date fields
      delete (filters as any).defaultFiatCurrency;
      delete (filters as any).creationDateStart;
      delete (filters as any).creationDateEnd;
      delete (filters as any).maturityDateStart;
      delete (filters as any).maturityDateEnd;

      // Remove null date values
      if (!filters.startDate) delete (filters as any).startDate;
      if (!filters.endDate) delete (filters as any).endDate;
      if (!filters.startMaturityDate) delete (filters as any).startMaturityDate;
      if (!filters.endMaturityDate) delete (filters as any).endMaturityDate;

      // Load filtered data directly (filters managed locally)
      this.store.dispatch(BondsActions.loadBonds({ filters }));
    }

    this.hasUnappliedFilters = false;
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    // Reset the form UI
    this.filterForm.reset();

    // Restore context-specific required values
    if (this.context === 'customer') {
      this.filterForm.patchValue({
        partnerId: this.partnerId,
        customerId: this.customerId
      });
    }

    // Reload bonds with empty filters
    this.loadBonds();
    this.hasUnappliedFilters = false;
    this.activeFiltersCount = 0;
  }

  /**
   * Count active filters from form values
   */
  private countActiveFilters(formValue: any): number {
    let count = 0;
    const excludeKeys = ['partnerId', 'customerId'];

    Object.keys(formValue).forEach(key => {
      if (!excludeKeys.includes(key) && formValue[key] !== null && formValue[key] !== '' && formValue[key] !== undefined) {
        // Don't count end dates separately if they're part of a range
        if (key === 'creationDateEnd' || key === 'maturityDateEnd') {
          return;
        }
        count++;
      }
    });

    return count;
  }

  /**
   * Toggle filters collapse/expand
   */
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  /**
   * Toggle filter panel (offcanvas)
   */
  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  /**
   * Close filter panel (offcanvas)
   */
  closeFilterPanel(): void {
    this.filterPanelOpen = false;
  }

  /**
   * Get active filters count for template
   */
  getActiveFiltersCount(): number {
    return this.activeFiltersCount;
  }

  /**
   * Apply filters and close the offcanvas panel
   */
  applyFiltersAndClose(): void {
    this.applyFilters();
    this.closeFilterPanel();
  }

  /**
   * Navigate back to partner profile
   */
  goBack(): void {
    if (this.partnerId) {
      this.router.navigate(['/partners/details', this.partnerId]);
    } else {
      this.router.navigate(['/bonds']);
    }
  }

  /**
   * Navigate to all bonds (default context)
   * Force component destruction and recreation by navigating away first
   */
  viewAllBonds(): void {
    // Reset state
    this.store.dispatch(BondsActions.resetForContextView());

    // Force component destruction by navigating to a dummy route then back
    // This ensures clean state when switching from partner/customer context to default
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/bonds']);
    });
  }

  /**
   * Navigate to add bond
   */
  addBond(): void {
    this.router.navigate(['/bonds/add-bond']);
  }

  /**
   * View bond details
   */
  viewBond(bond: Bond | CustomerBondHolding): void {
    const bondId = 'bondId' in bond ? bond.bondId : bond.id;
    this.router.navigate(['/bonds/details', bondId]);
  }

  /**
   * Open assign bonds modal (Partner context)
   * Uses PartnersActions.assignBonds
   */
  openAssignBondsModal(): void {
    if (!this.partnerId) return;

    const dialogRef = this.dialog.open(AssignBondsModal, {
      width: '700px',
      maxWidth: '90vw',
      data: { partnerId: this.partnerId },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.bondsAssigned) {
        // Reload partner bonds after assignment
        this.loadBonds();
      }
    });
  }

  /**
   * Unassign bond from partner
   * Uses PartnersActions.removeBonds
   */
  unassignBond(bond: Bond): void {
    if (!this.partnerId) return;

    const dialogRef = this.dialog.open(ConfirmBondsModal, {
      width: '450px',
      data: {
        title: 'Unassign Bond',
        message: `Are you sure you want to unassign "${bond.name}" from this partner?`,
        confirmText: 'Unassign',
        cancelText: 'Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Use PartnersActions.removeBonds (not BondsActions)
        const removeBondsData: RemoveBondsRequest = {
          bondIds: [bond.id]
        };

        this.store.dispatch(PartnersActions.removeBonds({
          partnerId: this.partnerId!,
          bondsData: removeBondsData
        }));

        // Optionally reload bonds after successful removal
        // You might want to listen to PartnersActions.removeBondsSuccess instead
        setTimeout(() => {
          this.loadBonds();
        }, 1000);
      }
    });
  }

  /**
   * Delete bond (Default context only)
   * Uses BondsActions.deleteBond
   */
  deleteBond(bond: Bond): void {
    const dialogRef = this.dialog.open(ConfirmBondsModal, {
      width: '450px',
      data: {
        title: 'Delete Bond',
        message: `Are you sure you want to delete "${bond.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Use BondsActions.deleteBond
        this.store.dispatch(BondsActions.deleteBond({ bondId: bond.id }));

        // Optionally reload bonds after successful deletion
        setTimeout(() => {
          this.loadBonds();
        }, 1000);
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: TablePageEvent): void {
    const currentPageSize = this.tableConfig.pagination?.pageSize || 20;

    if (event.pageSize !== currentPageSize) {
      this.store.dispatch(BondsActions.changePageSize({ limit: event.pageSize }));
    } else {
      this.store.dispatch(BondsActions.changePage({ 
        offset: event.pageIndex * event.pageSize 
      }));
    }
  }

  /**
   * Handle sort change
   */
  onSortChange(event: TableSortEvent): void {
    console.log('Sort changed:', event);
    // TODO: Implement sorting
  }

  // Helper methods for templates
  getInitials(name: string): string {
    if (!name) return 'B';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatCurrency(amount: number, currency: string = 'XAF'): string {
    if (!amount) return `${currency} 0`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount).replace(currency, `${currency} `);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Format date for API - converts Date object to DD/MM/YYYY format
   */
  private formatDateForApi(date: Date | string | null): string | null {
    if (!date) return null;

    const dateObj = date instanceof Date ? date : new Date(date);

    // Ensure valid date
    if (isNaN(dateObj.getTime())) return null;

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = dateObj.getFullYear();

    return `${year}-${month}-${day}`;
  }

  formatPercentage(value: number): string {
    return `${value}%`;
  }

  formatTenor(months: number): string {
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${years}y ${remainingMonths}m`;
  }

  formatLifetime(days: number): string {
    if (!days) return '-';

    if (days < 30) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      const months = Math.floor(remainingDays / 30);

      if (months === 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}`;
      }
      return `${years}y ${months}m`;
    }
  }

}