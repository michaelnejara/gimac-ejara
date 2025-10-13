// src/app/core/services/partners.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Partner,
  PartnersResponse,
  PartnerResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  UpdatePartnerStatusRequest,
  PartnerFilterParams,
  StatusUpdateResponse,
  BondAssignmentResponse,
  RemoveBondsRequest,
  AssignBondsRequest
} from '@core/models/partner.models';
import { environment } from '@environments/environment';

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
  private apiUrl = `${environment.apiUrl}/admin/b2b/partners`;

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
    
    return this.http.get<PartnersResponse>(this.apiUrl, { params });
  }

  /**
   * Get Partner by ID
   * 
   * @param partnerId - Partner ID
   * @returns Observable with partner details
   */
  getPartnerById(partnerId: number): Observable<Partner> {
    return this.http.get<PartnerResponse>(`${this.apiUrl}/${partnerId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create New Partner
   * 
   * @param partnerData - Partner creation data
   * @returns Observable with created partner
   */
  createPartner(partnerData: CreatePartnerRequest): Observable<Partner> {
    return this.http.post<PartnerResponse>(this.apiUrl, partnerData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update Partner
   * 
   * @param partnerId - Partner ID to update
   * @param partnerData - Updated partner data
   * @returns Observable with updated partner
   */
  updatePartner(partnerId: number, partnerData: UpdatePartnerRequest): Observable<Partner> {
    return this.http.put<PartnerResponse>(`${this.apiUrl}/${partnerId}`, partnerData).pipe(
      map(response => response.data)
    );
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
      `${this.apiUrl}/${partnerId}/status`, 
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
    return this.http.delete<void>(`${this.apiUrl}/${partnerId}`);
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
    `${this.apiUrl}/${partnerId}/assign-bonds`,
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
    `${this.apiUrl}/${partnerId}/remove-bonds`,
    bondsData
  );
}
}