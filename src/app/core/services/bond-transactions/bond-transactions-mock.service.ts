import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
    BondTransaction,
    TransactionsResponse,
    TransactionFilterParams,
    TransactionStats
} from '@core/models/bond-transaction.models';

@Injectable({
    providedIn: 'root'
})
export class BondTransactionsMockService {
    private mockTransactions: BondTransaction[] = this.generateMockTransactions();

    /**
     * Get bond transactions with filtering and pagination
     */
    getTransactions(params: TransactionFilterParams = {}): Observable<TransactionsResponse> {
        return of(null).pipe(
            delay(800),
            map(() => {
                let filtered = [...this.mockTransactions];

                // Apply filters
                if (params.status) {
                    filtered = filtered.filter(t => t.status === params.status);
                }

                if (params.type) {
                    filtered = filtered.filter(t => t.type === params.type);
                }

                if (params.bondId) {
                    filtered = filtered.filter(t => t.bondId === params.bondId);
                }

                if (params.partnerId) {
                    filtered = filtered.filter(t => t.partnerId === params.partnerId);
                }

                if (params.customerId) {
                    filtered = filtered.filter(t => t.customerId === params.customerId);
                }

                if (params.dateFrom) {
                    filtered = filtered.filter(t => new Date(t.dateCreated) >= new Date(params.dateFrom!));
                }

                if (params.dateTo) {
                    filtered = filtered.filter(t => new Date(t.dateCreated) <= new Date(params.dateTo!));
                }

                // Sort
                filtered.sort((a, b) => {
                    const dateA = new Date(a.dateCreated).getTime();
                    const dateB = new Date(b.dateCreated).getTime();
                    return dateB - dateA;
                });

                // Pagination
                const limit = params.limit || 20;
                const offset = params.offset || 0;
                const total = filtered.length;
                const paginated = filtered.slice(offset, offset + limit);

                return {
                    message: "Bond transactions successfuly loaded",
                    data: paginated,
                    total,
                    limit,
                    offset
                };
            })
        );
    }

    /**
     * Get transaction by ID
     */
    getTransactionById(transactionId: number): Observable<BondTransaction> {
        return of(null).pipe(
            delay(500),
            map(() => {
                const transaction = this.mockTransactions.find(t => t.id === transactionId);
                if (!transaction) {
                    throw new Error('Transaction not found');
                }
                return transaction;
            })
        );
    }

    /**
     * Get transaction statistics
     */
    getTransactionStats(params: TransactionFilterParams = {}): Observable<TransactionStats> {
        return of(null).pipe(
            delay(600),
            map(() => {
                let filtered = [...this.mockTransactions];

                // Apply same filters as getTransactions
                if (params.bondId) {
                    filtered = filtered.filter(t => t.bondId === params.bondId);
                }

                if (params.partnerId) {
                    filtered = filtered.filter(t => t.partnerId === params.partnerId);
                }

                if (params.customerId) {
                    filtered = filtered.filter(t => t.customerId === params.customerId);
                }

                if (params.dateFrom) {
                    filtered = filtered.filter(t => new Date(t.dateCreated) >= new Date(params.dateFrom!));
                }

                if (params.dateTo) {
                    filtered = filtered.filter(t => new Date(t.dateCreated) <= new Date(params.dateTo!));
                }

                const totalTransactions = filtered.length;
                const totalVolume = filtered.reduce((sum, t) => sum + t.amount, 0);
                const pendingCount = filtered.filter(t => t.status === 'pending').length;
                const confirmedCount = filtered.filter(t => t.status === 'confirmed').length;
                const failedCount = filtered.filter(t => t.status === 'failed').length;
                const purchaseVolume = filtered
                    .filter(t => t.type === 'purchase')
                    .reduce((sum, t) => sum + t.amount, 0);
                const withdrawalVolume = filtered
                    .filter(t => t.type === 'withdrawal')
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    totalPurchases:200000,
                    totalTransactions,
                    totalVolume,
                    pendingCount,
                    confirmedCount,
                    failedCount,
                    processingCount: filtered.filter(t => t.status === 'processing').length,
                    purchaseVolume,
                    withdrawalVolume,
                    totalWithdrawals:90499,
                    averageTransactionAmount: totalVolume / totalTransactions || 0,
                    averageTransactionSize: 8990
                };
            })
        );
    }

    /**
     * Generate mock transactions
     */
    private generateMockTransactions(): BondTransaction[] {
        const transactions: BondTransaction[] = [];
        const statuses: Array<'pending' | 'confirmed' | 'failed' | 'processing'> = ['pending', 'confirmed', 'failed', 'processing'];
        const types: Array<'purchase' | 'withdrawal'> = ['purchase', 'withdrawal'];

        const bonds = [
            { id: 1, name: 'Government Treasury Bond 2024', code: 'GTB2024' },
            { id: 2, name: 'Corporate Infrastructure Bond', code: 'CIB2024' },
            { id: 3, name: 'Green Energy Investment Bond', code: 'GEB2024' },
            { id: 4, name: 'Municipal Development Bond', code: 'MDB2024' },
            { id: 6, name: 'Agricultural Development Bond', code: 'ADB2024' }
        ];

        const partners = [
            { id: 1, name: 'FinTech Solutions Ltd' },
            { id: 2, name: 'Digital Payments Corp' },
            { id: 3, name: 'MobileMoney Gateway' },
            { id: 4, name: 'Investment Platform Inc' },
            { id: 6, name: 'AgriFinance Solutions' }
        ];

        const customers = [
            { id: 1, name: 'Jean Kamga', email: 'jean.kamga@email.com' },
            { id: 2, name: 'Marie Ngono', email: 'marie.ngono@email.com' },
            { id: 3, name: 'Paul Mbarga', email: 'paul.mbarga@email.com' },
            { id: 5, name: 'Daniel Fouda', email: 'daniel.fouda@email.com' },
            { id: 7, name: 'Eric Tchoua', email: 'eric.tchoua@email.com' }
        ];

        // Generate 100 transactions
        for (let i = 1; i <= 100; i++) {
            const bond = bonds[Math.floor(Math.random() * bonds.length)];
            const partner = partners[Math.floor(Math.random() * partners.length)];
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = Math.floor(Math.random() * 4900000) + 100000; // 100K to 5M
            const units = Math.floor(amount / 10000);

            // Generate date within last 90 days
            const daysAgo = Math.floor(Math.random() * 90);
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - daysAgo);

            const transaction: BondTransaction = {
                id: i,
                reference: `BT${String(i).padStart(6, '0')}`,
                type,
                status,
                bondId: bond.id,
                bondName: bond.name,
                bondCode: bond.code,
                partnerId: partner.id,
                partnerName: partner.name,
                customerId: customer.id,
                customerName: customer.name,
                customerEmail: customer.email,
                amount,
                units,
                pricePerUnit: 10000,
                currency: 'XAF',
                commission: amount * 0.025,
                commissionRate: 2.5,
                fees: amount * 0.005,
                netAmount: type === 'purchase' ? amount + (amount * 0.005) : amount - (amount * 0.005),
                paymentMethod: Math.random() > 0.5 ? 'mobile_money' : 'bank_transfer',
                paymentReference: `PAY${String(i).padStart(8, '0')}`,
                dateCreated: createdDate.toISOString(),
                lastUpdated: createdDate.toISOString(),
                fee: 0,
                totalAmount: 0,
                paymentStatus: 'pending',
                blockchainStatus: 'pending'
            };

            transactions.push(transaction);
        }

        return transactions;
    }
}