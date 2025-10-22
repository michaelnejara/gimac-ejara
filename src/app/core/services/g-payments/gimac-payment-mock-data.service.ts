// src/app/core/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { DashboardStatsDTO } from '@core/models/dashboard.models';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
      totalPartners: 15,
      totalActivePartners: 12,
      totalCustomers: 1250,
      totalActiveCustomers: 980,
      totalDeposits: 450,
      totalDepositAmount: 2500000.50,
      totalWithdrawals: 120,
      totalWithdrawalAmount: 750000.25,
      totalCommissionEarned: 125000.75,
      totalPrincipalInvested: 2000000.00,
      totalInterestPaid: 150000.30,
      totalPendingTransactions: 25,
      totalFailedTransactions: 8
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
      totalPartners: this.randomInt(10, 25),
      totalActivePartners: this.randomInt(8, 20),
      totalCustomers: this.randomInt(1000, 2000),
      totalActiveCustomers: this.randomInt(800, 1600),
      totalDeposits: this.randomInt(300, 600),
      totalDepositAmount: this.randomFloat(2000000, 3000000),
      totalWithdrawals: this.randomInt(80, 200),
      totalWithdrawalAmount: this.randomFloat(500000, 1000000),
      totalCommissionEarned: this.randomFloat(100000, 200000),
      totalPrincipalInvested: this.randomFloat(1500000, 2500000),
      totalInterestPaid: this.randomFloat(100000, 200000),
      totalPendingTransactions: this.randomInt(10, 50),
      totalFailedTransactions: this.randomInt(5, 20)
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

  /**
   * Generate random float between min and max
   *
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random float with 2 decimal places
   */
  private randomFloat(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }
}