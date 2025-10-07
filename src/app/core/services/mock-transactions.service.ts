// src/app/core/services/mock-transactions.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  GimacTransactionResponse, 
  GimacTransaction, 
  GimacTransactionFilterParams,
  TransactionStatus,
  PaginationInfo 
} from '@core/models/transaction.models';

/**
 * Mock Transactions Service
 * 
 * Provides mock transaction data for development and testing.
 * Simulates API responses with realistic delays and pagination.
 * 
 * Features:
 * - Generates realistic mock transactions
 * - Supports filtering by status, dates, keywords
 * - Implements pagination
 * - Simulates network delays
 * - Supports error scenarios
 */
@Injectable({
  providedIn: 'root'
})
export class MockTransactionsService {
  private mockTransactions: GimacTransaction[] = [];
  private readonly TOTAL_MOCK_TRANSACTIONS = 250;

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize mock transaction data
   * Generates a pool of mock transactions on service creation
   */
  private initializeMockData(): void {
    this.mockTransactions = [];
    
    for (let i = 1; i <= this.TOTAL_MOCK_TRANSACTIONS; i++) {
      this.mockTransactions.push(this.generateMockTransaction(i));
    }
  }

  /**
   * Generate a single mock transaction
   * 
   * @param id - Transaction ID
   * @returns Mock GimacTransaction object
   */
  private generateMockTransaction(id: number): GimacTransaction {
    const statuses = ['initiated', 'pending', 'completed', 'failed', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES'];
    const senderCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const receiverCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    const amount = (Math.random() * 10000 + 100).toFixed(2);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
    
    const senderAccounts = [
      '+237670000001',
      '+237680000001',
      '+237690000001',
      'sender@email.com',
      '1234567890'
    ];
    
    const receiverAccounts = [
      '+237670000002',
      '+237680000002',
      '+237690000002',
      'receiver@email.com',
      '0987654321'
    ];

    return {
      id,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      status: { value: status, label: this.getStatusLabel(status) },
      apiClientId: Math.floor(Math.random() * 10) + 1,
      gimacServiceCode: { code: 'TRANSFER', name: 'Money Transfer' },
      gimacSupportedServiceId: Math.floor(Math.random() * 5) + 1,
      gimacSupportedServiceConfigId: Math.floor(Math.random() * 10) + 1,
      baseCurrencyId: 1,
      rawAmount: { amount, currency: senderCurrency },
      baseAmount: { amount, currency: 'USD' },
      netAmount: { amount: (parseFloat(amount) * 0.98).toFixed(2), currency: senderCurrency },
      netAmountInBaseCurrency: { amount: (parseFloat(amount) * 0.98).toFixed(2), currency: 'USD' },
      receiverAmount: { amount: (parseFloat(amount) * 0.97).toFixed(2), currency: receiverCurrency },
      receiverCurrencyUsdRate: { rate: 1.0 },
      senderCurrencyUsdRate: { rate: 1.0 },
      baseCurrencyUsdRate: { rate: 1.0 },
      internalReference: `INT-${id.toString().padStart(8, '0')}`,
      externalReference: `EXT-${id.toString().padStart(8, '0')}`,
      validatedAt: status === 'completed' ? createdDate.toISOString() : '',
      reconciledAt: status === 'completed' && Math.random() > 0.3 ? createdDate.toISOString() : '',
      webhookSentAt: status === 'completed' && Math.random() > 0.2 ? createdDate.toISOString() : '',
      createdBy: 1,
      senderAccountInfo: {
        name: `Sender ${id}`,
        type: 'mobile',
        country: 'CM'
      },
      receiverAccountInfo: {
        name: `Receiver ${id}`,
        type: 'mobile',
        country: 'CM'
      },
      senderAccountIdentifier: senderAccounts[Math.floor(Math.random() * senderAccounts.length)],
      receiverAccountIdentifier: receiverAccounts[Math.floor(Math.random() * receiverAccounts.length)],
      billInfo: {},
      senderCountryId: Math.floor(Math.random() * 50) + 1,
      receiverCountryId: Math.floor(Math.random() * 50) + 1,
      senderCurrencyId: 1,
      receiverCurrencyId: 2,
      isWebhookSent: status === 'completed' && Math.random() > 0.2,
      validationChannel: { channel: 'API' },
      accumulatedFeePolicy: {},
      accumulatedFeeInSenderCurrency: { amount: (parseFloat(amount) * 0.02).toFixed(2), currency: senderCurrency },
      accumulatedFeeInBaseCurrency: { amount: (parseFloat(amount) * 0.02).toFixed(2), currency: 'USD' },
      gimacFeeInBaseCurrency: { amount: (parseFloat(amount) * 0.01).toFixed(2), currency: 'USD' },
      receiverProviderFeeInBaseCurrency: { amount: (parseFloat(amount) * 0.005).toFixed(2), currency: 'USD' },
      acquirerFeeInBaseCurrency: { amount: (parseFloat(amount) * 0.003).toFixed(2), currency: 'USD' },
      issuerFeeInBaseCurrency: { amount: (parseFloat(amount) * 0.002).toFixed(2), currency: 'USD' },
      ejaraFeeInBaseCurrency: { amount: '0.00', currency: 'USD' },
      providerReference: `PROV-${id.toString().padStart(8, '0')}`,
      clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
      senderServiceProviderId: Math.floor(Math.random() * 5) + 1,
      receiverServiceProviderId: Math.floor(Math.random() * 5) + 1,
      providerResponse: { status: 'success', message: 'Transaction processed' },
      providerWebhookResponse: {},
      providerCronCheckResponse: {},
      reconciliationResponse: {},
      metadata: {
        source: 'web',
        device: 'desktop',
        userAgent: 'Mozilla/5.0'
      }
    };
  }

  /**
   * Get status label from status value
   * 
   * @param status - Status value
   * @returns Human-readable status label
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'initiated': 'Initiated',
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  }

  /**
   * Get paginated transactions with filters
   * 
   * Simulates API behavior with filtering and pagination
   * 
   * @param filters - Filter parameters
   * @param delayMs - Simulated network delay in milliseconds
   * @returns Observable<GimacTransactionResponse>
   */
  getTransactions(
    filters: GimacTransactionFilterParams,
    delayMs: number = 800
  ): Observable<GimacTransactionResponse> {
    // Apply filters
    let filteredTransactions = this.applyFilters(this.mockTransactions, filters);
    
    // Calculate pagination
    const limit = filters.limit || 20;
    const pageNumber = filters.pageNumber || 1;
    const totalCount = filteredTransactions.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get page data
    const startIndex = (pageNumber - 1) * limit;
    const endIndex = startIndex + limit;
    const pageData = filteredTransactions.slice(startIndex, endIndex);
    
    // Build pagination info
    const paginationInfo: PaginationInfo = {
      currentPageNumber: pageNumber,
      totalPages,
      previousPageNumber: pageNumber > 1 ? pageNumber - 1 : 0,
      nextPageNumber: pageNumber < totalPages ? pageNumber + 1 : 0
    };
    
    // Build response
    const response: GimacTransactionResponse = {
      message: 'Transactions retrieved successfully',
      data: pageData,
      count: pageData.length,
      totalCount,
      page: paginationInfo
    };
    
    // Return with delay to simulate network
    return of(response).pipe(delay(delayMs));
  }

  /**
   * Apply filters to transaction list
   * 
   * @param transactions - Full transaction list
   * @param filters - Filter parameters
   * @returns Filtered transaction list
   */
  private applyFilters(
    transactions: GimacTransaction[],
    filters: GimacTransactionFilterParams
  ): GimacTransaction[] {
    let filtered = [...transactions];
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(t => 
        (t.status as any).value === filters.status
      );
    }
    
    // Filter by gimacSupportedServiceId
    if (filters.gimacSupportedServiceId) {
      filtered = filtered.filter(t => 
        t.gimacSupportedServiceId === filters.gimacSupportedServiceId
      );
    }
    
    // Filter by sender account identifier
    if (filters.senderAccountIdentifier) {
      filtered = filtered.filter(t => 
        t.senderAccountIdentifier.toLowerCase().includes(filters.senderAccountIdentifier!.toLowerCase())
      );
    }
    
    // Filter by receiver account identifier
    if (filters.receiverAccountIdentifier) {
      filtered = filtered.filter(t => 
        t.receiverAccountIdentifier.toLowerCase().includes(filters.receiverAccountIdentifier!.toLowerCase())
      );
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(t => new Date(t.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(t => new Date(t.createdAt) <= toDate);
    }
    
    // Filter by keyword (searches multiple fields)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(t => 
        t.internalReference.toLowerCase().includes(keyword) ||
        t.externalReference.toLowerCase().includes(keyword) ||
        t.senderAccountIdentifier.toLowerCase().includes(keyword) ||
        t.receiverAccountIdentifier.toLowerCase().includes(keyword)
      );
    }
    
    // Sort by created date (newest first)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filtered;
  }

  /**
   * Get transaction by ID
   * 
   * @param id - Transaction ID
   * @param delayMs - Simulated network delay
   * @returns Observable with transaction data
   */
  getTransactionById(id: number, delayMs: number = 500): Observable<GimacTransaction | null> {
    const transaction = this.mockTransactions.find(t => t.id === id);
    return of(transaction || null).pipe(delay(delayMs));
  }

  /**
   * Generate random transactions (for testing dynamic updates)
   * 
   * @param count - Number of transactions to generate
   * @param delayMs - Simulated network delay
   * @returns Observable with new transactions
   */
  generateRandomTransactions(count: number, delayMs: number = 800): Observable<GimacTransaction[]> {
    const newTransactions: GimacTransaction[] = [];
    const startId = this.mockTransactions.length + 1;
    
    for (let i = 0; i < count; i++) {
      newTransactions.push(this.generateMockTransaction(startId + i));
    }
    
    // Add to mock data
    this.mockTransactions.push(...newTransactions);
    
    return of(newTransactions).pipe(delay(delayMs));
  }

  /**
   * Reset mock data to initial state
   * Useful for testing
   */
  resetMockData(): void {
    this.initializeMockData();
  }

  /**
   * Get statistics for mock transactions
   * Useful for debugging
   * 
   * @returns Statistics object
   */
  getStatistics(): {
    total: number;
    byStatus: Record<string, number>;
  } {
    const byStatus: Record<string, number> = {};
    
    this.mockTransactions.forEach(t => {
      const status = (t.status as any).value;
      byStatus[status] = (byStatus[status] || 0) + 1;
    });
    
    return {
      total: this.mockTransactions.length,
      byStatus
    };
  }
}