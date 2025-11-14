// src/app/core/services/partners.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Partner,
  PartnerDetail,
  PartnersResponse,
  PartnerResponse,
  CreatePartnerRequest,
  CreatePartnerResponse,
  UpdatePartnerRequest,
  UpdatePartnerResponse,
  UpdatePartnerStatusRequest,
  PartnerFilterParams,
  StatusUpdateResponse,
  BondAssignmentResponse,
  RemoveBondsRequest,
  AssignBondsRequest
} from '@core/models/partner.models';
import { environment } from '@environments/environment';
import { addInterceptorMarker, INTERCEPTOR_MARKERS } from '@core/constants/interceptor-markers.constants';

/**
 * Partners Service
 * 
 * Handles all partner-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class PartnersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gimacTbB2B.apiUrl}/v1/admin/b2b/partners`;

  /**
   * Get All Partners with Filters
   * 
   * @param filters - Filter parameters
   * @returns Observable with partners list
   */
  getPartners(filters?: PartnerFilterParams): Observable<PartnersResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PartnerFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    
    return this.http.get<PartnersResponse>(addInterceptorMarker(this.apiUrl,INTERCEPTOR_MARKERS.GIMAC), { params });
  }

  /**
   * Get Partner by ID
   *
   * @param partnerId - Partner ID
   * @returns Observable with partner response (includes PartnerDetail)
   */
  getPartnerById(partnerId: number): Observable<PartnerResponse> {
    return this.http.get<PartnerResponse>(addInterceptorMarker(`${this.apiUrl}/${partnerId}`, INTERCEPTOR_MARKERS.GIMAC));
  }

  /**
   * Create New Partner
   *
   * @param partnerData - Partner creation data
   * @returns Observable with create partner response
   */
  createPartner(partnerData: CreatePartnerRequest): Observable<CreatePartnerResponse> {
    return this.http.post<CreatePartnerResponse>(addInterceptorMarker(this.apiUrl, INTERCEPTOR_MARKERS.GIMAC), partnerData);
  }

  /**
   * Update Partner
   *
   * @param partnerId - Partner ID to update
   * @param partnerData - Updated partner data
   * @returns Observable with update partner response
   */
  updatePartner(partnerId: number, partnerData: UpdatePartnerRequest): Observable<UpdatePartnerResponse> {
    return this.http.put<UpdatePartnerResponse>(addInterceptorMarker(`${this.apiUrl}/${partnerId}`, INTERCEPTOR_MARKERS.GIMAC), partnerData);
  }

  /**
   * Update Partner Status
   * 
   * @param partnerId - Partner ID
   * @param statusData - Status update data with reason
   * @returns Observable with status update response
   */
  updatePartnerStatus(
    partnerId: number, 
    statusData: UpdatePartnerStatusRequest
  ): Observable<StatusUpdateResponse> {
    return this.http.put<StatusUpdateResponse>(
      addInterceptorMarker(`${this.apiUrl}/${partnerId}/status`, INTERCEPTOR_MARKERS.GIMAC), 
      statusData
    );
  }

  /**
   * Delete Partner (if API supports it)
   * 
   * @param partnerId - Partner ID to delete
   * @returns Observable with deletion response
   */
  deletePartner(partnerId: number): Observable<void> {
    return this.http.delete<void>(addInterceptorMarker(`${this.apiUrl}/${partnerId}`, INTERCEPTOR_MARKERS.GIMAC));
  }

  /**
 * Assign Bonds to Partner
 * 
 * @param partnerId - Partner ID
 * @param bondsData - Bond assignment data
 * @returns Observable with assignment response
 */
assignBonds(partnerId: number, bondsData: AssignBondsRequest): Observable<BondAssignmentResponse> {
  return this.http.post<BondAssignmentResponse>(
    addInterceptorMarker(`${this.apiUrl}/${partnerId}/assign-bonds`, INTERCEPTOR_MARKERS.GIMAC),
    bondsData
  );
}

/**
 * Remove Bonds from Partner
 * 
 * @param partnerId - Partner ID
 * @param bondsData - Bond removal data
 * @returns Observable with removal response
 */
removeBonds(partnerId: number, bondsData: RemoveBondsRequest): Observable<BondAssignmentResponse> {
  return this.http.post<BondAssignmentResponse>(
    addInterceptorMarker(`${this.apiUrl}/${partnerId}/remove-bonds`, INTERCEPTOR_MARKERS.GIMAC),
    bondsData
  );
}
}