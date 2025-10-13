// src/app/core/services/mocks/bonds-mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Bond,
  BondsResponse,
  BondFilterParams,
  CreateBondRequest,
  UpdateBondRequest,
  PartnerBondFilterParams,
  CustomerBondFilterParams,
  CustomerBondsResponse,
  CustomerBondHolding,
  CustomerBondStatus,
  CurrencyCode,
  BondStatus,
  BondRiskLevel
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
      description: 'Government-backed treasury bond with guaranteed returns',
      principalAmount: 1000000,
      interestRate: 5.5,
      couponRate: 5.5,
      issueDate: '2024-01-01',
      maturityDate: '2029-12-31',
      valueDate: '2024-01-15',
      tenor: 72, // 6 years in months
      fiatCurrency: 'XAF',
      minPurchaseAmount: 100000,
      maxPurchaseAmount: 10000000,
      amountPurchased: 325000000,
      issuer: 'Government of Cameroon',
      status: 'active',
      riskLevel: 'low',
      dateCreated: '2024-01-01T10:00:00Z',
      lastUpdated: '2024-10-13T08:30:00Z',
      // Backwards compatibility fields
      type: 'government',
      currency: 'XAF',
      faceValue: 1000000,
      currentValue: 1050000,
      minimumInvestment: 100000,
      maximumInvestment: 10000000,
      totalIssued: 500000000,
      totalSubscribed: 325000000,
      availableUnits: 175000,
      features: ['Tax Benefits', 'Fixed Returns', 'Government Guaranteed'],
      earlyRedemptionAllowed: true,
      earlyRedemptionPenalty: 2.0,
      partnerCount: 15,
      customerCount: 2450
    },
    {
      id: 2,
      name: 'Corporate Infrastructure Bond',
      code: 'CIB2024',
      description: 'Investment in national infrastructure development projects',
      principalAmount: 500000,
      interestRate: 7.2,
      couponRate: 7.2,
      issueDate: '2024-03-15',
      maturityDate: '2027-06-30',
      valueDate: '2024-03-20',
      tenor: 39, // 3.25 years in months
      fiatCurrency: 'XAF',
      minPurchaseAmount: 50000,
      maxPurchaseAmount: 5000000,
      amountPurchased: 145000000,
      issuer: 'National Infrastructure Corp',
      status: 'active',
      riskLevel: 'medium',
      dateCreated: '2024-03-15T09:00:00Z',
      lastUpdated: '2024-10-12T14:20:00Z',
      // Backwards compatibility fields
      type: 'corporate',
      currency: 'XAF',
      faceValue: 500000,
      currentValue: 485000,
      minimumInvestment: 50000,
      maximumInvestment: 5000000,
      totalIssued: 200000000,
      totalSubscribed: 145000000,
      availableUnits: 110000,
      features: ['Higher Returns', 'Infrastructure Development', 'Quarterly Interest'],
      earlyRedemptionAllowed: true,
      earlyRedemptionPenalty: 3.5,
      partnerCount: 8,
      customerCount: 1230
    },
    {
      id: 3,
      name: 'Green Energy Investment Bond',
      code: 'GEB2024',
      description: 'Sustainable investment in renewable energy projects',
      principalAmount: 750000,
      interestRate: 6.8,
      couponRate: 6.8,
      issueDate: '2024-02-01',
      maturityDate: '2028-12-31',
      valueDate: '2024-02-10',
      tenor: 59, // 4.92 years in months
      fiatCurrency: 'XAF',
      minPurchaseAmount: 75000,
      maxPurchaseAmount: 7500000,
      amountPurchased: 198000000,
      issuer: 'Cameroon Green Energy Ltd',
      status: 'active',
      riskLevel: 'medium',
      dateCreated: '2024-02-01T11:00:00Z',
      lastUpdated: '2024-10-11T16:45:00Z',
      // Backwards compatibility fields
      type: 'green',
      currency: 'XAF',
      faceValue: 750000,
      currentValue: 765000,
      minimumInvestment: 75000,
      maximumInvestment: 7500000,
      totalIssued: 300000000,
      totalSubscribed: 198000000,
      availableUnits: 136000,
      features: ['ESG Compliant', 'Carbon Credits', 'Green Investment'],
      earlyRedemptionAllowed: false,
      earlyRedemptionPenalty: 0,
      partnerCount: 12,
      customerCount: 1890
    },
    {
      id: 4,
      name: 'Municipal Development Bond',
      code: 'MDB2024',
      description: 'Support local government development initiatives',
      principalAmount: 250000,
      interestRate: 4.5,
      couponRate: 4.5,
      issueDate: '2024-04-01',
      maturityDate: '2026-12-31',
      valueDate: '2024-04-10',
      tenor: 33, // 2.75 years in months
      fiatCurrency: 'XAF',
      minPurchaseAmount: 25000,
      maxPurchaseAmount: 2500000,
      amountPurchased: 67000000,
      issuer: 'City of Douala',
      status: 'active',
      riskLevel: 'low',
      dateCreated: '2024-04-01T10:00:00Z',
      lastUpdated: '2024-10-10T12:00:00Z',
      // Backwards compatibility fields
      type: 'municipal',
      currency: 'XAF',
      faceValue: 250000,
      currentValue: 255000,
      minimumInvestment: 25000,
      maximumInvestment: 2500000,
      totalIssued: 100000000,
      totalSubscribed: 67000000,
      availableUnits: 132000,
      features: ['Low Risk', 'Municipal Support', 'Tax Exempt'],
      earlyRedemptionAllowed: true,
      earlyRedemptionPenalty: 1.5,
      partnerCount: 6,
      customerCount: 890
    },
    {
      id: 5,
      name: 'High Yield Corporate Bond',
      code: 'HYCB2024',
      description: 'High return investment with calculated risk',
      principalAmount: 1000000,
      interestRate: 9.5,
      couponRate: 9.5,
      issueDate: '2024-05-15',
      maturityDate: '2026-06-30',
      valueDate: '2024-05-20',
      tenor: 25, // 2.08 years in months
      fiatCurrency: 'XAF',
      minPurchaseAmount: 100000,
      maxPurchaseAmount: 10000000,
      amountPurchased: 92000000,
      issuer: 'Tech Innovation Corp',
      status: 'inactive',
      riskLevel: 'high',
      dateCreated: '2024-05-15T14:00:00Z',
      lastUpdated: '2024-10-09T09:30:00Z',
      // Backwards compatibility fields
      type: 'corporate',
      currency: 'XAF',
      faceValue: 1000000,
      currentValue: 980000,
      minimumInvestment: 100000,
      maximumInvestment: 10000000,
      totalIssued: 150000000,
      totalSubscribed: 92000000,
      availableUnits: 58000,
      features: ['High Returns', 'Technology Sector', 'Monthly Interest'],
      earlyRedemptionAllowed: true,
      earlyRedemptionPenalty: 5.0,
      partnerCount: 4,
      customerCount: 345
    },
    {
      id: 6,
      name: 'Agricultural Development Bond',
      code: 'ADB2024',
      description: 'Investment in agricultural modernization and food security',
      principalAmount: 400000,
      interestRate: 6.0,
      couponRate: 6.0,
      issueDate: '2024-06-01',
      maturityDate: '2027-12-31',
      valueDate: '2024-06-10',
      tenor: 43, // 3.58 years in months
      fiatCurrency: 'XAF',
      minPurchaseAmount: 40000,
      maxPurchaseAmount: 4000000,
      amountPurchased: 123000000,
      issuer: 'AgriDev Corporation',
      status: 'active',
      riskLevel: 'medium',
      dateCreated: '2024-06-01T10:00:00Z',
      lastUpdated: '2024-10-08T11:20:00Z',
      // Backwards compatibility fields
      type: 'corporate',
      currency: 'XAF',
      faceValue: 400000,
      currentValue: 410000,
      minimumInvestment: 40000,
      maximumInvestment: 4000000,
      totalIssued: 180000000,
      totalSubscribed: 123000000,
      availableUnits: 142500,
      features: ['Agriculture Focus', 'Food Security', 'Rural Development'],
      earlyRedemptionAllowed: true,
      earlyRedemptionPenalty: 2.5,
      partnerCount: 9,
      customerCount: 1567
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

  // Mock customer bond holdings - Using CustomerBondHolding interface
  private customerBondHoldings: CustomerBondHolding[] = [
    {
      id: 1,
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      partnerUserId: 'USER-FTS-001',
      customerId: 1,
      customerName: 'Jean Kamga',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 1500000,
      currentBalance: 1575000,
      interestEarned: 75000,
      withdrawnAmount: 0,
      purchaseDate: '2024-05-15T10:00:00Z',
      maturityDate: '2029-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 2,
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      partnerUserId: 'USER-FTS-001',
      customerId: 1,
      customerName: 'Jean Kamga',
      bondId: 2,
      bondName: 'Corporate Infrastructure Bond',
      bondCode: 'CIB2024',
      investmentAmount: 500000,
      currentBalance: 525000,
      interestEarned: 25000,
      withdrawnAmount: 0,
      purchaseDate: '2024-06-20T14:30:00Z',
      maturityDate: '2027-06-30',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 3,
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      partnerUserId: 'USER-FTS-002',
      customerId: 2,
      customerName: 'Marie Ngono',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 1200000,
      currentBalance: 1260000,
      interestEarned: 60000,
      withdrawnAmount: 0,
      purchaseDate: '2024-04-10T11:00:00Z',
      maturityDate: '2029-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 4,
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      partnerUserId: 'USER-DPC-001',
      customerId: 3,
      customerName: 'Paul Mbarga',
      bondId: 3,
      bondName: 'Green Energy Investment Bond',
      bondCode: 'GEB2024',
      investmentAmount: 1500000,
      currentBalance: 1632000,
      interestEarned: 132000,
      withdrawnAmount: 0,
      purchaseDate: '2024-04-10T09:15:00Z',
      maturityDate: '2028-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 5,
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      partnerUserId: 'USER-DPC-001',
      customerId: 3,
      customerName: 'Paul Mbarga',
      bondId: 6,
      bondName: 'Agricultural Development Bond',
      bondCode: 'ADB2024',
      investmentAmount: 800000,
      currentBalance: 848000,
      interestEarned: 48000,
      withdrawnAmount: 0,
      purchaseDate: '2024-07-05T14:00:00Z',
      maturityDate: '2027-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 6,
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      partnerUserId: 'USER-MMG-001',
      customerId: 5,
      customerName: 'Daniel Fouda',
      bondId: 2,
      bondName: 'Corporate Infrastructure Bond',
      bondCode: 'CIB2024',
      investmentAmount: 600000,
      currentBalance: 643200,
      interestEarned: 43200,
      withdrawnAmount: 0,
      purchaseDate: '2024-05-20T10:30:00Z',
      maturityDate: '2027-06-30',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 7,
      partnerId: 3,
      partnerName: 'MobileMoney Gateway',
      partnerUserId: 'USER-MMG-002',
      customerId: 6,
      customerName: 'Viviane Bella',
      bondId: 4,
      bondName: 'Municipal Development Bond',
      bondCode: 'MDB2024',
      investmentAmount: 300000,
      currentBalance: 313500,
      interestEarned: 13500,
      withdrawnAmount: 0,
      purchaseDate: '2024-06-01T09:00:00Z',
      maturityDate: '2026-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 8,
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      partnerUserId: 'USER-IPI-001',
      customerId: 7,
      customerName: 'Eric Tchoua',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 3000000,
      currentBalance: 3150000,
      interestEarned: 150000,
      withdrawnAmount: 0,
      purchaseDate: '2024-03-10T08:00:00Z',
      maturityDate: '2029-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 9,
      partnerId: 4,
      partnerName: 'Investment Platform Inc',
      partnerUserId: 'USER-IPI-001',
      customerId: 7,
      customerName: 'Eric Tchoua',
      bondId: 3,
      bondName: 'Green Energy Investment Bond',
      bondCode: 'GEB2024',
      investmentAmount: 2000000,
      currentBalance: 2136000,
      interestEarned: 136000,
      withdrawnAmount: 0,
      purchaseDate: '2024-03-25T10:30:00Z',
      maturityDate: '2028-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 10,
      partnerId: 6,
      partnerName: 'AgriFinance Solutions',
      partnerUserId: 'USER-AFS-001',
      customerId: 9,
      customerName: 'Alain Momo',
      bondId: 6,
      bondName: 'Agricultural Development Bond',
      bondCode: 'ADB2024',
      investmentAmount: 500000,
      currentBalance: 530000,
      interestEarned: 30000,
      withdrawnAmount: 0,
      purchaseDate: '2024-07-01T11:00:00Z',
      maturityDate: '2027-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 11,
      partnerId: 6,
      partnerName: 'AgriFinance Solutions',
      partnerUserId: 'USER-AFS-002',
      customerId: 10,
      customerName: 'Beatrice Talla',
      bondId: 6,
      bondName: 'Agricultural Development Bond',
      bondCode: 'ADB2024',
      investmentAmount: 350000,
      currentBalance: 371000,
      interestEarned: 21000,
      withdrawnAmount: 0,
      purchaseDate: '2024-07-22T13:30:00Z',
      maturityDate: '2027-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 12,
      partnerId: 1,
      partnerName: 'FinTech Solutions Ltd',
      partnerUserId: 'USER-FTS-003',
      customerId: 1,
      customerName: 'Jean Kamga',
      bondId: 3,
      bondName: 'Green Energy Investment Bond',
      bondCode: 'GEB2024',
      investmentAmount: 500000,
      currentBalance: 450000,
      interestEarned: 34000,
      withdrawnAmount: 84000,
      purchaseDate: '2024-03-15T10:00:00Z',
      maturityDate: '2028-12-31',
      status: 'active',
      currency: 'XAF'
    },
    {
      id: 13,
      partnerId: 2,
      partnerName: 'Digital Payments Corp',
      partnerUserId: 'USER-DPC-002',
      customerId: 3,
      customerName: 'Paul Mbarga',
      bondId: 1,
      bondName: 'Government Treasury Bond 2024',
      bondCode: 'GTB2024',
      investmentAmount: 900000,
      currentBalance: 0,
      interestEarned: 49500,
      withdrawnAmount: 949500,
      purchaseDate: '2024-02-10T09:00:00Z',
      maturityDate: '2029-12-31',
      status: 'matured',
      currency: 'XAF'
    }
  ];

  private currentId = 7;

  /**
   * Get bonds with filtering and pagination
   */
  getBonds(params: BondFilterParams = {}): Observable<BondsResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let filteredBonds = [...this.mockBonds];

        // Apply filters
        if (params.status) {
          filteredBonds = filteredBonds.filter(b => b.status === params.status);
        }

        if (params.bondCode) {
          filteredBonds = filteredBonds.filter(b => 
            b.code.toLowerCase().includes(params.bondCode!.toLowerCase())
          );
        }

        if (params.bondName) {
          filteredBonds = filteredBonds.filter(b => 
            b.name.toLowerCase().includes(params.bondName!.toLowerCase())
          );
        }

        if (params.fiatCurrency) {
          filteredBonds = filteredBonds.filter(b => b.fiatCurrency === params.fiatCurrency);
        }

        if (params.issuer) {
          filteredBonds = filteredBonds.filter(b => 
            b.issuer.toLowerCase().includes(params.issuer!.toLowerCase())
          );
        }

        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(keyword) ||
            b.code.toLowerCase().includes(keyword) ||
            b.issuer.toLowerCase().includes(keyword) ||
            (b.description && b.description.toLowerCase().includes(keyword))
          );
        }

        if (params.startDate) {
          filteredBonds = filteredBonds.filter(b => 
            new Date(b.issueDate) >= new Date(params.startDate!)
          );
        }

        if (params.endDate) {
          filteredBonds = filteredBonds.filter(b => 
            new Date(b.issueDate) <= new Date(params.endDate!)
          );
        }

        if (params.startMaturityDate) {
          filteredBonds = filteredBonds.filter(b => 
            new Date(b.maturityDate) >= new Date(params.startMaturityDate!)
          );
        }

        if (params.endMaturityDate) {
          filteredBonds = filteredBonds.filter(b => 
            new Date(b.maturityDate) <= new Date(params.endMaturityDate!)
          );
        }

        // Legacy filters for backwards compatibility
        if (params.minValue !== undefined) {
          filteredBonds = filteredBonds.filter(b => 
            b.currentValue && b.currentValue >= params.minValue!
          );
        }

        if (params.maxValue !== undefined) {
          filteredBonds = filteredBonds.filter(b => 
            b.currentValue && b.currentValue <= params.maxValue!
          );
        }

        // Sort by creation date (newest first)
        filteredBonds.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime();
          const dateB = new Date(b.dateCreated).getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        const total = filteredBonds.length;
        const paginatedBonds = filteredBonds.slice(offset, offset + limit);

        return {
          message: 'Bonds fetched successfully',
          data: paginatedBonds,
          total,
          limit,
          offset
        };
      })
    );
  }

  /**
   * Get bond by ID
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
   * Create new bond
   */
  createBond(bondData: CreateBondRequest): Observable<Bond> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const newBond: Bond = {
          id: this.currentId++,
          name: bondData.name,
          code: bondData.code,
          description: bondData.description,
          principalAmount: bondData.principalAmount,
          interestRate: bondData.interestRate,
          couponRate: bondData.couponRate,
          issueDate: bondData.issueDate,
          maturityDate: bondData.maturityDate,
          valueDate: bondData.valueDate,
          tenor: bondData.tenor,
          fiatCurrency: bondData.fiatCurrency,
          minPurchaseAmount: bondData.minPurchaseAmount,
          maxPurchaseAmount: bondData.maxPurchaseAmount,
          amountPurchased: 0,
          issuer: bondData.issuer,
          status: bondData.status,
          riskLevel: bondData.riskLevel,
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          // Backwards compatibility
          type: 'corporate',
          currency: bondData.fiatCurrency,
          faceValue: bondData.principalAmount,
          currentValue: bondData.principalAmount,
          minimumInvestment: bondData.minPurchaseAmount,
          maximumInvestment: bondData.maxPurchaseAmount,
          totalIssued: 0,
          totalSubscribed: 0,
          availableUnits: 0,
          features: [],
          earlyRedemptionAllowed: false,
          earlyRedemptionPenalty: 0,
          partnerCount: 0,
          customerCount: 0
        };

        this.mockBonds.unshift(newBond);
        return newBond;
      })
    );
  }

  /**
   * Update bond
   */
  updateBond(bondId: number, bondData: UpdateBondRequest): Observable<Bond> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const index = this.mockBonds.findIndex(b => b.id === bondId);
        if (index === -1) {
          throw new Error('Bond not found');
        }

        const updatedBond: Bond = {
          ...this.mockBonds[index],
          ...bondData,
          lastUpdated: new Date().toISOString()
        };

        this.mockBonds[index] = updatedBond;
        return updatedBond;
      })
    );
  }

  /**
   * Delete bond
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
   * Assign bond to partner
   */
  assignBondToPartner(bondId: number, partnerId: number): Observable<void> {
    return of(null).pipe(
      delay(600),
      map(() => {
        const bond = this.mockBonds.find(b => b.id === bondId);
        if (!bond) {
          throw new Error('Bond not found');
        }
        
        // Add to partner assignments
        if (!this.partnerBondAssignments[partnerId]) {
          this.partnerBondAssignments[partnerId] = [];
        }
        
        if (!this.partnerBondAssignments[partnerId].includes(bondId)) {
          this.partnerBondAssignments[partnerId].push(bondId);
          bond.partnerCount = (bond.partnerCount || 0) + 1;
          bond.lastUpdated = new Date().toISOString();
        }
      })
    );
  }

  /**
   * Get Partner Bonds
   */
  getPartnerBonds(params: PartnerBondFilterParams): Observable<BondsResponse> {
    return of(null).pipe(
      delay(700),
      map(() => {
        const { partnerId, ...filterParams } = params;
        
        // Get bond IDs assigned to this partner
        const assignedBondIds = this.partnerBondAssignments[partnerId] || [];
        
        // Filter bonds by assigned IDs
        let filteredBonds = this.mockBonds.filter(b => 
          assignedBondIds.includes(b.id)
        );

        // Apply additional filters
        if (filterParams.status) {
          filteredBonds = filteredBonds.filter(b => b.status === filterParams.status);
        }

        if (filterParams.bondCode) {
          filteredBonds = filteredBonds.filter(b => 
            b.code.toLowerCase().includes(filterParams.bondCode!.toLowerCase())
          );
        }

        if (filterParams.bondName) {
          filteredBonds = filteredBonds.filter(b => 
            b.name.toLowerCase().includes(filterParams.bondName!.toLowerCase())
          );
        }

        if (filterParams.keyword) {
          const keyword = filterParams.keyword.toLowerCase();
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(keyword) ||
            b.code.toLowerCase().includes(keyword) ||
            b.issuer.toLowerCase().includes(keyword)
          );
        }

        // Sort
        filteredBonds.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime();
          const dateB = new Date(b.dateCreated).getTime();
          return dateB - dateA;
        });

        // Pagination
        const limit = filterParams.limit || 20;
        const offset = filterParams.offset || 0;
        const total = filteredBonds.length;
        const paginatedBonds = filteredBonds.slice(offset, offset + limit);

        return {
          message: 'Partner bonds fetched successfully',
          data: paginatedBonds,
          total,
          limit,
          offset
        };
      })
    );
  }

  /**
   * Get Customer Bonds
   */
  getCustomerBonds(params: CustomerBondFilterParams = {}): Observable<CustomerBondsResponse> {
    return of(null).pipe(
      delay(700),
      map(() => {
        let filteredHoldings = [...this.customerBondHoldings];

        // Apply filters
        if (params.customerId) {
          filteredHoldings = filteredHoldings.filter(h => 
            h.customerId === params.customerId
          );
        }

        if (params.partnerId) {
          filteredHoldings = filteredHoldings.filter(h => 
            h.partnerId === params.partnerId
          );
        }

        if (params.partnerUserId) {
          filteredHoldings = filteredHoldings.filter(h => 
            h.partnerUserId === params.partnerUserId
          );
        }

        if (params.bondId) {
          filteredHoldings = filteredHoldings.filter(h => 
            h.bondId === params.bondId
          );
        }

        if (params.bondName) {
          filteredHoldings = filteredHoldings.filter(h => 
            h.bondName.toLowerCase().includes(params.bondName!.toLowerCase())
          );
        }

        if (params.status) {
          filteredHoldings = filteredHoldings.filter(h => 
            h.status === params.status
          );
        }

        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
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
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        const total = filteredHoldings.length;
        const paginatedHoldings = filteredHoldings.slice(offset, offset + limit);

        return {
          message: 'Customer bonds fetched successfully',
          data: paginatedHoldings,
          total,
          limit,
          offset
        };
      })
    );
  }
}