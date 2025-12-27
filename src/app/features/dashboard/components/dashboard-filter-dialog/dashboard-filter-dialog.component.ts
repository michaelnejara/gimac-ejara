import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs';

import { DashboardFilterParams } from '@core/models/dashboard.models';
import { PartnersService } from '@core/services/partners/partners.service';
import { Partner } from '@core/models/partner.models';

@Component({
  selector: 'app-dashboard-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dashboard-filter-dialog.component.html',
  styleUrl: './dashboard-filter-dialog.component.scss'
})
export class DashboardFilterDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DashboardFilterDialogComponent>);
  private partnersService = inject(PartnersService);

  filterForm!: FormGroup;
  filteredPartners$!: Observable<Partner[]>;
  selectedPartner: Partner | null = null;
  maxDate: Date = new Date(); // Restrict to current date

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      }),
      partnerSearch: ['']
    });

    // Setup partner autocomplete
    this.filteredPartners$ = this.filterForm.get('partnerSearch')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const searchTerm = typeof value === 'string' ? value : value?.name || '';
        return this.searchPartners(searchTerm);
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Search partners by name
   */
  private searchPartners(searchTerm: string): Observable<Partner[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return this.partnersService.getPartners({ limit: 20, offset: 0 }).pipe(
        switchMap(response => of(response.data || []))
      );
    }

    return this.partnersService.getPartners({
      limit: 20,
      offset: 0,
      keyword: searchTerm
    }).pipe(
      switchMap(response => of(response.data || []))
    );
  }

  /**
   * Display function for partner autocomplete
   */
  displayPartner(partner: Partner): string {
    return partner ? partner.name : '';
  }

  /**
   * Handle partner selection
   */
  onPartnerSelected(partner: Partner): void {
    this.selectedPartner = partner;
  }

  /**
   * Clear selected partner
   */
  clearPartner(): void {
    this.selectedPartner = null;
    this.filterForm.get('partnerSearch')?.setValue('');
  }

  /**
   * Apply filters and close dialog
   */
  applyFilters(): void {
    const dateRange = this.filterForm.get('dateRange')?.value;
    const filters: DashboardFilterParams = {};

    // Add date filters
    if (dateRange?.start) {
      filters.startDate = dateRange.start.toISOString().split('T')[0];
    }
    if (dateRange?.end) {
      filters.endDate = dateRange.end.toISOString().split('T')[0];
    }

    // Add partner filter
    if (this.selectedPartner) {
      filters.partnerId = this.selectedPartner.id.toString();
      filters.partnerName = this.selectedPartner.name;
    }

    this.dialogRef.close(filters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.selectedPartner = null;
  }

  /**
   * Close dialog without applying
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Check if any filter is set
   */
  hasFilters(): boolean {
    const dateRange = this.filterForm.get('dateRange')?.value;
    return !!(dateRange?.start || dateRange?.end || this.selectedPartner);
  }
}
