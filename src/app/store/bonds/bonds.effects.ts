// src/app/store/bonds/bonds.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BondsService } from '@core/services/bonds/bonds.service';
import { BondsActions } from './bonds.actions';
import { selectFilters, selectViewMode, selectActivePartnerId } from './bonds.state';
import { catchError, map, switchMap, withLatestFrom, tap, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';
import { BondsMockService } from '@core/services/bonds/bonds-mock.service';

/**
 * Bonds Effects
 */
@Injectable()
export class BondsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private bondsService = inject(BondsService);

  private mockBondsService = inject(BondsMockService);
  private useMockData = environment.gimacTbB2B.useMockData;

  /**
   * Load All Bonds (Admin)
   */
  loadBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.loadBonds),
      switchMap(({ filters }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.getBonds(filters)
          : this.bondsService.getBonds(filters);

        return source$.pipe(
          map(response => BondsActions.loadBondsSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load bonds';
            return of(BondsActions.loadBondsFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Load Single Bond
   */
  loadBond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.loadBond),
      switchMap(({ bondId }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.getBondById(bondId)
          : this.bondsService.getBondById(bondId);

        return source$.pipe(
          map(bond => BondsActions.loadBondSuccess({ bond })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load bond';
            return of(BondsActions.loadBondFailure({ bondId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Create Bond
   */
  createBond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.createBond),
      switchMap(({ bondData }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.createBond(bondData)
          : this.bondsService.createBond(bondData);

        return source$.pipe(
          map(bond => BondsActions.createBondSuccess({ bond })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to create bond';
            return of(BondsActions.createBondFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Update Bond
   */
  updateBond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.updateBond),
      switchMap(({ bondId, bondData }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.updateBond(bondId, bondData)
          : this.bondsService.updateBond(bondId, bondData);

        return source$.pipe(
          map(bond => BondsActions.updateBondSuccess({ bond })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to update bond';
            return of(BondsActions.updateBondFailure({ bondId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Delete Bond
   */
  deleteBond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.deleteBond),
      switchMap(({ bondId }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.deleteBond(bondId)
          : this.bondsService.deleteBond(bondId);

        return source$.pipe(
          map(() => BondsActions.deleteBondSuccess({ bondId })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to delete bond';
            return of(BondsActions.deleteBondFailure({ bondId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Load Partner Bonds
   */
  loadPartnerBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.loadPartnerBonds),
      switchMap(({ filters }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.getPartnerBonds(filters)
          : this.bondsService.getPartnerBonds(filters);

        return this.bondsService.getPartnerBonds(filters).pipe(
          map(response => BondsActions.loadPartnerBondsSuccess({ 
            partnerId: filters.partnerId,
            response 
          })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load partner bonds';
            return of(BondsActions.loadPartnerBondsFailure({ 
              partnerId: filters.partnerId,
              error: errorMessage 
            }));
          })
        );
      })
    )
  );

  /**
   * Load Customer Bonds
   */
  loadCustomerBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.loadCustomerBonds),
      switchMap(({ filters }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockBondsService.getCustomerBonds(filters)
          : this.bondsService.getCustomerBonds(filters);

        return source$.pipe(
          map(response => BondsActions.loadCustomerBondsSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load customer bonds';
            return of(BondsActions.loadCustomerBondsFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Apply Filters - Reload Based on View Mode
   */
  applyFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.applyFilters),
      withLatestFrom(
        this.store.select(selectFilters),
        this.store.select(selectViewMode),
        this.store.select(selectActivePartnerId)
      ),
      switchMap(([_, filters, viewMode, partnerId]) => {
        if (viewMode === 'partner' && partnerId) {
          return of(BondsActions.loadPartnerBonds({ 
            filters: {
              partnerId,
              ...filters
            }
          }));
        } else if (viewMode === 'customer') {
          return of(BondsActions.loadCustomerBonds({ filters: filters as any }));
        } else {
          return of(BondsActions.loadBonds({ filters }));
        }
      })
    )
  );

  /**
   * Clear Filters - Reload Based on View Mode
   */
  clearFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.clearFilters),
      withLatestFrom(
        this.store.select(selectFilters),
        this.store.select(selectViewMode),
        this.store.select(selectActivePartnerId)
      ),
      switchMap(([_, filters, viewMode, partnerId]) => {
        if (viewMode === 'partner' && partnerId) {
          return of(BondsActions.loadPartnerBonds({ 
            filters: {
              partnerId,
              ...filters
            }
          }));
        } else if (viewMode === 'customer') {
          return of(BondsActions.loadCustomerBonds({ filters: filters as any }));
        } else {
          return of(BondsActions.loadBonds({ filters }));
        }
      })
    )
  );

  /**
   * Set Search Keyword - Reload Based on View Mode
   */
  setSearchKeyword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.setSearchKeyword),
      withLatestFrom(
        this.store.select(selectFilters),
        this.store.select(selectViewMode),
        this.store.select(selectActivePartnerId)
      ),
      switchMap(([_, filters, viewMode, partnerId]) => {
        if (viewMode === 'partner' && partnerId) {
          return of(BondsActions.loadPartnerBonds({ 
            filters: {
              partnerId,
              ...filters
            }
          }));
        } else if (viewMode === 'customer') {
          return of(BondsActions.loadCustomerBonds({ filters: filters as any }));
        } else {
          return of(BondsActions.loadBonds({ filters }));
        }
      })
    )
  );

  /**
   * Change Page - Reload Based on View Mode
   */
  changePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.changePage),
      withLatestFrom(
        this.store.select(selectFilters),
        this.store.select(selectViewMode),
        this.store.select(selectActivePartnerId)
      ),
      switchMap(([_, filters, viewMode, partnerId]) => {
        if (viewMode === 'partner' && partnerId) {
          return of(BondsActions.loadPartnerBonds({ 
            filters: {
              partnerId,
              ...filters
            }
          }));
        } else if (viewMode === 'customer') {
          return of(BondsActions.loadCustomerBonds({ filters: filters as any }));
        } else {
          return of(BondsActions.loadBonds({ filters }));
        }
      })
    )
  );

  /**
   * Change Page Size - Reload Based on View Mode
   */
  changePageSize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.changePageSize),
      withLatestFrom(
        this.store.select(selectFilters),
        this.store.select(selectViewMode),
        this.store.select(selectActivePartnerId)
      ),
      switchMap(([_, filters, viewMode, partnerId]) => {
        if (viewMode === 'partner' && partnerId) {
          return of(BondsActions.loadPartnerBonds({ 
            filters: {
              partnerId,
              ...filters
            }
          }));
        } else if (viewMode === 'customer') {
          return of(BondsActions.loadCustomerBonds({ filters: filters as any }));
        } else {
          return of(BondsActions.loadBonds({ filters }));
        }
      })
    )
  );

  /**
   * Reload List After Create Success
   */
  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.createBondSuccess),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondsActions.loadBonds({ filters }))
    )
  );

  /**
   * Reload List After Update Success
   */
  reloadAfterUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.updateBondSuccess),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => BondsActions.loadBonds({ filters }))
    )
  );

  /**
   * Log Errors
   */
  logErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BondsActions.loadBondsFailure,
          BondsActions.loadBondFailure,
          BondsActions.createBondFailure,
          BondsActions.updateBondFailure,
          BondsActions.deleteBondFailure,
          BondsActions.loadPartnerBondsFailure,
          BondsActions.loadCustomerBondsFailure
        ),
        tap(({ error }) => console.error('Bonds error:', error))
      ),
    { dispatch: false }
  );
}