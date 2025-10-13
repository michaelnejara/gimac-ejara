// src/app/core/services/bond-transactions.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  BondTransaction,
  TransactionsResponse,
  TransactionResponse,
  TransactionFilterParams,
  TransactionStats
} from '@core/models/bond-transaction.models';
import { environment } from '@environments/environment';

/**
 * Bond Transactions Service
 * 
 * Handles all B2B bond transaction-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class BondTransactionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gimacTbB2B.apiUrl}/v1/admin/b2b/transactions`;

  /**
   * Get All Transactions with Filters
   * 
   * @param filters - Filter parameters
   * @returns Observable with transactions list
   */
  getTransactions(filters?: TransactionFilterParams): Observable<TransactionsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TransactionFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    
    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Get Transaction by ID
   * 
   * @param transactionId - Transaction ID
   * @returns Observable with transaction details
   */
  getTransactionById(transactionId: number): Observable<BondTransaction> {
    return this.http.get<TransactionResponse>(`${this.apiUrl}/${transactionId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get Transaction Statistics
   * 
   * @param filters - Optional filters for stats
   * @returns Observable with transaction statistics
   */
  getTransactionStats(filters?: TransactionFilterParams): Observable<TransactionStats> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TransactionFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    
    return this.http.get<{ data: TransactionStats }>(`${this.apiUrl}/stats`, { params }).pipe(
      map(response => response.data)
    );
  }
}