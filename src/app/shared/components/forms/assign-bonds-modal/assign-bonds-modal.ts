// src/app/features/bonds/components/assign-bonds-modal/assign-bonds-modal.component.ts
import { Component, inject, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// Store
import { BondsActions } from '@store/bonds/bonds.actions';
import { PartnersActions } from '@store/partners/partners.actions';
import { selectAllBonds, selectLoading } from '@store/bonds/bonds.state';

// Models
import { Bond } from '@core/models/bond.models';
import { AssignBondsRequest } from '@core/models/partner.models';

export interface AssignBondsData {
  partnerId: number;
  partnerName?: string;
  alreadyAssignedBondIds?: number[];
}

@Component({
  selector: 'app-assign-bonds-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './assign-bonds-modal.html',
  styleUrl: './assign-bonds-modal.scss'
})
export class AssignBondsModal implements OnInit, OnDestroy {
  private store = inject(Store);
  private dialogRef = inject(MatDialogRef<AssignBondsModal>);
  private destroy$ = new Subject<void>();

  // Observables
  allBonds$!: Observable<Bond[]>;
  loading$!: Observable<boolean>;

  // Filter and Search
  searchControl = new FormControl('');
  filteredBonds: Bond[] = [];
  availableBonds: Bond[] = [];

  // Selection
  selectedBondIds: Set<number> = new Set();
  submitting = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AssignBondsData) {}

  ngOnInit(): void {
    // Load all bonds
    this.store.dispatch(BondsActions.loadBonds({ 
      filters: { limit: 1000, offset: 0 } 
    }));

    // Initialize observables
    this.allBonds$ = this.store.select(selectAllBonds);
    this.loading$ = this.store.select(selectLoading);

    // Subscribe to bonds
    this.allBonds$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(bonds => {
      // Filter out already assigned bonds
      const alreadyAssignedIds = this.data.alreadyAssignedBondIds || [];
      this.availableBonds = bonds.filter(
        bond => !alreadyAssignedIds.includes(bond.id) && bond.status === 'active'
      );
      this.filteredBonds = [...this.availableBonds];
    });

    // Setup search
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterBonds(searchTerm || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Filter bonds based on search term
   */
  private filterBonds(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredBonds = [...this.availableBonds];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredBonds = this.availableBonds.filter(bond =>
      bond.name.toLowerCase().includes(term) ||
      bond.code.toLowerCase().includes(term) ||
      bond.issuerNameEn.toLowerCase().includes(term) ||
      bond.issuerNameFr.toLowerCase().includes(term)
    );
  }

  /**
   * Toggle bond selection
   */
  toggleBondSelection(bondId: number): void {
    if (this.selectedBondIds.has(bondId)) {
      this.selectedBondIds.delete(bondId);
    } else {
      this.selectedBondIds.add(bondId);
    }
  }

  /**
   * Check if bond is selected
   */
  isBondSelected(bondId: number): boolean {
    return this.selectedBondIds.has(bondId);
  }

  /**
   * Select all filtered bonds
   */
  selectAll(): void {
    this.filteredBonds.forEach(bond => {
      this.selectedBondIds.add(bond.id);
    });
  }

  /**
   * Deselect all bonds
   */
  deselectAll(): void {
    this.selectedBondIds.clear();
  }

  /**
   * Get selected count
   */
  get selectedCount(): number {
    return this.selectedBondIds.size;
  }

  /**
   * Check if all filtered bonds are selected
   */
  get allFilteredSelected(): boolean {
    if (this.filteredBonds.length === 0) return false;
    return this.filteredBonds.every(bond => this.selectedBondIds.has(bond.id));
  }

  /**
   * Check if some (but not all) filtered bonds are selected
   */
  get someFilteredSelected(): boolean {
    if (this.filteredBonds.length === 0) return false;
    const selectedInFiltered = this.filteredBonds.filter(bond => 
      this.selectedBondIds.has(bond.id)
    ).length;
    return selectedInFiltered > 0 && selectedInFiltered < this.filteredBonds.length;
  }

  /**
   * Toggle all filtered bonds
   */
  toggleAllFiltered(): void {
    if (this.allFilteredSelected) {
      this.filteredBonds.forEach(bond => {
        this.selectedBondIds.delete(bond.id);
      });
    } else {
      this.filteredBonds.forEach(bond => {
        this.selectedBondIds.add(bond.id);
      });
    }
  }

  /**
   * Assign selected bonds to partner
   */
  assignBonds(): void {
    if (this.selectedBondIds.size === 0 || this.submitting) {
      return;
    }

    this.submitting = true;

    const assignRequest: AssignBondsRequest = {
      bondIds: Array.from(this.selectedBondIds)
    };

    // Dispatch PartnersActions.assignBonds
    this.store.dispatch(PartnersActions.assignBonds({
      partnerId: this.data.partnerId,
      bondsData: assignRequest
    }));

    // Close modal after a delay
    // In production, listen to success/failure actions
    setTimeout(() => {
      this.submitting = false;
      this.dialogRef.close({ 
        bondsAssigned: true, 
        bondIds: Array.from(this.selectedBondIds) 
      });
    }, 1000);
  }

  /**
   * Cancel and close modal
   */
  cancel(): void {
    this.dialogRef.close({ bondsAssigned: false });
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string): string {
    if (!amount) return `${currency} 0`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount).replace(currency, `${currency} `);
  }

  /**
   * Format lifetime (in days) to human-readable format
   */
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

  /**
   * Get bond status class
   */
  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      active: 'status-active',
      inactive: 'status-inactive',
      matured: 'status-matured'
    };
    return statusClasses[status] || '';
  }
}