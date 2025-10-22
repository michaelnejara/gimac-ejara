import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Bond,
  CreateBondRequest,
  UpdateBondRequest,
  BondFilterParams,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  CustomerBondHolding,
  CurrencyCode
} from '@core/models/bond.models';

@Injectable({
  providedIn: 'root'
})
export class BondsMockService {
  private mockBonds: Bond[] = [
    {
      id: 1,
      name: 'Government Treasury Bond 2024',
      code: 'GTB2024',
      descriptionEn: 'Government-backed treasury bond with guaranteed returns',
      descriptionFr: 'Obligation du Trésor soutenue par le gouvernement avec rendements garantis',
      color: '#1976D2',
      amount: 1000000,
      amountPurchased: 325000000,
      availableBalance: 675000000,
      lifetime: 2190, // 6 years in days
      startDate: '2024-01-01',
      maturityDate: '2029-12-31',
      dateCreated: '2024-01-01T10:00:00Z',
      dailyInterest: 0.0151, // 5.5% annual / 365
      interestValue: 5.5,
      maturityPercentage: 33.0,
      unlockingPenaltyRate: 2.0,
      defaultFiatCurrency: 'XAF',
      rank: 1,
      interestCalculationPeriod: 'daily',
      issuerNameEn: 'Government of Cameroon',
      issuerNameFr: 'Gouvernement du Cameroun',
      withdrawalPeriod: 'maturity',
      status: 'active',
      statusColorCode: '#4CAF50'
    },
    {
      id: 2,
      name: 'Corporate Infrastructure Bond',
      code: 'CIB2024',
      descriptionEn: 'Investment in national infrastructure development projects',
      descriptionFr: 'Investissement dans des projets de développement d\'infrastructure nationale',
      color: '#FF6F00',
      amount: 500000,
      amountPurchased: 145000000,
      availableBalance: 55000000,
      lifetime: 1195, // ~3.25 years in days
      startDate: '2024-03-15',
      maturityDate: '2027-06-30',
      dateCreated: '2024-03-15T09:00:00Z',
      dailyInterest: 0.0197,
      interestValue: 7.2,
      maturityPercentage: 25.5,
      unlockingPenaltyRate: 3.5,
      defaultFiatCurrency: 'XAF',
      rank: 2,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'National Infrastructure Corp',
      issuerNameFr: 'Société Nationale d\'Infrastructure',
      withdrawalPeriod: 'anytime',
      status: 'active',
      statusColorCode: '#4CAF50'
    },
    {
      id: 3,
      name: 'Green Energy Investment Bond',
      code: 'GEB2024',
      descriptionEn: 'Sustainable investment in renewable energy projects',
      descriptionFr: 'Investissement durable dans des projets d\'énergie renouvelable',
      color: '#4CAF50',
      amount: 750000,
      amountPurchased: 198000000,
      availableBalance: 102000000,
      lifetime: 1795, // ~4.92 years in days
      startDate: '2024-02-01',
      maturityDate: '2028-12-31',
      dateCreated: '2024-02-01T11:00:00Z',
      dailyInterest: 0.0186,
      interestValue: 6.8,
      maturityPercentage: 34.0,
      unlockingPenaltyRate: 0,
      defaultFiatCurrency: 'XAF',
      rank: 3,
      interestCalculationPeriod: 'quarterly',
      issuerNameEn: 'Cameroon Green Energy Ltd',
      issuerNameFr: 'Énergie Verte du Cameroun Ltée',
      withdrawalPeriod: 'maturity',
      status: 'active',
      statusColorCode: '#4CAF50'
    },
    {
      id: 4,
      name: 'Municipal Development Bond',
      code: 'MDB2024',
      descriptionEn: 'Support local government development initiatives',
      descriptionFr: 'Soutenir les initiatives de développement du gouvernement local',
      color: '#9C27B0',
      amount: 250000,
      amountPurchased: 67000000,
      availableBalance: 33000000,
      lifetime: 1004, // ~2.75 years in days
      startDate: '2024-04-01',
      maturityDate: '2026-12-31',
      dateCreated: '2024-04-01T10:00:00Z',
      dailyInterest: 0.0123,
      interestValue: 4.5,
      maturityPercentage: 12.5,
      unlockingPenaltyRate: 1.5,
      defaultFiatCurrency: 'XAF',
      rank: 4,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'City of Douala',
      issuerNameFr: 'Ville de Douala',
      withdrawalPeriod: 'after_period',
      status: 'active',
      statusColorCode: '#4CAF50'
    },
    {
      id: 5,
      name: 'High Yield Corporate Bond',
      code: 'HYCB2024',
      descriptionEn: 'High return investment with calculated risk',
      descriptionFr: 'Investissement à haut rendement avec risque calculé',
      color: '#F44336',
      amount: 1000000,
      amountPurchased: 92000000,
      availableBalance: 58000000,
      lifetime: 760, // ~2.08 years in days
      startDate: '2024-05-15',
      maturityDate: '2026-06-30',
      dateCreated: '2024-05-15T14:00:00Z',
      dailyInterest: 0.026,
      interestValue: 9.5,
      maturityPercentage: 20.0,
      unlockingPenaltyRate: 5.0,
      defaultFiatCurrency: 'XAF',
      rank: 5,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'Tech Innovation Corp',
      issuerNameFr: 'Société d\'Innovation Technologique',
      withdrawalPeriod: 'anytime',
      status: 'inactive',
      statusColorCode: '#9E9E9E'
    },
    {
      id: 6,
      name: 'Agricultural Development Bond',
      code: 'ADB2024',
      descriptionEn: 'Investment in agricultural modernization and food security',
      descriptionFr: 'Investissement dans la modernisation agricole et la sécurité alimentaire',
      color: '#8BC34A',
      amount: 400000,
      amountPurchased: 123000000,
      availableBalance: 57000000,
      lifetime: 1308, // ~3.58 years in days
      startDate: '2024-06-01',
      maturityDate: '2027-12-31',
      dateCreated: '2024-06-01T10:00:00Z',
      dailyInterest: 0.0164,
      interestValue: 6.0,
      maturityPercentage: 21.5,
      unlockingPenaltyRate: 2.5,
      defaultFiatCurrency: 'XAF',
      rank: 6,
      interestCalculationPeriod: 'quarterly',
      issuerNameEn: 'AgriDev Corporation',
      issuerNameFr: 'Société de Développement Agricole',
      withdrawalPeriod: 'after_period',
      status: 'active',
      statusColorCode: '#4CAF50'
    }
  ];

  // Mock partner bond assignments
  private partnerBondAssignments: Record<number, number[]> = {
    1: [1, 2, 3, 4], // FinTech Solutions Ltd
    2: [1, 3, 6],    // Digital Payments Corp
    3: [2, 4, 5],    // MobileMoney Gateway
    4: [1, 2, 3, 4, 6], // Investment Platform Inc
    5: [1, 3],       // SecurePay Systems
    6: [6]           // AgriFinance Solutions
  };

  // Mock customer bond holdings
  private customerBondHoldings: CustomerBondHolding[] = [
    {
      customerId: 1,
      customerName: 'Jean Kamga',
      partnerUserId: 'USER-FTS-001',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 1500000,
      currentValue: 1575000,
      interestEarned: 75000,
      totalWithdrawn: 0,
      availableBalance: 1575000,
      purchaseDate: '2024-05-15T10:00:00Z',
      maturityDate: '2029-12-31',
      status: 'active'
    },
    {
      customerId: 1,
      customerName: 'Jean Kamga',
      partnerUserId: 'USER-FTS-001',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      bondId: 2,
      bondName: 'Corporate Infrastructure Bond',
      bondCode: 'CIB2024',
      investmentAmount: 500000,
      currentValue: 525000,
      interestEarned: 25000,
      totalWithdrawn: 0,
      availableBalance: 525000,
      purchaseDate: '2024-06-20T14:30:00Z',
      maturityDate: '2027-06-30',
      status: 'active'
    },
    {
      customerId: 2,
      customerName: 'Marie Ngono',
      partnerUserId: 'USER-FTS-002',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 1200000,
      currentValue: 1260000,
      interestEarned: 60000,
      totalWithdrawn: 0,
      availableBalance: 1260000,
      purchaseDate: '2024-04-10T11:00:00Z',
      maturityDate: '2029-12-31',
      status: 'active'
    },
    {
      customerId: 3,
      customerName: 'Paul Mbarga',
      partnerUserId: 'USER-DPC-001',
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      bondId: 3,
      bondName: 'Green Energy Investment Bond',
      bondCode: 'GEB2024',
      investmentAmount: 1500000,
      currentValue: 1632000,
      interestEarned: 132000,
      totalWithdrawn: 0,
      availableBalance: 1632000,
      purchaseDate: '2024-04-10T09:15:00Z',
      maturityDate: '2028-12-31',
      status: 'active'
    },
    {
      customerId: 3,
      customerName: 'Paul Mbarga',
      partnerUserId: 'USER-DPC-001',
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      bondId: 6,
      bondName: 'Agricultural Development Bond',
      bondCode: 'ADB2024',
      investmentAmount: 800000,
      currentValue: 848000,
      interestEarned: 48000,
      totalWithdrawn: 0,
      availableBalance: 848000,
      purchaseDate: '2024-07-05T14:00:00Z',
      maturityDate: '2027-12-31',
      status: 'active'
    },
    {
      customerId: 5,
      customerName: 'Daniel Fouda',
      partnerUserId: 'USER-MMG-001',
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      bondId: 2,
      bondName: 'Corporate Infrastructure Bond',
      bondCode: 'CIB2024',
      investmentAmount: 600000,
      currentValue: 643200,
      interestEarned: 43200,
      totalWithdrawn: 0,
      availableBalance: 643200,
      purchaseDate: '2024-05-20T10:30:00Z',
      maturityDate: '2027-06-30',
      status: 'active'
    },
    {
      customerId: 6,
      customerName: 'Viviane Bella',
      partnerUserId: 'USER-MMG-002',
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      bondId: 4,
      bondName: 'Municipal Development Bond',
      bondCode: 'MDB2024',
      investmentAmount: 300000,
      currentValue: 313500,
      interestEarned: 13500,
      totalWithdrawn: 0,
      availableBalance: 313500,
      purchaseDate: '2024-06-01T09:00:00Z',
      maturityDate: '2026-12-31',
      status: 'active'
    },
    {
      customerId: 7,
      customerName: 'Eric Tchoua',
      partnerUserId: 'USER-IPI-001',
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 3000000,
      currentValue: 3150000,
      interestEarned: 150000,
      totalWithdrawn: 0,
      availableBalance: 3150000,
      purchaseDate: '2024-03-10T08:00:00Z',
      maturityDate: '2029-12-31',
      status: 'active'
    },
    {
      customerId: 7,
      customerName: 'Eric Tchoua',
      partnerUserId: 'USER-IPI-001',
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      bondId: 3,
      bondName: 'Green Energy Investment Bond',
      bondCode: 'GEB2024',
      investmentAmount: 2000000,
      currentValue: 2136000,
      interestEarned: 136000,
      totalWithdrawn: 0,
      availableBalance: 2136000,
      purchaseDate: '2024-03-25T10:30:00Z',
      maturityDate: '2028-12-31',
      status: 'active'
    },
    {
      customerId: 9,
      customerName: 'Alain Momo',
      partnerUserId: 'USER-AFS-001',
      partnerId: 6,
      partnerName: 'AgriFinance Solutions',
      bondId: 6,
      bondName: 'Agricultural Development Bond',
      bondCode: 'ADB2024',
      investmentAmount: 500000,
      currentValue: 530000,
      interestEarned: 30000,
      totalWithdrawn: 0,
      availableBalance: 530000,
      purchaseDate: '2024-07-01T11:00:00Z',
      maturityDate: '2027-12-31',
      status: 'active'
    },
    {
      customerId: 10,
      customerName: 'Beatrice Talla',
      partnerUserId: 'USER-AFS-002',
      partnerId: 6,
      partnerName: 'AgriFinance Solutions',
      bondId: 6,
      bondName: 'Agricultural Development Bond',
      bondCode: 'ADB2024',
      investmentAmount: 350000,
      currentValue: 371000,
      interestEarned: 21000,
      totalWithdrawn: 0,
      availableBalance: 371000,
      purchaseDate: '2024-07-22T13:30:00Z',
      maturityDate: '2027-12-31',
      status: 'active'
    },
    {
      customerId: 1,
      customerName: 'Jean Kamga',
      partnerUserId: 'USER-FTS-003',
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      bondId: 3,
      bondName: 'Green Energy Investment Bond',
      bondCode: 'GEB2024',
      investmentAmount: 500000,
      currentValue: 450000,
      interestEarned: 34000,
      totalWithdrawn: 84000,
      availableBalance: 450000,
      purchaseDate: '2024-03-15T10:00:00Z',
      maturityDate: '2028-12-31',
      status: 'active'
    },
    {
      customerId: 3,
      customerName: 'Paul Mbarga',
      partnerUserId: 'USER-DPC-002',
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 900000,
      currentValue: 0,
      interestEarned: 49500,
      totalWithdrawn: 949500,
      availableBalance: 0,
      purchaseDate: '2024-02-10T09:00:00Z',
      maturityDate: '2029-12-31',
      status: 'matured'
    }
  ];

  private currentId = 7;

  /**
   * Get All Bonds (Admin)
   * Matches BondsService.getBonds() return type
   */
  getBonds(filters?: BondFilterParams): Observable<{ bonds: Bond[]; total: number; limit: number; offset: number }> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let filteredBonds = [...this.mockBonds];

        // Apply filters
        if (filters?.status) {
          filteredBonds = filteredBonds.filter(b => b.status === filters.status);
        }

        if (filters?.bondCode) {
          filteredBonds = filteredBonds.filter(b =>
            b.code.toLowerCase().includes(filters.bondCode!.toLowerCase())
          );
        }

        if (filters?.bondName) {
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(filters.bondName!.toLowerCase())
          );
        }

        if (filters?.fiatCurrency) {
          filteredBonds = filteredBonds.filter(b => b.defaultFiatCurrency === filters.fiatCurrency);
        }

        if (filters?.issuer) {
          filteredBonds = filteredBonds.filter(b =>
            b.issuerNameEn.toLowerCase().includes(filters.issuer!.toLowerCase()) ||
            b.issuerNameFr.toLowerCase().includes(filters.issuer!.toLowerCase())
          );
        }

        if (filters?.keyword) {
          const keyword = filters.keyword.toLowerCase();
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(keyword) ||
            b.code.toLowerCase().includes(keyword) ||
            b.issuerNameEn.toLowerCase().includes(keyword) ||
            b.issuerNameFr.toLowerCase().includes(keyword) ||
            b.descriptionEn.toLowerCase().includes(keyword) ||
            b.descriptionFr.toLowerCase().includes(keyword)
          );
        }

        if (filters?.startDate) {
          filteredBonds = filteredBonds.filter(b =>
            new Date(b.startDate) >= new Date(filters.startDate!)
          );
        }

        if (filters?.endDate) {
          filteredBonds = filteredBonds.filter(b =>
            new Date(b.startDate) <= new Date(filters.endDate!)
          );
        }

        if (filters?.startMaturityDate) {
          filteredBonds = filteredBonds.filter(b =>
            new Date(b.maturityDate) >= new Date(filters.startMaturityDate!)
          );
        }

        if (filters?.endMaturityDate) {
          filteredBonds = filteredBonds.filter(b =>
            new Date(b.maturityDate) <= new Date(filters.endMaturityDate!)
          );
        }

        // Sort by creation date (newest first)
        filteredBonds.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime();
          const dateB = new Date(b.dateCreated).getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = filters?.limit || 20;
        const offset = filters?.offset || 0;
        const total = filteredBonds.length;
        const bonds = filteredBonds.slice(offset, offset + limit);

        return {
          bonds,
          total,
          limit,
          offset
        };
      })
    );
  }

  /**
   * Get Bond by ID
   * Matches BondsService.getBondById() return type
   */
  getBondById(bondId: number): Observable<Bond> {
    return of(this.mockBonds).pipe(
      delay(500),
      map(bonds => {
        const bond = bonds.find(b => b.id === bondId);
        if (!bond) {
          throw new Error(`Bond with ID ${bondId} not found`);
        }
        return bond;
      })
    );
  }

  /**
   * Create New Bond
   * Matches BondsService.createBond() return type
   */
  createBond(bondData: CreateBondRequest): Observable<{ message: string }> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Calculate lifetime in days from tenor (months)
        const lifetime = bondData.tenor * 30;

        const newBond: Bond = {
          id: this.currentId++,
          name: bondData.name,
          code: bondData.code,
          descriptionEn: bondData.description || '',
          descriptionFr: '',
          color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
          amount: bondData.principalAmount,
          amountPurchased: 0,
          availableBalance: bondData.principalAmount,
          lifetime: lifetime,
          startDate: bondData.issueDate,
          maturityDate: bondData.maturityDate,
          dateCreated: new Date().toISOString(),
          dailyInterest: bondData.interestRate / 365,
          interestValue: bondData.interestRate,
          maturityPercentage: bondData.couponRate,
          unlockingPenaltyRate: 0,
          defaultFiatCurrency: bondData.fiatCurrency as CurrencyCode,
          rank: this.mockBonds.length + 1,
          interestCalculationPeriod: 'daily',
          issuerNameEn: bondData.issuer,
          issuerNameFr: '',
          withdrawalPeriod: 'maturity',
          status: bondData.status,
          statusColorCode: bondData.status === 'active' ? '#4CAF50' : '#9E9E9E'
        };

        this.mockBonds.unshift(newBond);
        return { message: 'Bond created successfully' };
      })
    );
  }

  /**
   * Update Bond
   * Matches BondsService.updateBond() return type
   */
  updateBond(bondId: number, bondData: UpdateBondRequest): Observable<{ message: string }> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const index = this.mockBonds.findIndex(b => b.id === bondId);
        if (index === -1) {
          throw new Error('Bond not found');
        }

        const existingBond = this.mockBonds[index];

        // Update only provided fields
        const updatedBond: Bond = {
          ...existingBond,
          ...(bondData.name && { name: bondData.name }),
          ...(bondData.description && { descriptionEn: bondData.description }),
          ...(bondData.principalAmount && {
            amount: bondData.principalAmount,
            availableBalance: bondData.principalAmount - existingBond.amountPurchased
          }),
          ...(bondData.interestRate && {
            interestValue: bondData.interestRate,
            dailyInterest: bondData.interestRate / 365
          }),
          ...(bondData.couponRate && { maturityPercentage: bondData.couponRate }),
          ...(bondData.issueDate && { startDate: bondData.issueDate }),
          ...(bondData.maturityDate && { maturityDate: bondData.maturityDate }),
          ...(bondData.tenor && { lifetime: bondData.tenor * 30 }),
          ...(bondData.fiatCurrency && { defaultFiatCurrency: bondData.fiatCurrency as CurrencyCode }),
          ...(bondData.issuer && { issuerNameEn: bondData.issuer }),
          ...(bondData.status && {
            status: bondData.status,
            statusColorCode: bondData.status === 'active' ? '#4CAF50' : '#9E9E9E'
          })
        };

        this.mockBonds[index] = updatedBond;
        return { message: 'Bond updated successfully' };
      })
    );
  }

  /**
   * Delete Bond
   * Matches BondsService.deleteBond() return type
   */
  deleteBond(bondId: number): Observable<void> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const index = this.mockBonds.findIndex(b => b.id === bondId);
        if (index === -1) {
          throw new Error('Bond not found');
        }
        this.mockBonds.splice(index, 1);
      })
    );
  }

  /**
   * Get Partner Bonds
   * Matches BondsService.getPartnerBonds() return type
   */
  getPartnerBonds(filters: PartnerBondFilterParams): Observable<{ bonds: any[]; total: number; limit: number; offset: number }> {
    return of(null).pipe(
      delay(700),
      map(() => {
        const { partnerId, ...queryParams } = filters;

        // Get bond IDs assigned to this partner
        const assignedBondIds = this.partnerBondAssignments[partnerId] || [];

        // Filter bonds by assigned IDs
        let filteredBonds = this.mockBonds.filter(b =>
          assignedBondIds.includes(b.id)
        );

        // Apply additional filters
        if (queryParams.status) {
          filteredBonds = filteredBonds.filter(b => b.status === queryParams.status);
        }

        if (queryParams.bondCode) {
          filteredBonds = filteredBonds.filter(b =>
            b.code.toLowerCase().includes(queryParams.bondCode!.toLowerCase())
          );
        }

        if (queryParams.bondName) {
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(queryParams.bondName!.toLowerCase())
          );
        }

        if (queryParams.keyword) {
          const keyword = queryParams.keyword.toLowerCase();
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(keyword) ||
            b.code.toLowerCase().includes(keyword) ||
            b.issuerNameEn.toLowerCase().includes(keyword)
          );
        }

        // Sort
        filteredBonds.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime();
          const dateB = new Date(b.dateCreated).getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = queryParams.limit || 20;
        const offset = queryParams.offset || 0;
        const total = filteredBonds.length;
        const bonds = filteredBonds.slice(offset, offset + limit).map(bond => ({
          bondId: bond.id,
          bondName: bond.name,
          bondCode: bond.code,
          status: bond.status,
          dateAssigned: bond.dateCreated
        }));

        return {
          bonds,
          total,
          limit,
          offset
        };
      })
    );
  }

  /**
   * Get Customer Bonds
   * Matches BondsService.getCustomerBonds() return type
   */
  getCustomerBonds(filters?: CustomerBondFilterParams): Observable<{ customerBonds: CustomerBondHolding[]; total: number; limit: number; offset: number }> {
    return of(null).pipe(
      delay(700),
      map(() => {
        let filteredHoldings = [...this.customerBondHoldings];

        // Apply filters
        if (filters?.customerId) {
          filteredHoldings = filteredHoldings.filter(h =>
            h.customerId === filters.customerId
          );
        }

        if (filters?.partnerId) {
          filteredHoldings = filteredHoldings.filter(h =>
            h.partnerId === filters.partnerId
          );
        }

        if (filters?.partnerUserId) {
          filteredHoldings = filteredHoldings.filter(h =>
            h.partnerUserId === filters.partnerUserId
          );
        }

        if (filters?.bondId) {
          filteredHoldings = filteredHoldings.filter(h =>
            h.bondId === filters.bondId
          );
        }

        if (filters?.bondName) {
          filteredHoldings = filteredHoldings.filter(h =>
            h.bondName.toLowerCase().includes(filters.bondName!.toLowerCase())
          );
        }

        if (filters?.status) {
          filteredHoldings = filteredHoldings.filter(h =>
            h.status === filters.status
          );
        }

        if (filters?.keyword) {
          const keyword = filters.keyword.toLowerCase();
          filteredHoldings = filteredHoldings.filter(h =>
            h.bondName.toLowerCase().includes(keyword) ||
            h.bondCode.toLowerCase().includes(keyword) ||
            h.customerName.toLowerCase().includes(keyword) ||
            h.partnerName.toLowerCase().includes(keyword)
          );
        }

        // Sort by purchase date (newest first)
        filteredHoldings.sort((a, b) => {
          const dateA = new Date(a.purchaseDate).getTime();
          const dateB = new Date(b.purchaseDate).getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = filters?.limit || 20;
        const offset = filters?.offset || 0;
        const total = filteredHoldings.length;
        const customerBonds = filteredHoldings.slice(offset, offset + limit);

        return {
          customerBonds,
          total,
          limit,
          offset
        };
      })
    );
  }
}
