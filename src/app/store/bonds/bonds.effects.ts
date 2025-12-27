// src/app/store/bonds/bonds.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BondsService } from '@core/services/bonds/bonds.service';
import { BondsMockService } from '@core/services/bonds/bonds-mock.service';
import { BondsActions } from './bonds.actions';
import {
  selectViewMode,
  selectActivePartnerId,
  selectIsPageCached,
  selectIsBondCached,
  selectLimit,
  selectOffset
} from './bonds.state';
import { catchError, map, switchMap, withLatestFrom, tap, filter, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * Bonds Effects
 */
@Injectable()
export class BondsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private bondsService = inject(BondsService);
  private bondsMockService = inject(BondsMockService);

  // Get the appropriate service based on environment flag
  private get service() {
    return environment.gimacTbB2B.useMockData ? this.bondsMockService : this.bondsService;
  }

  /**
   * Load All Bonds (Admin)
   */
  loadBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.loadBonds),
      switchMap(({ filters }) => {
        return this.service.getBonds(filters).pipe(
          map(response => BondsActions.loadBondsSuccess({
            bonds: response.bonds,
            total: response.total,
            limit: response.limit,
            offset: response.offset
          })),
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
        return this.service.getBondById(bondId).pipe(
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
   * Check cache and load single bond only if not cached or force reload
   */
  checkAndLoadBond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.checkAndLoadBond),
      switchMap(({ bondId, forceReload }) => {
        return this.store.select(selectIsBondCached(bondId)).pipe(
          map(isCached => {
            // Load if not cached or force reload requested
            if (!isCached || forceReload) {
              return BondsActions.loadBond({ bondId });
            }
            // Already cached, no action needed
            return { type: '[Bonds] Bond Already Cached' };
          })
        );
      })
    )
  );

  /**
   * Check cache and load bonds list - only fetch if page not cached
   */
  checkAndLoadBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.checkAndLoadBonds),
      withLatestFrom(
        this.store.select(selectLimit),
        this.store.select(selectOffset)
      ),
      switchMap(([{ filters }, limit, offset]) => {
        const pageNumber = Math.floor(offset / limit) + 1;

        return this.store.select(selectIsPageCached(pageNumber)).pipe(
          map(isCached => {
            // Load if page not cached
            if (!isCached) {
              return BondsActions.loadBonds({ filters });
            }
            // Already cached, no action needed
            return { type: '[Bonds] Page Already Cached' };
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
        return this.service.createBond(bondData).pipe(
          map(response => BondsActions.createBondSuccess({ message: response.message })),
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
        return this.service.updateBond(bondId, bondData).pipe(
          map(response => BondsActions.updateBondSuccess({ bondId, message: response.message })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to update bond';
            return of(BondsActions.updateBondFailure({ bondId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Reload After Bond Update Success
   * After updating a bond, reload the bond entity and the bonds list
   */
  reloadAfterUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.updateBondSuccess),
      mergeMap(({ bondId }) => [
        BondsActions.loadBond({ bondId }), // Reload the updated bond entity
        BondsActions.resetState() // Clear bonds cache to force refresh on next load
      ])
    )
  );

  /**
   * Delete Bond
   */
  deleteBond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BondsActions.deleteBond),
      switchMap(({ bondId }) => {
        return this.service.deleteBond(bondId).pipe(
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
        return this.service.getPartnerBonds(filters).pipe(
          map(response => BondsActions.loadPartnerBondsSuccess({
            partnerId: filters.partnerId,
            bonds: response.bonds,
            total: response.total,
            limit: response.limit,
            offset: response.offset
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
        return this.service.getCustomerBonds(filters).pipe(
          map(response => BondsActions.loadCustomerBondsSuccess({
            customerBonds: response.customerBonds,
            total: response.total,
            limit: response.limit,
            offset: response.offset
          })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load customer bonds';
            return of(BondsActions.loadCustomerBondsFailure({ error: errorMessage }));
          })
        );
      })
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