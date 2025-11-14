// src/app/core/services/mocks/customers-mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Customer,
  CustomerDetails,
  CustomersResponse,
  CustomerFilterParams
} from '@core/models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class CustomersMockService {
  private mockCustomers: Customer[] = [
    {
      id: 1,
      partnerUserId: 'USER001',
      firstName: 'Jean',
      lastName: 'Kamga',
      email: 'jean.kamga@example.com',
      phone: '+237670123456',
      countryCode: 'CM',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      dateCreated: '2023-09-15T10:00:00.000Z'
    },
    {
      id: 2,
      partnerUserId: 'USER002',
      firstName: 'Marie',
      lastName: 'Ngono',
      email: 'marie.ngono@example.com',
      phone: '+237680234567',
      countryCode: 'CM',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      dateCreated: '2023-10-20T11:30:00.000Z'
    },
    {
      id: 3,
      partnerUserId: 'USER003',
      firstName: 'Paul',
      lastName: 'Mbarga',
      email: 'paul.mbarga@example.com',
      phone: '+237690345678',
      countryCode: 'CM',
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      dateCreated: '2023-08-05T09:00:00.000Z'
    },
    {
      id: 4,
      partnerUserId: 'USER004',
      firstName: 'Sophie',
      lastName: 'Nkono',
      email: 'sophie.nkono@example.com',
      phone: '+237655456789',
      countryCode: 'CM',
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      dateCreated: '2024-09-15T14:00:00.000Z'
    },
    {
      id: 5,
      partnerUserId: 'USER005',
      firstName: 'Daniel',
      lastName: 'Fouda',
      email: 'daniel.fouda@example.com',
      phone: '+237677567890',
      countryCode: 'CM',
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      dateCreated: '2024-01-10T10:00:00.000Z'
    },
    {
      id: 6,
      partnerUserId: 'USER006',
      firstName: 'Viviane',
      lastName: 'Bella',
      email: 'viviane.bella@example.com',
      phone: '+237688678901',
      countryCode: 'CM',
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      dateCreated: '2024-02-28T13:00:00.000Z'
    },
    {
      id: 7,
      partnerUserId: 'USER007',
      firstName: 'Eric',
      lastName: 'Tchoua',
      email: 'eric.tchoua@example.com',
      phone: '+237699789012',
      countryCode: 'CM',
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      dateCreated: '2023-12-05T08:30:00.000Z'
    },
    {
      id: 8,
      partnerUserId: 'USER008',
      firstName: 'Claudine',
      lastName: 'Nana',
      email: 'claudine.nana@example.com',
      phone: '+237666890123',
      countryCode: 'CM',
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      dateCreated: '2024-08-20T16:00:00.000Z'
    },
    {
      id: 9,
      partnerUserId: 'USER009',
      firstName: 'Alain',
      lastName: 'Momo',
      email: 'alain.momo@example.com',
      phone: '+237677901234',
      countryCode: 'CM',
      partnerId: 5,
      partnerName: 'AgriFinance Solutions',
      dateCreated: '2024-06-18T09:00:00.000Z'
    },
    {
      id: 10,
      partnerUserId: 'USER010',
      firstName: 'Beatrice',
      lastName: 'Talla',
      email: 'beatrice.talla@example.com',
      phone: '+237688012345',
      countryCode: 'CM',
      partnerId: 5,
      partnerName: 'AgriFinance Solutions',
      dateCreated: '2024-07-22T11:00:00.000Z'
    }
  ];

  // Extended details for specific customers
  private customerDetails: Record<number, CustomerDetails> = {
    1: {
      id: 1,
      partnerUserId: 'USER001',
      firstName: 'Jean',
      lastName: 'Kamga',
      email: 'jean.kamga@example.com',
      phone: '+237670123456',
      countryCode: 'CM',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      partnerCode: 'FINTECH001',
      totalInvestment: 2500000,
      totalInterestEarned: 125000,
      activeBonds: 3,
      dateCreated: '2023-09-15T10:00:00.000Z',
      lastActivityDate: '2024-10-12T14:30:00.000Z'
    },
    2: {
      id: 2,
      partnerUserId: 'USER002',
      firstName: 'Marie',
      lastName: 'Ngono',
      email: 'marie.ngono@example.com',
      phone: '+237680234567',
      countryCode: 'CM',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      partnerCode: 'FINTECH001',
      totalInvestment: 1750000,
      totalInterestEarned: 87500,
      activeBonds: 2,
      dateCreated: '2023-10-20T11:30:00.000Z',
      lastActivityDate: '2024-10-11T09:15:00.000Z'
    },
    3: {
      id: 3,
      partnerUserId: 'USER003',
      firstName: 'Paul',
      lastName: 'Mbarga',
      email: 'paul.mbarga@example.com',
      phone: '+237690345678',
      countryCode: 'CM',
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      partnerCode: 'DIGIPAY001',
      totalInvestment: 3200000,
      totalInterestEarned: 160000,
      activeBonds: 3,
      dateCreated: '2023-08-05T09:00:00.000Z',
      lastActivityDate: '2024-10-13T16:45:00.000Z'
    }
  };

  /**
   * Get customers with filtering and pagination
   */
  getCustomers(params?: CustomerFilterParams): Observable<CustomersResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let filteredCustomers = [...this.mockCustomers];

        // Apply filters
        if (params?.partnerId) {
          filteredCustomers = filteredCustomers.filter(c => c.partnerId === params.partnerId);
        }

        if (params?.countryCode) {
          filteredCustomers = filteredCustomers.filter(c => c.countryCode === params.countryCode);
        }

        if (params?.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredCustomers = filteredCustomers.filter(c =>
            c.firstName.toLowerCase().includes(keyword) ||
            c.lastName.toLowerCase().includes(keyword) ||
            c.email.toLowerCase().includes(keyword) ||
            c.phone.includes(keyword) ||
            c.partnerUserId.toLowerCase().includes(keyword)
          );
        }

        if (params?.customerName) {
          const name = params.customerName.toLowerCase();
          filteredCustomers = filteredCustomers.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(name)
          );
        }

        if (params?.email) {
          filteredCustomers = filteredCustomers.filter(c =>
            c.email.toLowerCase().includes(params.email!.toLowerCase())
          );
        }

        if (params?.phone) {
          filteredCustomers = filteredCustomers.filter(c => c.phone.includes(params.phone!));
        }

        if (params?.partnerUserId) {
          filteredCustomers = filteredCustomers.filter(c =>
            c.partnerUserId.toLowerCase().includes(params.partnerUserId!.toLowerCase())
          );
        }

        // Sort by date created (newest first)
        filteredCustomers.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime();
          const dateB = new Date(b.dateCreated).getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = params?.limit || 20;
        const offset = params?.offset || 0;
        const total = filteredCustomers.length;
        const paginatedCustomers = filteredCustomers.slice(offset, offset + limit);

        return {
          message: 'B2B customers retrieved successfully',
          data: paginatedCustomers,
          meta: {
            total,
            limit,
            offset
          }
        };
      })
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(customerId: number): Observable<CustomerDetails> {
    return of(null).pipe(
      delay(500),
      map(() => {
        // Return detailed customer if available
        if (this.customerDetails[customerId]) {
          return this.customerDetails[customerId];
        }

        // Otherwise create details from basic customer data
        const customer = this.mockCustomers.find(c => c.id === customerId);
        if (!customer) {
          throw new Error('Customer not found');
        }

        // Return customer with extended details
        return {
          ...customer,
          partnerCode: `PARTNER${String(customer.partnerId).padStart(3, '0')}`,
          totalInvestment: Math.floor(Math.random() * 5000000) + 500000,
          totalInterestEarned: Math.floor(Math.random() * 250000) + 25000,
          activeBonds: Math.floor(Math.random() * 5) + 1,
          lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      })
    );
  }
}
