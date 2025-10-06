// src/app/core/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardStatsDTO } from '@store/dashboard/dashboard.state';

/**
 * Mock Data Service
 * Provides mock data for development and testing
 * 
 * This service simulates API responses with realistic delays
 * to help develop and test the application before the real API is ready.
 * 
 * Features:
 * - Realistic mock data
 * - Simulated network delays
 * - Easy to update and maintain
 * - Can be used for unit testing
 */
@Injectable({
  providedIn: 'root'
})
export class GimacPaymentMockDataService {

  /**
   * Get mock dashboard statistics
   * 
   * Simulates an API call by returning mock data after a delay.
   * Useful for testing loading states and UI behavior.
   * 
   * @param delayMs - Simulated network delay in milliseconds (default: 800ms)
   * @returns Observable<DashboardStatsDTO> - Stream that emits mock dashboard data
   * 
   * @example
   * ```typescript
   * this.mockDataService.getDashboardStats().subscribe(stats => {
   *   console.log('Mock stats loaded:', stats);
   * });
   * ```
   */
  getDashboardStats(delayMs: number = 800): Observable<DashboardStatsDTO> {
    const mockStats: DashboardStatsDTO = {
      totalTransactions: 48234,
      successfulTransactions: 45180,
      failedTransactions: 854,
      pendingTransactions: 2200,
      reconciledTransactions: 44500,
      unreconciledTransactions: 3734,
      totalBondsPublished: 1250,
      bondsSold: 987,
      bondsSettled: 743,
      bondsPendingSettlement: 244,
      numberOfUniqueCustomer: 15678
    };

    return of(mockStats).pipe(
      delay(delayMs) // Simulate network delay
    );
  }

  /**
   * Get random dashboard statistics
   * 
   * Generates random values for testing dynamic updates.
   * Useful for simulating real-time data changes.
   * 
   * @param delayMs - Simulated network delay in milliseconds
   * @returns Observable<DashboardStatsDTO> - Stream that emits random dashboard data
   */
  getRandomDashboardStats(delayMs: number = 800): Observable<DashboardStatsDTO> {
    const randomStats: DashboardStatsDTO = {
      totalTransactions: this.randomInt(40000, 50000),
      successfulTransactions: this.randomInt(38000, 47000),
      failedTransactions: this.randomInt(500, 1500),
      pendingTransactions: this.randomInt(1000, 3000),
      reconciledTransactions: this.randomInt(40000, 46000),
      unreconciledTransactions: this.randomInt(2000, 5000),
      totalBondsPublished: this.randomInt(1000, 1500),
      bondsSold: this.randomInt(800, 1200),
      bondsSettled: this.randomInt(600, 1000),
      bondsPendingSettlement: this.randomInt(100, 400),
      numberOfUniqueCustomer: this.randomInt(12000, 18000)
    };

    return of(randomStats).pipe(
      delay(delayMs)
    );
  }

  /**
   * Generate random integer between min and max (inclusive)
   * 
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random integer
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}