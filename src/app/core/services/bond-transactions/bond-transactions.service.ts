// src/app/core/services/bond-transactions/bond-transactions.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Models
import {
  BondTransaction,
  TransactionsResponse,
  TransactionFilterParams,
  TransactionStats
} from '@core/models/bond-transaction.models';

// Environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BondTransactionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bond-transactions`;

  /**
   * Get all transactions with optional filters
   */
  getTransactions(filters?: TransactionFilterParams): Observable<TransactionsResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(transactionId: number): Observable<BondTransaction> {
    return this.http.get<BondTransaction>(`${this.apiUrl}/${transactionId}`);
  }

  /**
   * Get transaction statistics
   */
  getTransactionStats(filters?: TransactionFilterParams): Observable<TransactionStats> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TransactionStats>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Change transaction status (Admin only)
   */
  changeTransactionStatus(
    transactionId: number, 
    status: string, 
    reason?: string
  ): Observable<BondTransaction> {
    return this.http.patch<BondTransaction>(
      `${this.apiUrl}/${transactionId}/status`,
      { status, reason }
    );
  }

  /**
   * Get transactions by bond
   */
  getTransactionsByBond(bondId: number, limit = 20, offset = 0): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('bondId', bondId.toString())
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get transactions by partner
   */
  getTransactionsByPartner(partnerId: number, limit = 20, offset = 0): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('partnerId', partnerId.toString())
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get transactions by customer
   */
  getTransactionsByCustomer(customerId: number, limit = 20, offset = 0): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('customerId', customerId.toString())
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get transactions by status
   */
  getTransactionsByStatus(status: string, limit = 20, offset = 0): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('status', status)
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: string, limit = 20, offset = 0): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('type', type)
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get transactions by date range
   */
  getTransactionsByDateRange(
    dateFrom: string, 
    dateTo: string, 
    limit = 20, 
    offset = 0
  ): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo)
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }
}