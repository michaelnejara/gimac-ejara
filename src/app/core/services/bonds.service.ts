import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Bond,
  BondsResponse,
  BondResponse,
  CreateBondRequest,
  UpdateBondRequest,
  BondFilterParams,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  CustomerBondsResponse
} from '@core/models/bond.models';
import { environment } from '@environments/environment';

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
   * @returns Observable with bonds list
   */
  getBonds(filters?: BondFilterParams): Observable<BondsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof BondFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    
    return this.http.get<BondsResponse>(this.apiUrl, { params });
  }

  /**
   * Get Bond by ID
   * 
   * @param bondId - Bond ID
   * @returns Observable with bond details
   */
  getBondById(bondId: number): Observable<Bond> {
    return this.http.get<BondResponse>(`${this.apiUrl}/${bondId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create New Bond
   * 
   * @param bondData - Bond creation data
   * @returns Observable with created bond
   */
  createBond(bondData: CreateBondRequest): Observable<Bond> {
    return this.http.post<BondResponse>(this.apiUrl, bondData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update Bond
   * 
   * @param bondId - Bond ID to update
   * @param bondData - Updated bond data
   * @returns Observable with updated bond
   */
  updateBond(bondId: number, bondData: UpdateBondRequest): Observable<Bond> {
    return this.http.put<BondResponse>(`${this.apiUrl}/${bondId}`, bondData).pipe(
      map(response => response.data)
    );
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
  getPartnerBonds(filters: PartnerBondFilterParams): Observable<BondsResponse> {
    const { partnerId, ...queryParams } = filters;
    let params = new HttpParams();
    
    Object.keys(queryParams).forEach(key => {
      const value = queryParams[key as keyof Omit<PartnerBondFilterParams, 'partnerId'>];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    
    return this.http.get<BondsResponse>(
      `${this.b2bApiUrl}/partners/${partnerId}/bonds`,
      { params }
    );
  }

  /**
   * Get Customer Bonds
   * 
   * @param filters - Customer bond filter parameters
   * @returns Observable with customer bonds list
   */
  getCustomerBonds(filters?: CustomerBondFilterParams): Observable<CustomerBondsResponse> {
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
      `${this.b2bApiUrl}/customer-bonds`,
      { params }
    );
  }
}