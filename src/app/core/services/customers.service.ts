// src/app/core/services/customers.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Customer,
  CustomersResponse,
  CustomerResponse,
  CustomerFilterParams
} from '@core/models/customer.models';
import { environment } from '@environments/environment';

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
  private apiUrl = `${environment.apiUrl}/v1/admin/b2b/customers`;

  /**
   * Get All Customers with Filters
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
    
    return this.http.get<CustomersResponse>(this.apiUrl, { params });
  }

  /**
   * Get Customer by ID
   * 
   * @param customerId - Customer ID
   * @returns Observable with customer details
   */
  getCustomerById(customerId: number): Observable<Customer> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/${customerId}`).pipe(
      map(response => response.data)
    );
  }
}