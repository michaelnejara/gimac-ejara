import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GimacTransactionResponse, GimacTransactionFilterParams } from '@core/models/transaction.models';
import { environment } from '@environments/environment';
import { buildHttpParams } from '@core/utils/http-params.util';
import { addInterceptorMarker, INTERCEPTOR_MARKERS } from '@core/constants/interceptor-markers.constants';

/**
 * Transactions Service
 * 
 * Handles all HTTP requests related to transactions
 * Provides methods for fetching, filtering, and managing transactions
 */
@Injectable({
    providedIn: 'root'
})
export class TransactionsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.gimacTbB2B.apiUrl}/admin/transactions`;

    /**
     * Get Transactions with Filters
     * 
     * Fetches paginated transactions from the API with optional filters
     * 
     * @param filters - Filter parameters for transactions
     * @returns Observable<GimacTransactionResponse> - Paginated transaction data
     * 
     * @example
     * ```typescript
     * this.transactionsService.getTransactions({
     *   status: 'completed',
     *   pageNumber: 1,
     *   limit: 20
     * }).subscribe(response => {
     *   console.log('Transactions:', response.data);
     * });
     * ```
     */
    getTransactions(filters: GimacTransactionFilterParams): Observable<GimacTransactionResponse> {
        // Build HTTP params using higher-order function
        // Automatically filters out null/undefined values and converts numbers to strings
        const params = buildHttpParams(filters as Record<string, any>);

        return this.http.get<GimacTransactionResponse>(this.apiUrl, { params });
    }

    /**
     * Get Transaction by ID
     * 
     * Fetches a single transaction by its ID
     * 
     * @param id - Transaction ID
     * @returns Observable with transaction data
     */
    getTransactionById(id: number): Observable<any> {
        return this.http.get(addInterceptorMarker(`${this.apiUrl}/${id}`, INTERCEPTOR_MARKERS.GIMAC));
    }
}