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
      color: '1976D2',
      colorCode: '#1976D2',
      amount: 1000000000,
      amountPurchased: 325000000,
      availableBalance: 675000000,
      lifetime: 2190, // 6 years in days
      startDate: '2024-01-01T00:00:00+00:00',
      maturityDate: '2029-12-31T23:59:59+00:00',
      dateCreated: '2024-01-01T10:00:00Z',
      dailyInterest: 0.0151, // 5.5% annual / 365
      interestValue: 5.5,
      ejaraInterestRate: 0.5,
      customerInterestRate: 5.0,
      maturityPercentage: 33.0,
      unlockingPenaltyRate: 2.0,
      smartContractId: 'KT1GovTreasury2024XYZ',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 1.0,
      rank: 1,
      interestCalculationPeriod: 'daily',
      issuerNameEn: 'Government of Cameroon',
      issuerNameFr: 'Gouvernement du Cameroun',
      issuerDescriptionEn: 'The Government of Cameroon issues treasury bonds to finance national infrastructure and development projects',
      issuerDescriptionFr: 'Le Gouvernement du Cameroun émet des obligations du Trésor pour financer les infrastructures nationales et les projets de développement',
      issuerType: 'government',
      issuerIcon: 'gov-cameroon.png',
      withdrawalPeriod: 'maturity',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: true,
      momoMinimumDeposit: 10000,
      bankMinimumDeposit: 50000,
      blockchain: 'tezos',
      status: 'active',
      statusColorCode: '0xFF4CAF50'
    },
    {
      id: 2,
      name: 'Corporate Infrastructure Bond',
      code: 'CIB2024',
      descriptionEn: 'Investment in national infrastructure development projects',
      descriptionFr: 'Investissement dans des projets de développement d\'infrastructure nationale',
      color: 'FF6F00',
      colorCode: '#FF6F00',
      amount: 500000000,
      amountPurchased: 145000000,
      availableBalance: 355000000,
      lifetime: 1195, // ~3.25 years in days
      startDate: '2024-03-15T00:00:00+00:00',
      maturityDate: '2027-06-30T23:59:59+00:00',
      dateCreated: '2024-03-15T09:00:00Z',
      dailyInterest: 0.0197,
      interestValue: 7.2,
      ejaraInterestRate: 0.7,
      customerInterestRate: 6.5,
      maturityPercentage: 25.5,
      unlockingPenaltyRate: 3.5,
      smartContractId: 'KT1CorpInfra2024ABC',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 1.0,
      rank: 2,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'National Infrastructure Corp',
      issuerNameFr: 'Société Nationale d\'Infrastructure',
      issuerDescriptionEn: 'Leading infrastructure development corporation focused on building national assets',
      issuerDescriptionFr: 'Principale société de développement d\'infrastructures axée sur la construction d\'actifs nationaux',
      issuerType: 'corporate',
      issuerIcon: 'nic-logo.png',
      withdrawalPeriod: 'anytime',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: true,
      momoMinimumDeposit: 5000,
      bankMinimumDeposit: 25000,
      blockchain: 'tezos',
      status: 'active',
      statusColorCode: '0xFF4CAF50'
    },
    {
      id: 3,
      name: 'Green Energy Investment Bond',
      code: 'GEB2024',
      descriptionEn: 'Sustainable investment in renewable energy projects',
      descriptionFr: 'Investissement durable dans des projets d\'énergie renouvelable',
      color: '4CAF50',
      colorCode: '#4CAF50',
      amount: 750000000,
      amountPurchased: 198000000,
      availableBalance: 552000000,
      lifetime: 1795, // ~4.92 years in days
      startDate: '2024-02-01T00:00:00+00:00',
      maturityDate: '2028-12-31T23:59:59+00:00',
      dateCreated: '2024-02-01T11:00:00Z',
      dailyInterest: 0.0186,
      interestValue: 6.8,
      ejaraInterestRate: 0.6,
      customerInterestRate: 6.2,
      maturityPercentage: 34.0,
      unlockingPenaltyRate: 0,
      smartContractId: 'KT1GreenEnergy2024DEF',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 1.0,
      rank: 3,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'Cameroon Green Energy Ltd',
      issuerNameFr: 'Énergie Verte du Cameroun Ltée',
      issuerDescriptionEn: 'Renewable energy company dedicated to sustainable power generation',
      issuerDescriptionFr: 'Société d\'énergie renouvelable dédiée à la production d\'électricité durable',
      issuerType: 'corporate',
      issuerIcon: 'green-energy.png',
      withdrawalPeriod: 'maturity',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: true,
      momoMinimumDeposit: 7500,
      bankMinimumDeposit: 30000,
      blockchain: 'tezos',
      status: 'active',
      statusColorCode: '0xFF4CAF50'
    },
    {
      id: 4,
      name: 'Municipal Development Bond',
      code: 'MDB2024',
      descriptionEn: 'Support local government development initiatives',
      descriptionFr: 'Soutenir les initiatives de développement du gouvernement local',
      color: '9C27B0',
      colorCode: '#9C27B0',
      amount: 250000000,
      amountPurchased: 67000000,
      availableBalance: 183000000,
      lifetime: 1004, // ~2.75 years in days
      startDate: '2024-04-01T00:00:00+00:00',
      maturityDate: '2026-12-31T23:59:59+00:00',
      dateCreated: '2024-04-01T10:00:00Z',
      dailyInterest: 0.0123,
      interestValue: 4.5,
      ejaraInterestRate: 0.4,
      customerInterestRate: 4.1,
      maturityPercentage: 12.5,
      unlockingPenaltyRate: 1.5,
      smartContractId: 'KT1MuniDev2024GHI',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 1.0,
      rank: 4,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'City of Douala',
      issuerNameFr: 'Ville de Douala',
      issuerDescriptionEn: 'Municipal government issuing bonds for urban development projects',
      issuerDescriptionFr: 'Gouvernement municipal émettant des obligations pour des projets de développement urbain',
      issuerType: 'government',
      issuerIcon: 'douala-city.png',
      withdrawalPeriod: 'after_period',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: true,
      momoMinimumDeposit: 5000,
      bankMinimumDeposit: 20000,
      blockchain: 'tezos',
      status: 'active',
      statusColorCode: '0xFF4CAF50'
    },
    {
      id: 5,
      name: 'High Yield Corporate Bond',
      code: 'HYCB2024',
      descriptionEn: 'High return investment with calculated risk',
      descriptionFr: 'Investissement à haut rendement avec risque calculé',
      color: 'F44336',
      colorCode: '#F44336',
      amount: 1000000000,
      amountPurchased: 92000000,
      availableBalance: 908000000,
      lifetime: 760, // ~2.08 years in days
      startDate: '2024-05-15T00:00:00+00:00',
      maturityDate: '2026-06-30T23:59:59+00:00',
      dateCreated: '2024-05-15T14:00:00Z',
      dailyInterest: 0.026,
      interestValue: 9.5,
      ejaraInterestRate: 1.0,
      customerInterestRate: 8.5,
      maturityPercentage: 20.0,
      unlockingPenaltyRate: 5.0,
      smartContractId: 'KT1HighYield2024JKL',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 1.0,
      rank: 5,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'Tech Innovation Corp',
      issuerNameFr: 'Société d\'Innovation Technologique',
      issuerDescriptionEn: 'Technology corporation offering high-yield investment opportunities',
      issuerDescriptionFr: 'Société technologique offrant des opportunités d\'investissement à haut rendement',
      issuerType: 'corporate',
      issuerIcon: 'tech-innovation.png',
      withdrawalPeriod: 'anytime',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: false,
      momoMinimumDeposit: 15000,
      bankMinimumDeposit: 75000,
      blockchain: 'ethereum',
      status: 'inactive',
      statusColorCode: '0xFF9E9E9E'
    },
    {
      id: 6,
      name: 'Agricultural Development Bond',
      code: 'ADB2024',
      descriptionEn: 'Investment in agricultural modernization and food security',
      descriptionFr: 'Investissement dans la modernisation agricole et la sécurité alimentaire',
      color: '8BC34A',
      colorCode: '#8BC34A',
      amount: 400000000,
      amountPurchased: 123000000,
      availableBalance: 277000000,
      lifetime: 1308, // ~3.58 years in days
      startDate: '2024-06-01T00:00:00+00:00',
      maturityDate: '2027-12-31T23:59:59+00:00',
      dateCreated: '2024-06-01T10:00:00Z',
      dailyInterest: 0.0164,
      interestValue: 6.0,
      ejaraInterestRate: 0.5,
      customerInterestRate: 5.5,
      maturityPercentage: 21.5,
      unlockingPenaltyRate: 2.5,
      smartContractId: 'KT1AgriDev2024MNO',
      defaultFiatCurrency: 'XAF',
      fiatTokenEquivalent: 1.0,
      rank: 6,
      interestCalculationPeriod: 'monthly',
      issuerNameEn: 'AgriDev Corporation',
      issuerNameFr: 'Société de Développement Agricole',
      issuerDescriptionEn: 'Agricultural development corporation focused on food security and farm modernization',
      issuerDescriptionFr: 'Société de développement agricole axée sur la sécurité alimentaire et la modernisation des exploitations',
      issuerType: 'institution',
      issuerIcon: 'agridev.png',
      withdrawalPeriod: 'after_period',
      isWithdrawalBlocked: false,
      shouldBeDisplayedInApp: true,
      momoMinimumDeposit: 6000,
      bankMinimumDeposit: 30000,
      blockchain: 'tezos',
      status: 'active',
      statusColorCode: '0xFF4CAF50'
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

        if (filters?.fiatCurrency || filters?.defaultFiatCurrency) {
          const currency = filters.fiatCurrency || filters.defaultFiatCurrency;
          filteredBonds = filteredBonds.filter(b => b.defaultFiatCurrency === currency);
        }

        if (filters?.issuer || filters?.issuerNameEn) {
          const issuerFilter = filters.issuer || filters.issuerNameEn;
          filteredBonds = filteredBonds.filter(b =>
            b.issuerNameEn.toLowerCase().includes(issuerFilter!.toLowerCase()) ||
            b.issuerNameFr.toLowerCase().includes(issuerFilter!.toLowerCase())
          );
        }

        if (filters?.keyword) {
          const keyword = filters.keyword.toLowerCase();
          filteredBonds = filteredBonds.filter(b =>
            b.name.toLowerCase().includes(keyword) ||
            b.code.toLowerCase().includes(keyword) ||
            b.issuerNameEn.toLowerCase().includes(keyword) ||
            b.issuerNameFr.toLowerCase().includes(keyword) ||
            b.descriptionEn?.toLowerCase().includes(keyword) ||
            b.descriptionFr?.toLowerCase().includes(keyword)
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
        // Calculate lifetime in days from start to maturity date
        const startDate = new Date(bondData.startDate);
        const maturityDate = new Date(bondData.maturityDate);
        const lifetime = Math.ceil((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate daily interest from customer interest rate
        const dailyInterest = bondData.customerInterestRate / 365;

        // Calculate total interest value
        const totalInterestValue = bondData.ejaraInterestRate + bondData.customerInterestRate;

        const newBond: Bond = {
          id: this.currentId++,
          name: bondData.name,
          code: `BOND${this.currentId}`, // Generate bond code
          descriptionEn: bondData.descriptionEn,
          descriptionFr: bondData.descriptionFr,
          color: bondData.colorCode.replace('#', ''), // Remove # from color code
          colorCode: bondData.colorCode,
          amount: bondData.amount,
          amountPurchased: 0,
          availableBalance: bondData.amount,
          lifetime: lifetime,
          startDate: bondData.startDate,
          maturityDate: bondData.maturityDate,
          dateCreated: new Date().toISOString(),
          dailyInterest: dailyInterest,
          interestValue: totalInterestValue,
          ejaraInterestRate: bondData.ejaraInterestRate,
          customerInterestRate: bondData.customerInterestRate,
          maturityPercentage: 0, // Calculate based on time elapsed
          unlockingPenaltyRate: bondData.unlockingPenaltyRate,
          smartContractId: bondData.smartContractId,
          defaultFiatCurrency: bondData.defaultFiatCurrency,
          fiatTokenEquivalent: bondData.fiatTokenEquivalent,
          rank: bondData.rank,
          interestCalculationPeriod: bondData.interestCalculationPeriod,
          issuerNameEn: bondData.issuerNameEn,
          issuerNameFr: bondData.issuerNameFr,
          issuerDescriptionEn: bondData.issuerDescriptionEn,
          issuerDescriptionFr: bondData.issuerDescriptionFr,
          issuerType: bondData.issuerType,
          issuerIcon: bondData.issuerIcon,
          withdrawalPeriod: bondData.withdrawalPeriod as any,
          isWithdrawalBlocked: bondData.isWithdrawalBlocked,
          shouldBeDisplayedInApp: bondData.shouldBeDisplayedInApp,
          momoMinimumDeposit: bondData.momoMinimumDeposit,
          bankMinimumDeposit: bondData.bankMinimumDeposit,
          blockchain: bondData.blockchain,
          status: bondData.status,
          statusColorCode: bondData.status === 'active' ? '0xFF4CAF50' : '0xFF9E9E9E'
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

        // Recalculate lifetime if dates change
        let lifetime = existingBond.lifetime;
        const startDate = bondData.startDate || existingBond.startDate;
        const maturityDate = bondData.maturityDate || existingBond.maturityDate;
        if (bondData.startDate || bondData.maturityDate) {
          const start = new Date(startDate);
          const maturity = new Date(maturityDate);
          lifetime = Math.ceil((maturity.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Update only provided fields
        const updatedBond: Bond = {
          ...existingBond,
          ...(bondData.name !== undefined && { name: bondData.name }),
          ...(bondData.descriptionEn !== undefined && { descriptionEn: bondData.descriptionEn }),
          ...(bondData.descriptionFr !== undefined && { descriptionFr: bondData.descriptionFr }),
          ...(bondData.colorCode !== undefined && {
            colorCode: bondData.colorCode,
            color: bondData.colorCode.replace('#', '')
          }),
          ...(bondData.amount !== undefined && {
            amount: bondData.amount,
            availableBalance: bondData.amount - existingBond.amountPurchased
          }),
          ...(bondData.ejaraInterestRate !== undefined && { ejaraInterestRate: bondData.ejaraInterestRate }),
          ...(bondData.customerInterestRate !== undefined && {
            customerInterestRate: bondData.customerInterestRate,
            dailyInterest: bondData.customerInterestRate / 365
          }),
          ...(bondData.startDate !== undefined && { startDate: bondData.startDate }),
          ...(bondData.maturityDate !== undefined && { maturityDate: bondData.maturityDate }),
          ...(bondData.smartContractId !== undefined && { smartContractId: bondData.smartContractId }),
          ...(bondData.defaultFiatCurrency !== undefined && { defaultFiatCurrency: bondData.defaultFiatCurrency }),
          ...(bondData.fiatTokenEquivalent !== undefined && { fiatTokenEquivalent: bondData.fiatTokenEquivalent }),
          ...(bondData.rank !== undefined && { rank: bondData.rank }),
          ...(bondData.interestCalculationPeriod !== undefined && { interestCalculationPeriod: bondData.interestCalculationPeriod }),
          ...(bondData.issuerNameEn !== undefined && { issuerNameEn: bondData.issuerNameEn }),
          ...(bondData.issuerNameFr !== undefined && { issuerNameFr: bondData.issuerNameFr }),
          ...(bondData.issuerDescriptionEn !== undefined && { issuerDescriptionEn: bondData.issuerDescriptionEn }),
          ...(bondData.issuerDescriptionFr !== undefined && { issuerDescriptionFr: bondData.issuerDescriptionFr }),
          ...(bondData.issuerType !== undefined && { issuerType: bondData.issuerType }),
          ...(bondData.issuerIcon !== undefined && { issuerIcon: bondData.issuerIcon }),
          ...(bondData.isWithdrawalBlocked !== undefined && { isWithdrawalBlocked: bondData.isWithdrawalBlocked }),
          ...(bondData.shouldBeDisplayedInApp !== undefined && { shouldBeDisplayedInApp: bondData.shouldBeDisplayedInApp }),
          ...(bondData.momoMinimumDeposit !== undefined && { momoMinimumDeposit: bondData.momoMinimumDeposit }),
          ...(bondData.bankMinimumDeposit !== undefined && { bankMinimumDeposit: bondData.bankMinimumDeposit }),
          ...(bondData.blockchain !== undefined && { blockchain: bondData.blockchain }),
          ...(bondData.withdrawalPeriod !== undefined && { withdrawalPeriod: bondData.withdrawalPeriod as any }),
          ...(bondData.unlockingPenaltyRate !== undefined && { unlockingPenaltyRate: bondData.unlockingPenaltyRate }),
          ...(bondData.status !== undefined && {
            status: bondData.status,
            statusColorCode: bondData.status === 'active' ? '0xFF4CAF50' : '0xFF9E9E9E'
          }),
          lifetime: lifetime,
          // Recalculate total interest value if either rate changes
          interestValue: (bondData.ejaraInterestRate || existingBond.ejaraInterestRate) +
                        (bondData.customerInterestRate || existingBond.customerInterestRate)
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
        // Return full bond objects for partner bonds (not just summary)
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
