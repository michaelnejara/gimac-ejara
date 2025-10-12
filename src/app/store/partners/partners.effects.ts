// src/app/store/partners/partners.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { PartnersService } from '@core/services/partners.service';
import { PartnersActions } from './partners.actions';
import { selectFilters } from './partners.state';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Partners Effects
 */
@Injectable()
export class PartnersEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private partnersService = inject(PartnersService);

  /**
   * Load Partners List
   */
  loadPartners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.loadPartners),
      switchMap(({ filters }) => {
        return this.partnersService.getPartners(filters).pipe(
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
        return this.partnersService.getPartnerById(partnerId).pipe(
          map(partner => PartnersActions.loadPartnerSuccess({ partner })),
          catchError(error => {
            const errorMessage = error?.error?.message || 'Failed to load partner';
            return of(PartnersActions.loadPartnerFailure({ partnerId, error: errorMessage }));
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
        return this.partnersService.createPartner(partnerData).pipe(
          map(partner => PartnersActions.createPartnerSuccess({ partner })),
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
        return this.partnersService.updatePartner(partnerId, partnerData).pipe(
          map(partner => PartnersActions.updatePartnerSuccess({ partner })),
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
        return this.partnersService.updatePartnerStatus(partnerId, status).pipe(
          map(response => PartnersActions.updatePartnerStatusSuccess({
            partnerId,
            status: response.data.status,
            updatedAt: response.data.updatedAt
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
   * Apply Filters - Reload Partners
   */
  applyFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.applyFilters),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
    )
  );

  /**
   * Clear Filters - Reload Partners
   */
  clearFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.clearFilters),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
    )
  );

  /**
   * Set Search Keyword - Reload Partners
   */
  setSearchKeyword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.setSearchKeyword),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
    )
  );

  /**
   * Change Page - Reload Partners
   */
  changePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.changePage),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
    )
  );

  /**
   * Change Page Size - Reload Partners
   */
  changePageSize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.changePageSize),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
    )
  );

  /**
   * Reload List After Create Success
   */
  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.createPartnerSuccess),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
    )
  );

  /**
   * Reload List After Status Update
   */
  reloadAfterStatusUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnersActions.updatePartnerStatusSuccess),
      withLatestFrom(this.store.select(selectFilters)),
      map(([_, filters]) => PartnersActions.loadPartners({ filters }))
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
        return this.partnersService.assignBonds(partnerId, bondsData).pipe(
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
        return this.partnersService.removeBonds(partnerId, bondsData).pipe(
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