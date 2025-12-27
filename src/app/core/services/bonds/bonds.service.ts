import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Bond,
  BondsResponse,
  BondResponse,
  BondMutationResponse,
  PartnerBond,
  PartnerBondsResponse,
  CreateBondRequest,
  UpdateBondRequest,
  BondFilterParams,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  CustomerBondsResponse
} from '@core/models/bond.models';
import { environment } from '@environments/environment';
import { addInterceptorMarker, INTERCEPTOR_MARKERS } from '@core/constants/interceptor-markers.constants';

/**
 * Bonds Service
 * 
 * Handles all bond-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class BondsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gimacTbB2B.apiUrl}/v2/admin/bonds`;
  private b2bApiUrl = `${environment.gimacTbB2B.apiUrl}/v1/admin/b2b`;

  /**
   * Get All Bonds (Admin)
   *
   * @param filters - Filter parameters
   * @returns Observable with bonds list and pagination info
   */
  getBonds(filters?: BondFilterParams): Observable<{ bonds: Bond[]; total: number; limit: number; offset: number }> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof BondFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<BondsResponse>(addInterceptorMarker(this.apiUrl,INTERCEPTOR_MARKERS.GIMAC), { params }).pipe(
      map(response => ({
        bonds: response.data.bonds,
        total: response.data.totalCount,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      }))
    );
  }

  /**
   * Get Bond by ID
   * 
   * @param bondId - Bond ID
   * @returns Observable with bond details
   */
  getBondById(bondId: number): Observable<Bond> {
    return this.http.get<BondResponse>(addInterceptorMarker(`${this.apiUrl}/${bondId}`,INTERCEPTOR_MARKERS.GIMAC)).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create New Bond
   *
   * @param bondData - Bond creation data
   * @returns Observable with success message
   */
  createBond(bondData: CreateBondRequest): Observable<{ message: string }> {
    return this.http.post<BondMutationResponse>(addInterceptorMarker(this.apiUrl,INTERCEPTOR_MARKERS.GIMAC), bondData);
  }

  /**
   * Update Bond
   *
   * @param bondId - Bond ID to update
   * @param bondData - Updated bond data
   * @returns Observable with success message
   */
  updateBond(bondId: number, bondData: UpdateBondRequest): Observable<{ message: string }> {
    return this.http.put<BondMutationResponse>(addInterceptorMarker(`${this.apiUrl}/${bondId}`, INTERCEPTOR_MARKERS.GIMAC), bondData);
  }

  /**
   * Delete Bond (if API supports it)
   * 
   * @param bondId - Bond ID to delete
   * @returns Observable with deletion response
   */
  deleteBond(bondId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${bondId}`);
  }

  /**
   * Get Partner Bonds
   *
   * @param filters - Partner bond filter parameters
   * @returns Observable with partner bonds list
   */
  getPartnerBonds(filters: PartnerBondFilterParams): Observable<{ bonds: PartnerBond[]; total: number; limit: number; offset: number }> {
    const { partnerId, ...queryParams } = filters;
    let params = new HttpParams();

    Object.keys(queryParams).forEach(key => {
      const value = queryParams[key as keyof Omit<PartnerBondFilterParams, 'partnerId'>];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PartnerBondsResponse>(
      addInterceptorMarker(`${this.b2bApiUrl}/partners/${partnerId}/bonds`,INTERCEPTOR_MARKERS.GIMAC),
      { params }
    ).pipe(
      map(response => ({
        bonds: response.data,
        total: response.meta.total,
        limit: response.meta.limit,
        offset: response.meta.offset
      }))
    );
  }

  /**
   * Get Customer Bonds
   *
   * @param filters - Customer bond filter parameters
   * @returns Observable with customer bonds list
   */
  getCustomerBonds(filters?: CustomerBondFilterParams): Observable<{ customerBonds: any[]; total: number; limit: number; offset: number }> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof CustomerBondFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<CustomerBondsResponse>(
      addInterceptorMarker(`${this.b2bApiUrl}/customer-bonds`,INTERCEPTOR_MARKERS.GIMAC),
      { params }
    ).pipe(
      map(response => ({
        customerBonds: response.data,
        total: response.meta.total,
        limit: response.meta.limit,
        offset: response.meta.offset
      }))
    );
  }
}