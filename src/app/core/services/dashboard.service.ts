// src/app/core/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStatsDTO } from '@store/dashboard/dashboard.state';
import { environment } from '@environments/environment';

/**
 * Dashboard Service
 * Handles all HTTP requests related to dashboard statistics
 * 
 * This service communicates with the backend API to fetch
 * dashboard metrics including transactions, bonds, and customer data.
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
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.gimacPayment.apiUrl;

  /**
   * Fetch dashboard statistics from the API
   * 
   * Makes a GET request to retrieve comprehensive dashboard metrics
   * including transaction counts, bond information, and customer data.
   * 
   * The request automatically includes:
   * - Client credentials (via clientCredentialsInterceptor)
   * - Bearer token for authentication (via authInterceptor)
   * 
   * @returns Observable<DashboardStatsDTO> - Stream that emits dashboard statistics
   * 
   * @example
   * ```typescript
   * this.dashboardService.getDashboardStats().subscribe({
   *   next: (stats) => console.log('Stats loaded:', stats),
   *   error: (error) => console.error('Failed to load stats:', error)
   * });
   * ```
   */
  getDashboardStats(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.apiUrl}/dashboard/stats`);
  }
}