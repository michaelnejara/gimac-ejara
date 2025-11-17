// src/app/store/partners/partners.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  Partner,
  PartnerDetail,
  PartnersResponse,
  CreatePartnerRequest,
  CreatePartnerResponse,
  UpdatePartnerRequest,
  UpdatePartnerResponse,
  UpdatePartnerStatusRequest,
  StatusUpdateResponse,
  PartnerFilterParams,
  AssignBondsRequest,
  BondAssignmentResponse,
  RemoveBondsRequest
} from '@core/models/partner.models';

/**
 * Partners Actions
 * 
 * Actions for managing partners with full CRUD operations
 */
export const PartnersActions = createActionGroup({
  source: 'Partners',
  events: {
    // Load Partners List
    'Load Partners': props<{ filters?: PartnerFilterParams }>(),
    'Load Partners Success': props<{ response: PartnersResponse }>(),
    'Load Partners Failure': props<{ error: string }>(),

    // Load Single Partner
    'Load Partner': props<{ partnerId: number }>(),
    'Load Partner Success': props<{ partner: PartnerDetail }>(),
    'Load Partner Failure': props<{ partnerId: number; error: string }>(),

    // Create Partner
    'Create Partner': props<{ partnerData: CreatePartnerRequest }>(),
    'Create Partner Success': props<{ response: CreatePartnerResponse }>(),
    'Create Partner Failure': props<{ error: string }>(),

    // Update Partner
    'Update Partner': props<{
      partnerId: number;
      partnerData: UpdatePartnerRequest
    }>(),
    'Update Partner Success': props<{ partnerId: number; response: UpdatePartnerResponse }>(),
    'Update Partner Failure': props<{ partnerId: number; error: string }>(),

    // Update Partner Status
    'Update Partner Status': props<{
      partnerId: number;
      status: UpdatePartnerStatusRequest
    }>(),
    'Update Partner Status Success': props<{
      partnerId: number;
      response: StatusUpdateResponse
    }>(),
    'Update Partner Status Failure': props<{
      partnerId: number;
      error: string
    }>(),

    // Delete Partner
    'Delete Partner': props<{ partnerId: number }>(),
    'Delete Partner Success': props<{ partnerId: number }>(),
    'Delete Partner Failure': props<{ partnerId: number; error: string }>(),

    // Filter & Search
    'Apply Filters': props<{ filters: PartnerFilterParams }>(),
    'Clear Filters': emptyProps(),
    'Set Search Keyword': props<{ keyword: string }>(),

    // Pagination
    'Change Page': props<{ offset: number }>(),
    'Change Page Size': props<{ limit: number }>(),

    // Selection
    'Select Partner': props<{ partnerId: number | null }>(),
    'Select Multiple Partners': props<{ partnerIds: number[] }>(),
    'Clear Selection': emptyProps(),

    // UI State
    'Set Loading': props<{ loading: boolean }>(),
    'Clear Errors': emptyProps(),
    'Reset State': emptyProps(),

    // Page Management
    'Reset To First Page': emptyProps(),
    'Check And Load Partners': props<{ filters?: PartnerFilterParams }>(),
    'Check And Load Partner': props<{ partnerId: number; forceReload?: boolean }>(),

    // Assign Bonds to Partner
    'Assign Bonds': props<{ 
      partnerId: number; 
      bondsData: AssignBondsRequest 
    }>(),
    'Assign Bonds Success': props<{ 
      partnerId: number; 
      response: BondAssignmentResponse 
    }>(),
    'Assign Bonds Failure': props<{ partnerId: number; error: string }>(),

    // Remove Bonds from Partner
    'Remove Bonds': props<{ 
      partnerId: number; 
      bondsData: RemoveBondsRequest 
    }>(),
    'Remove Bonds Success': props<{ 
      partnerId: number; 
      response: BondAssignmentResponse 
    }>(),
    'Remove Bonds Failure': props<{ partnerId: number; error: string }>(),
  }
});