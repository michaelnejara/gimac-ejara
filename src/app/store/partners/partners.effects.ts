// src/app/store/partners/partners.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { PartnersService } from '@core/services/partners/partners.service';
import { PartnersActions } from './partners.actions';
import { DashboardActions } from '@store/dashboard/dashboard.actions';
import {
  selectIsPageCached,
  selectIsPartnerCached,
  selectLimit,
  selectOffset
} from './partners.state';
import { catchError, map, switchMap, withLatestFrom, tap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PartnersMockService } from '@core/services/partners/partners-mock.service';
import { environment } from '@environments/environment';

/**
 * Partners Effects
 */
@Injectable()
export class PartnersEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private partnersService = inject(PartnersService);

  private mockPartnersService = inject(PartnersMockService);
  private useMockData = environment.gimacTbB2B.useMockData;

  /**
   * Load Partners List
   */
  loadPartners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.loadPartners),
      switchMap(({ filters }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.getPartners(filters)
          : this.partnersService.getPartners(filters);

        return source$.pipe(
          map(response => PartnersActions.loadPartnersSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load partners';
            return of(PartnersActions.loadPartnersFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Load Single Partner
   */
  loadPartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.loadPartner),
      switchMap(({ partnerId }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.getPartnerById(partnerId)
          : this.partnersService.getPartnerById(partnerId);

        return source$.pipe(
          map(response => PartnersActions.loadPartnerSuccess({ partner: response.data })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load partner';
            return of(PartnersActions.loadPartnerFailure({ partnerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Check cache and load single partner only if not cached or force reload
   */
  checkAndLoadPartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.checkAndLoadPartner),
      switchMap(({ partnerId, forceReload }) => {
        return this.store.select(selectIsPartnerCached(partnerId)).pipe(
          map(isCached => {
            // Load if not cached or force reload requested
            if (!isCached || forceReload) {
              return PartnersActions.loadPartner({ partnerId });
            }
            // Already cached, no action needed
            return { type: '[Partners] Partner Already Cached' };
          })
        );
      })
    )
  );

  /**
   * Check cache and load partners list - only fetch if page not cached
   */
  checkAndLoadPartners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.checkAndLoadPartners),
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
              return PartnersActions.loadPartners({ filters });
            }
            // Already cached, no action needed
            return { type: '[Partners] Page Already Cached' };
          })
        );
      })
    )
  );

  /**
   * Create Partner
   */
  createPartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.createPartner),
      switchMap(({ partnerData }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.createPartner(partnerData)
          : this.partnersService.createPartner(partnerData);

        return source$.pipe(
          map(response => PartnersActions.createPartnerSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to create partner';
            return of(PartnersActions.createPartnerFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Update Partner
   */
  updatePartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.updatePartner),
      switchMap(({ partnerId, partnerData }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.updatePartner(partnerId, partnerData)
          : this.partnersService.updatePartner(partnerId, partnerData);

        return source$.pipe(
          map(response => PartnersActions.updatePartnerSuccess({ response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to update partner';
            return of(PartnersActions.updatePartnerFailure({ partnerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Update Partner Status
   */
  updatePartnerStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.updatePartnerStatus),
      switchMap(({ partnerId, status }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.updatePartnerStatus(partnerId, status)
          : this.partnersService.updatePartnerStatus(partnerId, status);

        return source$.pipe(
          map(response => PartnersActions.updatePartnerStatusSuccess({
            partnerId,
            response
          })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to update partner status';
            return of(PartnersActions.updatePartnerStatusFailure({ partnerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Delete Partner
   */
  deletePartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.deletePartner),
      switchMap(({ partnerId }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.deletePartner(partnerId)
          : this.partnersService.deletePartner(partnerId);

        return this.partnersService.deletePartner(partnerId).pipe(
          map(() => PartnersActions.deletePartnerSuccess({ partnerId })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to delete partner';
            return of(PartnersActions.deletePartnerFailure({ partnerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Clear Filters Effect - Like dashboard implementation
   * Reloads partners list with empty filters when clearFilters is dispatched
   */
  clearFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.clearFilters),
      map(() => PartnersActions.loadPartners({ filters: {} }))
    )
  );

  /**
   * After Create Partner Success - Update Dashboard and Invalidate Partner Cache
   * Dispatches multiple actions to refresh both dashboard stats and partner list
   */
  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.createPartnerSuccess),
      mergeMap(() => [
        DashboardActions.loadStats({}), // Reload dashboard to reflect new partner count
        PartnersActions.resetState() // Clear partner cache to force fresh data on next load
      ])
    )
  );

  /**
   * After Status Update Success - Reload Dashboard and Invalidate Partner Cache
   */
  reloadAfterStatusUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.updatePartnerStatusSuccess),
      mergeMap(() => [
        DashboardActions.loadStats({}), // Reload dashboard to reflect status change
        PartnersActions.resetState() // Clear partner cache
      ])
    )
  );

  /**
   * Log Errors
   */
  logErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PartnersActions.loadPartnersFailure,
          PartnersActions.loadPartnerFailure,
          PartnersActions.createPartnerFailure,
          PartnersActions.updatePartnerFailure,
          PartnersActions.updatePartnerStatusFailure,
          PartnersActions.deletePartnerFailure
        ),
        tap(({ error }) => console.error('Partners error:', error))
      ),
    { dispatch: false }
  );

  /**
 * Assign Bonds to Partner
 */
  assignBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.assignBonds),
      switchMap(({ partnerId, bondsData }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.assignBonds(partnerId, bondsData)
          : this.partnersService.assignBonds(partnerId, bondsData);

        return source$.pipe(
          map(response => PartnersActions.assignBondsSuccess({ partnerId, response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to assign bonds';
            return of(PartnersActions.assignBondsFailure({ partnerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Remove Bonds from Partner
   */
  removeBonds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.removeBonds),
      switchMap(({ partnerId, bondsData }) => {
        // Select appropriate service based on environment
        const source$ = this.useMockData
          ? this.mockPartnersService.removeBonds(partnerId, bondsData)
          : this.partnersService.removeBonds(partnerId, bondsData);

        return source$.pipe(
          map(response => PartnersActions.removeBondsSuccess({ partnerId, response })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to remove bonds';
            return of(PartnersActions.removeBondsFailure({ partnerId, error: errorMessage }));
          })
        );
      })
    )
  );

  /**
   * Reload Partner After Bond Assignment
   */
  reloadAfterBondAssignment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PartnersActions.assignBondsSuccess,
        PartnersActions.removeBondsSuccess
      ),
      map(({ partnerId }) => PartnersActions.loadPartner({ partnerId }))
    )
  );
}