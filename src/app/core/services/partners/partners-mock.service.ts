import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Partner,
  PartnersResponse,
  PartnerFilterParams,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  UpdatePartnerStatusRequest,
  StatusUpdateResponse,
  PartnerStatistics,
  PartnerStatus,
  BondAssignmentResponse,
  AssignBondsRequest,
  RemoveBondsRequest
} from '@core/models/partner.models';

@Injectable({
  providedIn: 'root'
})
export class PartnersMockService {
  private mockPartners: Partner[] = [
    {
      id: 1,
      name: 'FinTech Solutions Ltd',
      code: 'FTS-001',
      description: 'Leading financial technology company providing innovative payment solutions',
      status: 'active',
      apiKey: 'fts_live_pk_a1b2c3d4e5f6g7h8i9j0',
      webhookUrl: 'https://fintech-solutions.com/api/webhook',
      allowedIpAddresses: ['192.168.1.100', '10.0.0.50'],
      allowedBonds: [1, 2, 3, 4],
      commissionRate: 2.5,
      settlementAccount: 'ACC-FTS-001',
      minTransactionAmount: 10000,
      maxTransactionAmount: 5000000,
      dailyTransactionLimit: 10000000,
      monthlyTransactionLimit: 250000000,
      address: '123 Business Avenue',
      city: 'Douala',
      state: 'Littoral',
      country: 'CM',
      postalCode: '00237',
      dateCreated: '2023-08-15T10:00:00Z',
      lastUpdated: '2024-10-13T09:00:00Z',
      totalTransactions: 15678,
      totalVolume: 1250000000,
      activeCustomers: 2340,
      lastTransactionAt: '2024-10-13T14:30:00Z'
    },
    {
      id: 2,
      name: 'Digital Payments Corp',
      code: 'DPC-002',
      description: 'Enterprise payment gateway and financial services',
      status: 'active',
      apiKey: 'dpc_live_pk_z9y8x7w6v5u4t3s2r1q0',
      webhookUrl: 'https://digitalpayments.com/webhooks/bonds',
      allowedIpAddresses: ['203.45.67.89', '198.51.100.42'],
      allowedBonds: [1, 3, 6],
      commissionRate: 2.0,
      settlementAccount: 'ACC-DPC-002',
      minTransactionAmount: 5000,
      maxTransactionAmount: 3000000,
      dailyTransactionLimit: 8000000,
      monthlyTransactionLimit: 200000000,
      address: '456 Tech Park Road',
      city: 'Yaoundé',
      state: 'Centre',
      country: 'CM',
      postalCode: '00238',
      dateCreated: '2023-05-20T09:30:00Z',
      lastUpdated: '2024-10-13T10:30:00Z',
      totalTransactions: 23456,
      totalVolume: 1850000000,
      activeCustomers: 3567,
      lastTransactionAt: '2024-10-13T16:45:00Z'
    },
    {
      id: 3,
      name: 'MobileMoney Gateway',
      code: 'MMG-003',
      description: 'Mobile money integration and API services',
      status: 'active',
      apiKey: 'mmg_live_pk_p0o9i8u7y6t5r4e3w2q1',
      webhookUrl: 'https://mobilemoney-gw.com/api/notifications',
      allowedIpAddresses: ['172.16.0.10', '172.16.0.11'],
      allowedBonds: [2, 4, 5],
      commissionRate: 3.0,
      settlementAccount: 'ACC-MMG-003',
      minTransactionAmount: 1000,
      maxTransactionAmount: 1000000,
      dailyTransactionLimit: 5000000,
      monthlyTransactionLimit: 120000000,
      address: '789 Mobile Street',
      city: 'Bafoussam',
      state: 'West',
      country: 'CM',
      postalCode: '00239',
      dateCreated: '2023-11-10T11:00:00Z',
      lastUpdated: '2024-10-13T11:00:00Z',
      totalTransactions: 45789,
      totalVolume: 890000000,
      activeCustomers: 5678,
      lastTransactionAt: '2024-10-13T17:20:00Z'
    },
    {
      id: 4,
      name: 'Investment Platform Inc',
      code: 'IPI-004',
      description: 'Online investment and wealth management platform',
      status: 'active',
      apiKey: 'ipi_live_pk_a1s2d3f4g5h6j7k8l9z0',
      webhookUrl: 'https://investplatform.com/hooks/transactions',
      allowedIpAddresses: ['45.67.89.10'],
      allowedBonds: [1, 2, 3, 4, 6],
      commissionRate: 1.8,
      settlementAccount: 'ACC-IPI-004',
      minTransactionAmount: 50000,
      maxTransactionAmount: 10000000,
      dailyTransactionLimit: 20000000,
      monthlyTransactionLimit: 500000000,
      address: '321 Investment Plaza',
      city: 'Douala',
      state: 'Littoral',
      country: 'CM',
      postalCode: '00237',
      dateCreated: '2024-01-05T08:00:00Z',
      lastUpdated: '2024-10-13T08:00:00Z',
      totalTransactions: 8934,
      totalVolume: 2340000000,
      activeCustomers: 1234,
      lastTransactionAt: '2024-10-13T13:15:00Z'
    },
    {
      id: 5,
      name: 'SecurePay Systems',
      code: 'SPS-005',
      description: 'Secure payment processing and fraud prevention',
      status: 'suspended',
      apiKey: 'sps_live_pk_q1w2e3r4t5y6u7i8o9p0',
      webhookUrl: 'https://securepay.com/api/webhooks',
      allowedIpAddresses: ['104.28.5.67', '104.28.5.68'],
      allowedBonds: [1, 3],
      commissionRate: 2.2,
      settlementAccount: 'ACC-SPS-005',
      minTransactionAmount: 10000,
      maxTransactionAmount: 2000000,
      dailyTransactionLimit: 6000000,
      monthlyTransactionLimit: 150000000,
      address: '654 Security Boulevard',
      city: 'Yaoundé',
      state: 'Centre',
      country: 'CM',
      postalCode: '00238',
      dateCreated: '2023-09-25T14:00:00Z',
      lastUpdated: '2024-10-10T15:00:00Z',
      totalTransactions: 12567,
      totalVolume: 456000000,
      activeCustomers: 1890,
      lastTransactionAt: '2024-10-10T10:30:00Z'
    },
    {
      id: 6,
      name: 'AgriFinance Solutions',
      code: 'AFS-006',
      description: 'Agricultural financing and bond investment platform',
      status: 'active',
      apiKey: 'afs_live_pk_m1n2b3v4c5x6z7a8s9d0',
      webhookUrl: 'https://agrifinance.cm/webhooks/bonds',
      allowedIpAddresses: ['192.0.2.10'],
      allowedBonds: [6],
      commissionRate: 2.8,
      settlementAccount: 'ACC-AFS-006',
      minTransactionAmount: 25000,
      maxTransactionAmount: 4000000,
      dailyTransactionLimit: 7000000,
      monthlyTransactionLimit: 180000000,
      address: '987 Agri Center',
      city: 'Garoua',
      state: 'North',
      country: 'CM',
      postalCode: '00240',
      dateCreated: '2024-06-15T09:00:00Z',
      lastUpdated: '2024-10-13T12:30:00Z',
      totalTransactions: 3456,
      totalVolume: 234000000,
      activeCustomers: 567,
      lastTransactionAt: '2024-10-13T12:00:00Z'
    },
    {
      id: 7,
      name: 'PayTech International',
      code: 'PTI-007',
      description: 'International payment processing and remittance services',
      status: 'inactive',
      apiKey: 'pti_live_pk_x1y2z3a4b5c6d7e8f9g0',
      webhookUrl: 'https://paytech-intl.com/api/callback',
      allowedIpAddresses: ['185.25.48.100'],
      allowedBonds: [1, 2],
      commissionRate: 3.5,
      settlementAccount: 'ACC-PTI-007',
      minTransactionAmount: 50000,
      maxTransactionAmount: 8000000,
      dailyTransactionLimit: 15000000,
      monthlyTransactionLimit: 350000000,
      address: '555 Global Trade Center',
      city: 'Douala',
      state: 'Littoral',
      country: 'CM',
      postalCode: '00237',
      dateCreated: '2023-03-10T12:00:00Z',
      lastUpdated: '2024-08-20T16:00:00Z',
      totalTransactions: 5234,
      totalVolume: 187000000,
      activeCustomers: 456,
      lastTransactionAt: '2024-08-19T11:30:00Z'
    }
  ];

  private currentId = 8;

  /**
   * Get partners with filtering and pagination
   */
  getPartners(params: PartnerFilterParams = {}): Observable<PartnersResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let filteredPartners = [...this.mockPartners];

        // Apply filters
        if (params.status) {
          filteredPartners = filteredPartners.filter(p => p.status === params.status);
        }

        if (params.code) {
          filteredPartners = filteredPartners.filter(p => 
            p.code.toLowerCase().includes(params.code!.toLowerCase())
          );
        }

        if (params.name) {
          filteredPartners = filteredPartners.filter(p => 
            p.name.toLowerCase().includes(params.name!.toLowerCase())
          );
        }

        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredPartners = filteredPartners.filter(p =>
            p.name.toLowerCase().includes(keyword) ||
            p.code.toLowerCase().includes(keyword) ||
            (p.description && p.description.toLowerCase().includes(keyword)) ||
            (p.settlementAccount && p.settlementAccount.toLowerCase().includes(keyword))
          );
        }

        if (params.minCommissionRate !== undefined) {
          filteredPartners = filteredPartners.filter(p => 
            p.commissionRate >= params.minCommissionRate!
          );
        }

        if (params.maxCommissionRate !== undefined) {
          filteredPartners = filteredPartners.filter(p => 
            p.commissionRate <= params.maxCommissionRate!
          );
        }

        if (params.bondId) {
          filteredPartners = filteredPartners.filter(p =>
            p.allowedBonds.includes(params.bondId!)
          );
        }

        // Sort
        const sortBy = params.sortBy || 'dateCreated';
        const sortOrder = params.sortOrder || 'desc';

        filteredPartners.sort((a, b) => {
          let compareValue = 0;

          if (sortBy === 'name') {
            compareValue = a.name.localeCompare(b.name);
          } else if (sortBy === 'dateCreated') {
            const dateA = new Date(a.dateCreated).getTime();
            const dateB = new Date(b.dateCreated).getTime();
            compareValue = dateA - dateB;
          }

          return sortOrder === 'asc' ? compareValue : -compareValue;
        });

        // Pagination
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        const total = filteredPartners.length;
        const paginatedPartners = filteredPartners.slice(offset, offset + limit);

        return {
          message: 'Partners fetched successfully',
          data: paginatedPartners,
          total,
          limit,
          offset
        };
      })
    );
  }

  /**
   * Get partner by ID
   */
  getPartnerById(partnerId: number): Observable<Partner> {
    return of(this.mockPartners).pipe(
      delay(500),
      map(partners => {
        const partner = partners.find(p => p.id === partnerId);
        if (!partner) {
          throw new Error(`Partner with ID ${partnerId} not found`);
        }
        return partner;
      })
    );
  }

  /**
   * Create new partner
   */
  createPartner(partnerData: CreatePartnerRequest): Observable<Partner> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const newPartner: Partner = {
          id: this.currentId++,
          name: partnerData.name,
          code: this.generatePartnerCode(partnerData.name),
          description: partnerData.description,
          status: 'active',
          apiKey: this.generateApiKey(),
          webhookUrl: partnerData.webhookUrl,
          allowedIpAddresses: partnerData.allowedIpAddresses,
          allowedBonds: partnerData.allowedBonds,
          commissionRate: partnerData.commissionRate,
          settlementAccount: partnerData.settlementAccount,
          minTransactionAmount: partnerData.minTransactionAmount,
          maxTransactionAmount: partnerData.maxTransactionAmount,
          dailyTransactionLimit: partnerData.dailyTransactionLimit,
          monthlyTransactionLimit: partnerData.monthlyTransactionLimit,
          address: partnerData.address,
          city: partnerData.city,
          state: partnerData.state,
          country: partnerData.country,
          postalCode: partnerData.postalCode,
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          totalTransactions: 0,
          totalVolume: 0,
          activeCustomers: 0,
          lastTransactionAt: undefined
        };

        this.mockPartners.unshift(newPartner);
        return newPartner;
      })
    );
  }

  /**
   * Update partner
   */
  updatePartner(partnerId: number, partnerData: UpdatePartnerRequest): Observable<Partner> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const index = this.mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error('Partner not found');
        }

        const updatedPartner: Partner = {
          ...this.mockPartners[index],
          ...partnerData,
          lastUpdated: new Date().toISOString()
        };

        this.mockPartners[index] = updatedPartner;
        return updatedPartner;
      })
    );
  }

  /**
   * Update Partner Status
   * Update partner's active/suspended/inactive status with reason
   */
  updatePartnerStatus(
    partnerId: number,
    statusData: UpdatePartnerStatusRequest
  ): Observable<StatusUpdateResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const index = this.mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error('Partner not found');
        }

        const partner = this.mockPartners[index];
        const oldStatus = partner.status;

        // Update status
        this.mockPartners[index] = {
          ...partner,
          status: statusData.status,
          lastUpdated: new Date().toISOString()
        };

        return {
          message: `Partner status updated successfully from ${oldStatus} to ${statusData.status}`,
          data: {
            id: partnerId,
            status: statusData.status,
            updatedAt: new Date().toISOString()
          }
        };
      })
    );
  }

  /**
   * Delete partner
   */
  deletePartner(partnerId: number): Observable<void> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const index = this.mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error('Partner not found');
        }
        this.mockPartners.splice(index, 1);
      })
    );
  }

  /**
   * Get partner statistics
   */
  getPartnerStats(partnerId: number): Observable<PartnerStatistics> {
    return of(null).pipe(
      delay(600),
      map(() => {
        const partner = this.mockPartners.find(p => p.id === partnerId);
        if (!partner) {
          throw new Error('Partner not found');
        }

        return {
          totalTransactions: partner.totalTransactions || 0,
          totalVolume: partner.totalVolume || 0,
          averageTransactionAmount: partner.totalVolume && partner.totalTransactions
            ? partner.totalVolume / partner.totalTransactions
            : 0,
          activeCustomers: partner.activeCustomers || 0,
          totalCommissionEarned: (partner.totalVolume || 0) * (partner.commissionRate / 100),
          monthlyGrowth: 15.5,
          successRate: 98.5
        };
      })
    );
  }

  /**
   * Assign Bonds to Partner
   */
  assignBonds(partnerId: number, bondsData: AssignBondsRequest): Observable<BondAssignmentResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const index = this.mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error('Partner not found');
        }

        const partner = this.mockPartners[index];
        const currentBonds = new Set(partner.allowedBonds);
        const bondsToAssign = bondsData.bondIds.filter(bondId => !currentBonds.has(bondId));

        if (bondsToAssign.length === 0) {
          throw new Error('All specified bonds are already assigned to this partner');
        }

        // Add new bonds
        this.mockPartners[index] = {
          ...partner,
          allowedBonds: [...partner.allowedBonds, ...bondsToAssign],
          lastUpdated: new Date().toISOString()
        };

        return {
          message: `Successfully assigned ${bondsToAssign.length} bond(s) to partner`,
          data: {
            assignedCount: bondsToAssign.length,
            bondIds: bondsToAssign
          }
        };
      })
    );
  }

  /**
   * Remove Bonds from Partner
   */
  removeBonds(partnerId: number, bondsData: RemoveBondsRequest): Observable<BondAssignmentResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const index = this.mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error('Partner not found');
        }

        const partner = this.mockPartners[index];
        const bondsToRemove = bondsData.bondIds.filter(bondId => 
          partner.allowedBonds.includes(bondId)
        );

        if (bondsToRemove.length === 0) {
          throw new Error('None of the specified bonds are assigned to this partner');
        }

        // Remove bonds
        const updatedBonds = partner.allowedBonds.filter(
          bondId => !bondsData.bondIds.includes(bondId)
        );

        if (updatedBonds.length === 0) {
          throw new Error('Cannot remove all bonds. Partner must have at least one bond assigned');
        }

        this.mockPartners[index] = {
          ...partner,
          allowedBonds: updatedBonds,
          lastUpdated: new Date().toISOString()
        };

        return {
          message: `Successfully removed ${bondsToRemove.length} bond(s) from partner`,
          data: {
            removedCount: bondsToRemove.length,
            bondIds: bondsToRemove
          }
        };
      })
    );
  }

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    const prefix = 'ejr_live_pk_';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + key;
  }

  /**
   * Generate partner code from name
   */
  private generatePartnerCode(name: string): string {
    // Extract first 3 letters of significant words
    const words = name.split(' ').filter(w => w.length > 2);
    const acronym = words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
    const randomNum = String(Math.floor(Math.random() * 900) + 100);
    return `${acronym}-${randomNum}`;
  }
}