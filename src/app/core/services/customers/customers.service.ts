import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Customer,
  CustomerDetails,
  CustomersResponse,
  CustomerResponse,
  CustomerFilterParams
} from '@core/models/customer.models';
import { environment } from '@environments/environment';
import { addInterceptorMarker, INTERCEPTOR_MARKERS } from '@core/constants/interceptor-markers.constants';

/**
 * Customers Service
 *
 * Handles all B2B customer-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gimacTbB2B.apiUrl}/v1/admin/b2b/customers`;

  /**
   * Get All Customers with Filters
   * GET /v1/admin/b2b/customers
   *
   * @param filters - Filter parameters
   * @returns Observable with customers list
   */
  getCustomers(filters?: CustomerFilterParams): Observable<CustomersResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof CustomerFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<CustomersResponse>(addInterceptorMarker(this.apiUrl, INTERCEPTOR_MARKERS.GIMAC), { params });
  }

  /**
   * Get Customer by ID
   * GET /v1/admin/b2b/customers/:id
   *
   * @param customerId - Customer ID
   * @returns Observable with customer details
   */
  getCustomerById(customerId: number): Observable<CustomerDetails> {
    return this.http.get<CustomerResponse>(addInterceptorMarker(`${this.apiUrl}/${customerId}`, INTERCEPTOR_MARKERS.GIMAC)).pipe(
      map(response => response.data)
    );
  }
}