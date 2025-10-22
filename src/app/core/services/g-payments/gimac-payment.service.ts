// src/app/core/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DashboardStatsDTO, DashboardFilterParams } from '@core/models/dashboard.models';
import { addInterceptorMarker, INTERCEPTOR_MARKERS } from '@core/constants/interceptor-markers.constants';

/**
 * API Response wrapper for dashboard statistics
 */
interface DashboardStatsResponse {
  message: string;
  data: DashboardStatsDTO;
}

/**
 * Dashboard Service
 * Handles all HTTP requests related to dashboard statistics
 *
 * This service communicates with the backend API to fetch
 * dashboard metrics including partners, customers, transactions, and financial data.
 *
 * @example
 * ```typescript
 * constructor(private dashboardService: DashboardService) {}
 *
 * loadStats() {
 *   this.dashboardService.getDashboardStats().subscribe(stats => {
 *     console.log('Dashboard stats:', stats);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class GimacPaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gimacTbB2B.apiUrl}/v1/admin/b2b`;

  /**
   * Fetch dashboard statistics from the API
   *
   * Makes a GET request to retrieve comprehensive dashboard metrics
   * including partners, customers, deposits, withdrawals, and financial operations.
   *
   * The request automatically includes:
   * - Client credentials (via clientCredentialsInterceptor)
   * - Bearer token for authentication (via authInterceptor)
   *
   * @param filters - Optional filter parameters (startDate, endDate, partnerId)
   * @returns Observable<DashboardStatsDTO> - Stream that emits dashboard statistics
   *
   * @example
   * ```typescript
   * // Without filters
   * this.dashboardService.getDashboardStats().subscribe({
   *   next: (stats) => console.log('Stats loaded:', stats),
   *   error: (error) => console.error('Failed to load stats:', error)
   * });
   *
   * // With filters
   * this.dashboardService.getDashboardStats({
   *   startDate: '2024-01-01',
   *   endDate: '2024-12-31',
   *   partnerId: '123'
   * }).subscribe(stats => console.log('Filtered stats:', stats));
   * ```
   */
  getDashboardStats(filters?: DashboardFilterParams): Observable<DashboardStatsDTO> {
    let params = new HttpParams();

    // Add filter parameters if provided
    if (filters) {
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
      if (filters.partnerId) {
        params = params.set('partnerId', filters.partnerId);
      }
    }

    return this.http.get<DashboardStatsResponse>(
      addInterceptorMarker(`${this.apiUrl}/statistics`, INTERCEPTOR_MARKERS.GIMAC),
      { params }
    ).pipe(
      map(response => response.data)
    );
  }
}