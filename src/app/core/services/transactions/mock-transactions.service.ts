// src/app/core/services/mock-transactions.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  GimacTransactionResponse, 
  GimacTransaction, 
  GimacTransactionFilterParams,
  PaginationInfo 
} from '@core/models/transaction.models';

/**
 * Mock Transactions Service
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
   */
  private initializeMockData(): void {
    this.mockTransactions = [];
    
    for (let i = 1; i <= this.TOTAL_MOCK_TRANSACTIONS; i++) {
      this.mockTransactions.push(this.generateMockTransaction(i));
    }
  }

  /**
   * Generate a single mock transaction with all required fields
   */
  private generateMockTransaction(id: number): GimacTransaction {
    const statuses = ['initiated', 'pending', 'completed', 'failed', 'cancelled'];
    const statusValue = statuses[Math.floor(Math.random() * statuses.length)];
    
    const currencies = ['USD', 'EUR', 'XAF', 'NGN', 'GHS', 'KES'];
    const senderCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const receiverCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    const amount = (Math.random() * 10000 + 100).toFixed(2);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
    
    const countries = ['CM', 'USA', 'NG', 'GH', 'KE', 'SN'];
    const senderCountry = countries[Math.floor(Math.random() * countries.length)];
    const receiverCountry = countries[Math.floor(Math.random() * countries.length)];

    const paymentTypes = ['mobile', 'bank', 'card', 'wallet'];
    const senderType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
    const receiverType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];

    return {
      id,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      status: { 
        value: statusValue, 
        label: this.getStatusLabel(statusValue) 
      },
      apiClientId: Math.floor(Math.random() * 10) + 1,
      gimacServiceCode: { 
        code: this.getRandomServiceCode(), 
        name: this.getRandomServiceName() 
      },
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
      validatedAt: statusValue === 'completed' ? createdDate.toISOString() : '',
      reconciledAt: statusValue === 'completed' && Math.random() > 0.3 ? createdDate.toISOString() : '',
      webhookSentAt: statusValue === 'completed' && Math.random() > 0.2 ? createdDate.toISOString() : '',
      createdBy: 1,
      senderAccountInfo: {
        name: this.generateRandomName(),
        type: senderType,
        country: senderCountry
      },
      receiverAccountInfo: {
        name: this.generateRandomName(),
        type: receiverType,
        country: receiverCountry
      },
      senderAccountIdentifier: this.generateAccountIdentifier(senderType, senderCountry),
      receiverAccountIdentifier: this.generateAccountIdentifier(receiverType, receiverCountry),
      billInfo: {},
      senderCountryId: Math.floor(Math.random() * 50) + 1,
      receiverCountryId: Math.floor(Math.random() * 50) + 1,
      senderCurrencyId: 1,
      receiverCurrencyId: 2,
      isWebhookSent: statusValue === 'completed' && Math.random() > 0.2,
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
   * Helper methods
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'initiated': 'Initiated',
      'pending': 'Pending Approval',
      'completed': 'Confirmed',
      'failed': 'Failed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  }

  private generateRandomName(): string {
    const firstNames = ['Etienne', 'Simon', 'Edouard', 'Marie', 'Jean', 'Anna', 'Pierre', 'Sophie', 'John', 'Maria'];
    const lastNames = ['Ngongo', 'Beta', 'Franck', 'Dubois', 'Martin', 'Garcia', 'Smith', 'Johnson', 'Doe', 'Brown'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  private getRandomServiceCode(): string {
    const codes = ['TRANSFER', 'PAYMENT', 'WITHDRAWAL', 'DEPOSIT', 'REFUND'];
    return codes[Math.floor(Math.random() * codes.length)];
  }

  private getRandomServiceName(): string {
    const names = ['Money Transfer', 'Bill Payment', 'Cash Withdrawal', 'Deposit', 'Refund'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateAccountIdentifier(type: string, country: string): string {
    if (type === 'mobile') {
      const codes: Record<string, string> = {
        'CM': '+237',
        'NG': '+234',
        'GH': '+233',
        'KE': '+254',
        'SN': '+221',
        'USA': '+1'
      };
      const code = codes[country] || '+237';
      return `${code}6${Math.floor(Math.random() * 100000000)}`;
    }
    if (type === 'email') {
      return `user${Math.floor(Math.random() * 10000)}@example.com`;
    }
    return `ACC${Math.floor(Math.random() * 1000000000)}`;
  }

  /**
   * Get transactions with filters
   */
  getTransactions(
    filters: GimacTransactionFilterParams,
    delayMs: number = 800
  ): Observable<GimacTransactionResponse> {
    let filteredTransactions = this.applyFilters(this.mockTransactions, filters);
    
    const limit = filters.limit || 20;
    const pageNumber = filters.pageNumber || 1;
    const totalCount = filteredTransactions.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    const startIndex = (pageNumber - 1) * limit;
    const endIndex = startIndex + limit;
    const pageData = filteredTransactions.slice(startIndex, endIndex);
    
    const paginationInfo: PaginationInfo = {
      currentPageNumber: pageNumber,
      totalPages,
      previousPageNumber: pageNumber > 1 ? pageNumber - 1 : 0,
      nextPageNumber: pageNumber < totalPages ? pageNumber + 1 : 0
    };
    
    const response: GimacTransactionResponse = {
      message: 'Transactions retrieved successfully',
      data: pageData,
      count: pageData.length,
      totalCount,
      page: paginationInfo
    };
    
    return of(response).pipe(delay(delayMs));
  }

  /**
   * Apply filters
   */
  private applyFilters(
    transactions: GimacTransaction[],
    filters: GimacTransactionFilterParams
  ): GimacTransaction[] {
    let filtered = [...transactions];
    
    if (filters.status) {
      filtered = filtered.filter(t => {
        const status = typeof t.status === 'object' ? (t.status as any).value : t.status;
        return status === filters.status;
      });
    }
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(t => 
        t.internalReference.toLowerCase().includes(keyword) ||
        t.externalReference.toLowerCase().includes(keyword) ||
        t.senderAccountIdentifier.toLowerCase().includes(keyword) ||
        t.receiverAccountIdentifier.toLowerCase().includes(keyword) ||
        (t.senderAccountInfo?.['name'] || '').toLowerCase().includes(keyword)
      );
    }
    
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filtered;
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(id: number, delayMs: number = 500): Observable<GimacTransaction | null> {
    const transaction = this.mockTransactions.find(t => t.id === id);
    return of(transaction || null).pipe(delay(delayMs));
  }

  /**
   * Get statistics
   */
  getStatistics(): { total: number; byStatus: Record<string, number> } {
    const byStatus: Record<string, number> = {};
    
    this.mockTransactions.forEach(t => {
      const status = typeof t.status === 'object' ? (t.status as any).value : t.status;
      byStatus[status] = (byStatus[status] || 0) + 1;
    });
    
    return {
      total: this.mockTransactions.length,
      byStatus
    };
  }
}