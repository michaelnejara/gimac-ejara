// src/app/store/bonds/bonds.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  Bond,
  PartnerBond,
  CreateBondRequest,
  UpdateBondRequest,
  BondFilterParams,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  CustomerBondHolding
} from '@core/models/bond.models';
import { BondsContext } from './bonds.state';

/**
 * Bonds Actions
 */
export const BondsActions = createActionGroup({
  source: 'Bonds',
  events: {
    // Load All Bonds (Admin)
    'Load Bonds': props<{ filters?: BondFilterParams }>(),
    'Load Bonds Success': props<{
      bonds: Bond[];
      total: number;
      limit: number;
      offset: number;
    }>(),
    'Load Bonds Failure': props<{ error: string }>(),

    // Load Single Bond
    'Load Bond': props<{ bondId: number }>(),
    'Load Bond Success': props<{ bond: Bond }>(),
    'Load Bond Failure': props<{ bondId: number; error: string }>(),

    // Create Bond
    'Create Bond': props<{ bondData: CreateBondRequest }>(),
    'Create Bond Success': props<{ message: string }>(),
    'Create Bond Failure': props<{ error: string }>(),

    // Update Bond
    'Update Bond': props<{
      bondId: number;
      bondData: UpdateBondRequest
    }>(),
    'Update Bond Success': props<{ bondId: number; message: string }>(),
    'Update Bond Failure': props<{ bondId: number; error: string }>(),

    // Delete Bond
    'Delete Bond': props<{ bondId: number }>(),
    'Delete Bond Success': props<{ bondId: number }>(),
    'Delete Bond Failure': props<{ bondId: number; error: string }>(),

    // Load Partner Bonds
    'Load Partner Bonds': props<{ filters: PartnerBondFilterParams }>(),
    'Load Partner Bonds Success': props<{
      partnerId: number;
      bonds: PartnerBond[];
      total: number;
      limit: number;
      offset: number;
    }>(),
    'Load Partner Bonds Failure': props<{
      partnerId: number;
      error: string
    }>(),

    // Load Customer Bonds
    'Load Customer Bonds': props<{ filters?: CustomerBondFilterParams }>(),
    'Load Customer Bonds Success': props<{
      customerBonds: CustomerBondHolding[];
      total: number;
      limit: number;
      offset: number;
    }>(),
    'Load Customer Bonds Failure': props<{ error: string }>(),

    // Filter & Search
    'Apply Filters': props<{ filters: BondFilterParams }>(),
    'Clear Filters': emptyProps(),
    'Set Search Keyword': props<{ keyword: string }>(),

    // Pagination
    'Change Page': props<{ offset: number }>(),
    'Change Page Size': props<{ limit: number }>(),

    // Selection
    'Select Bond': props<{ bondId: number | null }>(),
    'Select Multiple Bonds': props<{ bondIds: number[] }>(),
    'Clear Selection': emptyProps(),

    // View Mode
    'Set View Mode': props<{ mode: 'all' | 'partner' | 'customer' }>(),
    'Set Active Partner': props<{ partnerId: number | null }>(),
    'Set Bonds Context': props<{ context: BondsContext }>(),

    // UI State
    'Set Loading': props<{ loading: boolean }>(),
    'Clear Errors': emptyProps(),
    'Reset State': emptyProps(),

    // Page Management
    'Reset To First Page': emptyProps(),
    'Reset For Context View': emptyProps(), // Reset when entering partner/customer context
    'Check And Load Bonds': props<{ filters?: BondFilterParams }>(),
    'Check And Load Bond': props<{ bondId: number; forceReload?: boolean }>()
  }
});