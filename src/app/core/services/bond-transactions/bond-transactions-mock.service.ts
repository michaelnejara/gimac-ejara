// src/app/core/services/bond-transactions/bond-transactions-mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Models
import {
  BondTransaction,
  TransactionsResponse,
  TransactionFilterParams,
  TransactionStats,
  TransactionStatus,
  TransactionStatusResponse
} from '@core/models/bond-transaction.models';

@Injectable({
  providedIn: 'root'
})
export class BondTransactionsMockService {
  private mockTransactions: BondTransaction[] = [
    {
      id: 1,
      transactionReference: 'TXN-2025-001',
      partnerTransactionReference: 'PARTNER-TXN-001',
      transactionType: 'purchase',
      partnerId: 1,
      partnerName: 'First Capital Partners',
      customerFirstName: 'John',
      customerLastName: 'Doe',
      partnerUserId: 'CUSTOMER_101',
      amount: 1000000,
      fee: 5000,
      total: 1005000,
      paymentStatus: 'completed',
      blockchainStatus: 'confirmed',
      dateCreated: '2025-01-15T10:30:00Z',
      lastUpdated: '2025-01-15T11:00:00Z',
      // Optional backward compatibility fields
      status: 'confirmed',
      customerId: 101,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      bondId: 1,
      bondName: 'Government Treasury Bond 2030',
      bondCode: 'GTB-2030',
      units: 100,
      pricePerUnit: 10000,
      totalAmount: 1005000,
      currency: 'XAF',
      commission: 25000,
      commissionRate: 2.5,
      fees: 5000,
      netAmount: 975000,
      paymentMethod: 'Bank Transfer',
      paymentReference: 'PAY-001',
      blockchainTxHash: '0x1234...abcd',
      blockchainConfirmations: 12,
      dateConfirmed: '2025-01-15T10:45:00Z',
      dateCompleted: '2025-01-15T11:00:00Z'
    },
    {
      id: 2,
      transactionReference: 'TXN-2025-002',
      partnerTransactionReference: 'PARTNER-TXN-002',
      transactionType: 'purchase',
      partnerId: 2,
      partnerName: 'Secure Investment Group',
      customerFirstName: 'Jane',
      customerLastName: 'Smith',
      partnerUserId: 'CUSTOMER_102',
      amount: 750000,
      fee: 3750,
      total: 753750,
      paymentStatus: 'pending',
      blockchainStatus: 'pending',
      dateCreated: '2025-01-16T14:20:00Z',
      lastUpdated: '2025-01-16T14:20:00Z',
      // Optional backward compatibility fields
      status: 'pending',
      customerId: 102,
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      bondId: 2,
      bondName: 'Corporate Bond Series A',
      bondCode: 'CBA-2025',
      units: 50,
      pricePerUnit: 15000,
      totalAmount: 753750,
      currency: 'XAF',
      commission: 18750,
      commissionRate: 2.5,
      fees: 3750,
      netAmount: 731250,
      paymentMethod: 'Mobile Money'
    },
    {
      id: 3,
      transactionReference: 'TXN-2025-003',
      partnerTransactionReference: 'PARTNER-TXN-003',
      transactionType: 'withdrawal',
      partnerId: 1,
      partnerName: 'First Capital Partners',
      customerFirstName: 'John',
      customerLastName: 'Doe',
      partnerUserId: 'CUSTOMER_101',
      amount: 262500,
      fee: 1312.50,
      total: 261187.50,
      paymentStatus: 'completed',
      blockchainStatus: 'confirmed',
      dateCreated: '2025-01-17T09:00:00Z',
      lastUpdated: '2025-01-17T09:30:00Z',
      // Optional backward compatibility fields
      status: 'confirmed',
      customerId: 101,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      bondId: 1,
      bondName: 'Government Treasury Bond 2030',
      bondCode: 'GTB-2030',
      units: 25,
      pricePerUnit: 10500,
      totalAmount: 261187.50,
      currency: 'XAF',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'WTH-001',
      blockchainTxHash: '0x5678...efgh',
      blockchainConfirmations: 8,
      dateConfirmed: '2025-01-17T09:15:00Z',
      dateCompleted: '2025-01-17T09:30:00Z'
    },
    {
      id: 4,
      transactionReference: 'TXN-2025-004',
      partnerTransactionReference: 'PARTNER-TXN-004',
      transactionType: 'purchase',
      partnerId: 3,
      partnerName: 'Global Finance Solutions',
      customerFirstName: 'Michael',
      customerLastName: 'Johnson',
      partnerUserId: 'CUSTOMER_103',
      amount: 1600000,
      fee: 8000,
      total: 1608000,
      paymentStatus: 'pending',
      blockchainStatus: 'pending',
      dateCreated: '2025-01-18T11:45:00Z',
      lastUpdated: '2025-01-18T11:50:00Z',
      // Optional backward compatibility fields
      status: 'processing',
      customerId: 103,
      customerName: 'Michael Johnson',
      customerEmail: 'michael.j@example.com',
      bondId: 3,
      bondName: 'Infrastructure Development Bond',
      bondCode: 'IDB-2028',
      units: 200,
      pricePerUnit: 8000,
      totalAmount: 1608000,
      currency: 'XAF',
      commission: 40000,
      commissionRate: 2.5,
      fees: 8000,
      netAmount: 1560000,
      paymentMethod: 'Credit Card'
    },
    {
      id: 5,
      transactionReference: 'TXN-2025-005',
      partnerTransactionReference: 'PARTNER-TXN-005',
      transactionType: 'deposit',
      partnerId: 2,
      partnerName: 'Secure Investment Group',
      customerFirstName: 'Sarah',
      customerLastName: 'Williams',
      partnerUserId: 'CUSTOMER_104',
      amount: 1125000,
      fee: 5625,
      total: 1130625,
      paymentStatus: 'failed',
      blockchainStatus: 'failed',
      dateCreated: '2025-01-19T08:30:00Z',
      lastUpdated: '2025-01-19T08:45:00Z',
      // Optional backward compatibility fields
      status: 'failed',
      customerId: 104,
      customerName: 'Sarah Williams',
      customerEmail: 'sarah.w@example.com',
      bondId: 2,
      bondName: 'Corporate Bond Series A',
      bondCode: 'CBA-2025',
      units: 75,
      pricePerUnit: 15000,
      totalAmount: 1130625,
      currency: 'XAF',
      paymentMethod: 'Bank Transfer'
    }
  ];

  /**
   * Get all transactions with optional filters
   */
  getTransactions(filters?: TransactionFilterParams): Observable<TransactionsResponse> {
    let filteredTransactions = [...this.mockTransactions];

    if (filters) {
      if (filters.bondId) {
        filteredTransactions = filteredTransactions.filter(t => t.bondId === filters.bondId);
      }
      if (filters.partnerId) {
        filteredTransactions = filteredTransactions.filter(t => t.partnerId === filters.partnerId);
      }
      if (filters.customerId) {
        filteredTransactions = filteredTransactions.filter(t => t.customerId === filters.customerId);
      }
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.transactionType === filters.type);
      }
      if (filters.dateFrom) {
        filteredTransactions = filteredTransactions.filter(
          t => new Date(t.dateCreated) >= new Date(filters.dateFrom!)
        );
      }
      if (filters.dateTo) {
        filteredTransactions = filteredTransactions.filter(
          t => new Date(t.dateCreated) <= new Date(filters.dateTo!)
        );
      }
    }

    const total = filteredTransactions.length;
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    return of({
      message: 'Transactions retrieved successfully',
      data: paginatedTransactions,
      meta: {
        total,
        limit,
        offset
      }
    }).pipe(delay(500));
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(transactionId: number): Observable<BondTransaction> {
    const transaction = this.mockTransactions.find(t => t.id === transactionId);
    
    if (transaction) {
      return of(transaction).pipe(delay(300));
    }
    
    return throwError(() => ({
      error: { message: 'Transaction not found' }
    })).pipe(delay(300));
  }

  /**
   * Get transaction statistics
   */
  getTransactionStats(filters?: TransactionFilterParams): Observable<TransactionStats> {
    let transactions = [...this.mockTransactions];

    // Apply filters if provided
    if (filters) {
      if (filters.bondId) {
        transactions = transactions.filter(t => t.bondId === filters.bondId);
      }
      if (filters.partnerId) {
        transactions = transactions.filter(t => t.partnerId === filters.partnerId);
      }
      if (filters.customerId) {
        transactions = transactions.filter(t => t.customerId === filters.customerId);
      }
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
      if (filters.type) {
        transactions = transactions.filter(t => t.transactionType === filters.type);
      }
    }

    const totalTransactions = transactions.length;
    const totalPurchases = transactions.filter(t => t.transactionType === 'purchase').length;
    const totalWithdrawals = transactions.filter(t => t.transactionType === 'withdrawal').length;

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const purchaseVolume = transactions
      .filter(t => t.transactionType === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawalVolume = transactions
      .filter(t => t.transactionType === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const stats: TransactionStats = {
      totalTransactions,
      totalPurchases,
      totalWithdrawals,
      totalVolume,
      purchaseVolume,
      withdrawalVolume,
      averageTransactionSize: totalTransactions > 0 ? totalVolume / totalTransactions : 0,
      averageTransactionAmount: totalTransactions > 0 ? totalVolume / totalTransactions : 0,
      pendingCount: transactions.filter(t => t.status === 'pending').length,
      confirmedCount: transactions.filter(t => t.status === 'confirmed').length,
      failedCount: transactions.filter(t => t.status === 'failed').length,
      processingCount: transactions.filter(t => t.status === 'processing').length
    };

    return of(stats).pipe(delay(400));
  }

  /**
   * Change transaction status (Admin only)
   */
  changeTransactionStatus(
    transactionId: number,
    status: string,
    reason?: string
  ): Observable<TransactionStatusResponse> {
    const transactionIndex = this.mockTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      return throwError(() => ({
        error: { message: 'Transaction not found' }
      })).pipe(delay(300));
    }

    // Validate status
    const validStatuses: TransactionStatus[] = ['pending', 'confirmed', 'failed', 'processing'];
    if (!validStatuses.includes(status as TransactionStatus)) {
      return throwError(() => ({
        error: { message: 'Invalid transaction status' }
      })).pipe(delay(300));
    }

    // Update transaction
    const updatedTransaction: TransactionStatusResponse = {
      data: {
        status,
        transactionId,
        updatedAt: new Date().toISOString()
      },
      message: 'Transaction status updated successfully',
    }

    // this.mockTransactions[transactionIndex] = updatedTransaction;

    return of(updatedTransaction).pipe(delay(500));
  }
}