// src/app/core/services/mocks/customers-mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Customer,
  CustomersResponse,
  CustomerFilterParams
} from '@core/models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class CustomersMockService {
  private mockCustomers: Partial<Customer>[] = [
    {
      id: 1,
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      firstName: 'Jean',
      lastName: 'Kamga',
      email: 'jean.kamga@email.com',
      phone: '+237670123456',
      country: 'CM',
      city: 'Douala',
      kycStatus: 'verified',
      activeBonds: [1, 2, 3],
      totalInvestment: 2500000,
      totalTransactions: 45,
      lastTransactionDate: '2024-10-12T14:30:00Z',
      dateCreated: '2023-09-15T10:00:00Z',
      lastActivity: '2024-10-12T14:30:00Z'
    },
    {
      id: 2,
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      firstName: 'Marie',
      lastName: 'Ngono',
      email: 'marie.ngono@email.com',
      phone: '+237680234567',
      country: 'CM',
      city: 'Yaoundé',
      kycStatus: 'verified',
      activeBonds: [1, 4],
      totalInvestment: 1750000,
      totalTransactions: 32,
      lastTransactionDate: '2024-10-11T09:15:00Z',
      dateCreated: '2023-10-20T11:30:00Z',
      lastActivity: '2024-10-11T09:15:00Z'
    },
    {
      id: 3,
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      firstName: 'Paul',
      lastName: 'Mbarga',
      email: 'paul.mbarga@email.com',
      phone: '+237690345678',
      country: 'CM',
      city: 'Bafoussam',
      kycStatus: 'verified',
      activeBonds: [1, 3, 6],
      totalInvestment: 3200000,
      totalTransactions: 67,
      lastTransactionDate: '2024-10-13T16:45:00Z',
      dateCreated: '2023-08-05T09:00:00Z',
      lastActivity: '2024-10-13T16:45:00Z'
    },
    {
      id: 4,
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      firstName: 'Sophie',
      lastName: 'Nkono',
      email: 'sophie.nkono@email.com',
      phone: '+237655456789',
      country: 'CM',
      city: 'Douala',
      kycStatus: 'pending',
      activeBonds: [1],
      totalInvestment: 500000,
      totalTransactions: 8,
      lastTransactionDate: '2024-10-10T12:00:00Z',
      dateCreated: '2024-09-15T14:00:00Z',
      lastActivity: '2024-10-10T12:00:00Z'
    },
    {
      id: 5,
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      firstName: 'Daniel',
      lastName: 'Fouda',
      email: 'daniel.fouda@email.com',
      phone: '+237677567890',
      country: 'CM',
      city: 'Garoua',
      kycStatus: 'verified',
      activeBonds: [2, 4, 5],
      totalInvestment: 1200000,
      totalTransactions: 28,
      lastTransactionDate: '2024-10-13T08:30:00Z',
      dateCreated: '2024-01-10T10:00:00Z',
      lastActivity: '2024-10-13T08:30:00Z'
    },
    {
      id: 6,
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      firstName: 'Viviane',
      lastName: 'Bella',
      email: 'viviane.bella@email.com',
      phone: '+237688678901',
      country: 'CM',
      city: 'Yaoundé',
      kycStatus: 'verified',
      activeBonds: [2, 4],
      totalInvestment: 980000,
      totalTransactions: 19,
      lastTransactionDate: '2024-10-09T15:20:00Z',
      dateCreated: '2024-02-28T13:00:00Z',
      lastActivity: '2024-10-09T15:20:00Z'
    },
    {
      id: 7,
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      firstName: 'Eric',
      lastName: 'Tchoua',
      email: 'eric.tchoua@email.com',
      phone: '+237699789012',
      country: 'CM',
      city: 'Douala',
      kycStatus: 'verified',
      activeBonds: [1, 2, 3, 4, 6],
      totalInvestment: 5600000,
      totalTransactions: 89,
      lastTransactionDate: '2024-10-13T17:00:00Z',
      dateCreated: '2023-12-05T08:30:00Z',
      lastActivity: '2024-10-13T17:00:00Z'
    },
    {
      id: 8,
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      firstName: 'Claudine',
      lastName: 'Nana',
      email: 'claudine.nana@email.com',
      phone: '+237666890123',
      country: 'CM',
      city: 'Bafoussam',
      kycStatus: 'rejected',
      activeBonds: [],
      totalInvestment: 0,
      totalTransactions: 0,
      lastTransactionDate: '',
      dateCreated: '2024-08-20T16:00:00Z',
      lastActivity: '2024-09-01T10:00:00Z'
    },
    {
      id: 9,
      partnerId: 6,
      partnerName: 'AgriFinance Solutions',
      firstName: 'Alain',
      lastName: 'Momo',
      email: 'alain.momo@email.com',
      phone: '+237677901234',
      country: 'CM',
      city: 'Garoua',
      kycStatus: 'verified',
      activeBonds: [6],
      totalInvestment: 850000,
      totalTransactions: 15,
      lastTransactionDate: '2024-10-12T11:45:00Z',
      dateCreated: '2024-06-18T09:00:00Z',
      lastActivity: '2024-10-12T11:45:00Z'
    },
    {
      id: 10,
      partnerId: 6,
      partnerName: 'AgriFinance Solutions',
      firstName: 'Beatrice',
      lastName: 'Talla',
      email: 'beatrice.talla@email.com',
      phone: '+237688012345',
      country: 'CM',
      city: 'Yaoundé',
      kycStatus: 'verified',
      activeBonds: [6],
      totalInvestment: 650000,
      totalTransactions: 12,
      lastTransactionDate: '2024-10-11T14:00:00Z',
      dateCreated: '2024-07-22T11:00:00Z',
      lastActivity: '2024-10-11T14:00:00Z'
    }
  ];

  private currentId = 11;

  /**
   * Get customers with filtering and pagination
   */
  getCustomers(params: CustomerFilterParams): Observable<CustomersResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let filteredCustomers = [...this.mockCustomers];

        // Apply filters
        if (params.partnerId) {
          filteredCustomers = filteredCustomers.filter(c => c.partnerId === params.partnerId);
        }

        // if (params.kycStatus) {
        //   filteredCustomers = filteredCustomers.filter(c => c.kycStatus === params.kycStatus);
        // }

        // if (params.country) {
        //   filteredCustomers = filteredCustomers.filter(c => c.country === params.country);
        // }

        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredCustomers = filteredCustomers.filter(c =>
            c.firstName && c.firstName.toLowerCase().includes(keyword) ||
            c.lastName && c.lastName.toLowerCase().includes(keyword) ||
            c.email && c.email.toLowerCase().includes(keyword) ||
            c.phone && c.phone.includes(keyword)
          );
        }

        if (params.customerName) {
          const name = params.customerName.toLowerCase();
          filteredCustomers = filteredCustomers.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(name)
          );
        }

        if (params.email) {
          filteredCustomers = filteredCustomers.filter(c => 
            c.email && c.email.toLowerCase().includes(params.email!.toLowerCase())
          );
        }

        if (params.phone) {
          filteredCustomers = filteredCustomers.filter(c => c.phone && c.phone.includes(params.phone!));
        }

        // Sort
        filteredCustomers.sort((a, b) => {
          const dateA = new Date(a.dateCreated??'').getTime();
          const dateB = new Date(b.dateCreated??'').getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        const total = filteredCustomers.length;
        const paginatedCustomers = filteredCustomers.slice(offset, offset + limit);

        return {
            message: "Customers loaded successfully",
          data: paginatedCustomers as Customer[],
          total,
          limit,
          offset
        };
      })
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(customerId: number): Observable<Customer> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const customer = this.mockCustomers.find(c => c.id === customerId);
        if (!customer) {
          throw new Error('Customer not found');
        }
        return customer as Customer;
      })
    );
  }
}