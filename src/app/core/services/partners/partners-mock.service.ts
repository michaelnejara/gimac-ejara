import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Partner,
  PartnerDetail,
  AllowedBond,
  PartnersResponse,
  PartnerResponse,
  CreatePartnerRequest,
  CreatePartnerResponse,
  UpdatePartnerRequest,
  UpdatePartnerResponse,
  UpdatePartnerStatusRequest,
  StatusUpdateResponse,
  PartnerFilterParams,
  PartnerStatistics,
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
      name: 'Acme Financial Services',
      code: 'ACME001',
      apiKey: 'pk_live_abc123xyz789',
      webhookUrl: 'https://acme.example.com/webhook',
      allowedIpAddresses: ['192.168.1.1', '10.0.0.1'],
      commissionRate: 5.5,
      settlementAccount: 'ACC123456',
      minTransactionAmount: 10000,
      maxTransactionAmount: 10000000,
      dailyTransactionLimit: 50000000,
      monthlyTransactionLimit: 500000000,
      status: 'active',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-03-20T14:45:00.000Z',
      allowedBonds: [
        { id: 1, name: 'Treasury Bond 2024' },
        { id: 2, name: 'Corporate Bond Series A' }
      ]
    },
    {
      id: 2,
      name: 'Global Investment Partners',
      code: 'GLIP002',
      apiKey: 'pk_live_def456uvw123',
      webhookUrl: 'https://globalinvest.example.com/webhook',
      allowedIpAddresses: ['203.0.113.0'],
      commissionRate: 4,
      settlementAccount: 'ACC789012',
      minTransactionAmount: 50000,
      maxTransactionAmount: 50000000,
      dailyTransactionLimit: 100000000,
      monthlyTransactionLimit: 1000000000,
      status: 'active',
      createdAt: '2024-02-10T08:15:00.000Z',
      updatedAt: '2024-03-18T16:20:00.000Z',
      allowedBonds: [
        { id: 1, name: 'Treasury Bond 2024' },
        { id: 3, name: 'Municipal Bond 2024' }
      ]
    }
  ];

  private currentId = 3;

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
            (p.settlementAccount && p.settlementAccount.toLowerCase().includes(keyword))
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
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
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
          message: 'Partners retrieved successfully',
          data: paginatedPartners,
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
   * Get partner by ID - returns full PartnerDetail
   */
  getPartnerById(partnerId: number): Observable<PartnerResponse> {
    return of(this.mockPartners).pipe(
      delay(500),
      map(partners => {
        const partner = partners.find(p => p.id === partnerId);
        if (!partner) {
          throw new Error(`Partner with ID ${partnerId} not found`);
        }

        // Convert to PartnerDetail with additional fields
        const partnerDetail: PartnerDetail = {
          ...partner,
          apiSecret: '$2b$10$hashedSecretValue...',
          description: 'Leading financial services provider',
          preferredLanguage: 'en',
          address: '123 Business Street',
          city: 'Douala',
          state: 'Littoral',
          country: 'Cameroon',
          postalCode: '00237',
          dateCreated: partner.createdAt,
          dateUpdated: partner.updatedAt,
          createdBy: 12345,
          updatedBy: 12345
        };

        return {
          message: 'Partner retrieved successfully',
          data: partnerDetail
        };
      })
    );
  }

  /**
   * Create new partner - returns CreatePartnerResponse
   */
  createPartner(partnerData: CreatePartnerRequest): Observable<CreatePartnerResponse> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const partnerId = this.currentId++;
        const code = this.generatePartnerCode(partnerData.name);
        const newPartner: Partner = {
          id: partnerId,
          name: partnerData.name,
          code,
          status: 'active',
          apiKey: this.generateApiKey(),
          webhookUrl: partnerData.webhookUrl,
          allowedIpAddresses: partnerData.allowedIpAddresses || [],
          allowedBonds: [],
          commissionRate: partnerData.commissionRate,
          settlementAccount: partnerData.settlementAccount || '',
          minTransactionAmount: partnerData.minTransactionAmount,
          maxTransactionAmount: partnerData.maxTransactionAmount || 0,
          dailyTransactionLimit: partnerData.dailyTransactionLimit || 0,
          monthlyTransactionLimit: partnerData.monthlyTransactionLimit || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.mockPartners.unshift(newPartner);

        return {
          message: 'Partner created successfully',
          data: {
            partnerId,
            name: partnerData.name,
            code,
            status: 'active'
          }
        };
      })
    );
  }

  /**
   * Update partner - returns UpdatePartnerResponse
   */
  updatePartner(partnerId: number, partnerData: UpdatePartnerRequest): Observable<UpdatePartnerResponse> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const index = this.mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error('Partner not found');
        }

        const updatedAt = new Date().toISOString();
        const updatedName = partnerData.name || this.mockPartners[index].name;

        this.mockPartners[index] = {
          ...this.mockPartners[index],
          ...partnerData,
          updatedAt
        };

        return {
          message: 'Partner updated successfully',
          data: {
            id: partnerId,
            name: updatedName,
            dateUpdated: updatedAt
          }
        };
      })
    );
  }

  /**
   * Update Partner Status - returns StatusUpdateResponse
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

        this.mockPartners[index] = {
          ...this.mockPartners[index],
          status: statusData.status,
          updatedAt: new Date().toISOString()
        };

        return {
          message: 'Partner status updated successfully'
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
          totalTransactions: 15678,
          totalVolume: 1250000000,
          averageTransactionAmount: 79735,
          activeCustomers: 2340,
          totalCommissionEarned: 68750000,
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
        const currentBondIds = partner.allowedBonds.map(b => b.id);
        const bondsToAssign = bondsData.bondIds.filter(bondId => !currentBondIds.includes(bondId));

        if (bondsToAssign.length === 0) {
          throw new Error('All specified bonds are already assigned to this partner');
        }

        // Add new bonds (create mock AllowedBond objects)
        const newBonds: AllowedBond[] = bondsToAssign.map(id => ({
          id,
          name: `Bond ${id}`
        }));

        this.mockPartners[index] = {
          ...partner,
          allowedBonds: [...partner.allowedBonds, ...newBonds],
          updatedAt: new Date().toISOString()
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
          partner.allowedBonds.some(b => b.id === bondId)
        );

        if (bondsToRemove.length === 0) {
          throw new Error('None of the specified bonds are assigned to this partner');
        }

        // Remove bonds
        const updatedBonds = partner.allowedBonds.filter(
          bond => !bondsData.bondIds.includes(bond.id)
        );

        if (updatedBonds.length === 0) {
          throw new Error('Cannot remove all bonds. Partner must have at least one bond assigned');
        }

        this.mockPartners[index] = {
          ...partner,
          allowedBonds: updatedBonds,
          updatedAt: new Date().toISOString()
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
    const prefix = 'pk_live_';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 24; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + key;
  }

  /**
   * Generate partner code from name
   */
  private generatePartnerCode(name: string): string {
    const words = name.split(' ').filter(w => w.length > 2);
    const acronym = words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
    const randomNum = String(Math.floor(Math.random() * 900) + 100);
    return `${acronym}${randomNum}`;
  }
}
