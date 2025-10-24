/**
 * Bond Status Enum
 */
export type BondStatus = 'active' | 'inactive' | 'matured' | 'pre-allocation' | 'sold-out';

/**
 * Withdrawal Period Type
 */
export type WithdrawalPeriod = 'maturity' | 'anytime' | 'after_period';

/**
 * Interest Calculation Period
 */
export type InterestCalculationPeriod = 'daily' | 'monthly' | 'quarterly' | 'annual';

/**
 * Currency Type
 */
export type CurrencyCode = 'XAF' | 'USD' | 'EUR' | 'NGN' | 'GHS' | 'KES';

/**
 * Bond Entity
 * Matches API response structure from GIMAC TB B2B service
 */
export interface Bond {
  id: number;
  name: string;
  code: string;
  descriptionEn: string;
  descriptionFr: string;
  color: string; // Hex color code
  amount: number; // Total bond amount
  amountPurchased: number; // Amount already purchased
  availableBalance: number; // Remaining available balance
  lifetime: number; // Bond lifetime in days
  startDate: string; // ISO date string
  maturityDate: string; // ISO date string
  dateCreated: string; // ISO date string
  dailyInterest: number; // Daily interest rate
  interestValue: number; // Annual interest percentage
  maturityPercentage: number; // Percentage at maturity
  unlockingPenaltyRate: number; // Penalty rate for early withdrawal
  defaultFiatCurrency: CurrencyCode;
  rank: number;
  interestCalculationPeriod: InterestCalculationPeriod;
  issuerNameEn: string;
  issuerNameFr: string;
  withdrawalPeriod: WithdrawalPeriod;
  status: BondStatus;
  statusColorCode: string; // Hex color code for status
}

/**
 * Create Bond Request
 * Matches API POST /bonds structure
 */
export interface CreateBondRequest {
  // Required fields
  name: string;
  code: string;
  principalAmount: number;
  interestRate: number;
  couponRate: number;
  issueDate: string; // ISO format
  maturityDate: string; // ISO format
  valueDate: string; // ISO format
  tenor: number; // in months
  fiatCurrency: string; // Currency code (XAF, USD, etc.)
  minPurchaseAmount: number;
  issuer: string;
  status: BondStatus;

  // Optional fields
  description?: string;
  maxPurchaseAmount?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * Update Bond Request
 * Matches API PUT /bonds/:id structure
 * All fields are optional
 */
export interface UpdateBondRequest {
  name?: string;
  description?: string;
  principalAmount?: number;
  interestRate?: number;
  couponRate?: number;
  issueDate?: string; // ISO format
  maturityDate?: string; // ISO format
  valueDate?: string; // ISO format
  tenor?: number; // in months
  fiatCurrency?: string;
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
  issuer?: string;
  status?: BondStatus;
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * Bond Filter Parameters
 */
export interface BondFilterParams {
  bondName?: string;
  bondCode?: string;
  status?: BondStatus;
  fiatCurrency?: CurrencyCode;
  issuer?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  startMaturityDate?: string;
  endMaturityDate?: string;
  limit?: number;
  offset?: number;

  minValue?: number;
  maxValue?: number;
}

/**
 * Partner Bond Filter Parameters
 */
export interface PartnerBondFilterParams {
  partnerId: number;
  status?: BondStatus;
  keyword?: string;
  limit?: number;
  offset?: number;

  bondCode?:string;
  bondName?:string;
}

/**
 * Customer Bond Holding Status
 */
export type CustomerBondStatus = 'active' | 'matured' | 'withdrawn';

/**
 * Customer Bond Holding
 * Represents a customer's investment in a bond
 */
export interface CustomerBondHolding {
  customerId: number;
  customerName: string;
  partnerUserId: string;
  partnerId: number;
  partnerName: string;
  bondId: number;
  bondName: string;
  bondCode: string;
  investmentAmount: number;
  currentValue: number;
  interestEarned: number;
  totalWithdrawn: number;
  availableBalance: number;
  purchaseDate: string; // ISO date string
  maturityDate: string; // ISO date string
  status: CustomerBondStatus;
}

/**
 * Customer Bond Filter Parameters
 */
export interface CustomerBondFilterParams {
  partnerId?: number;
  partnerUserId?: string;
  customerId?: number;
  bondId?: number;
  bondName?: string;
  status?: CustomerBondStatus;
  keyword?: string;
  limit?: number;
  offset?: number;
}

/**
 * Bonds List Response
 */
export interface BondsResponse {
  message: string;
  data: {
    bonds: Bond[];
    totalCount: number;
  };
}

/**
 * Single Bond Response
 */
export interface BondResponse {
  message: string;
  data: Bond;
}

/**
 * Bond Create/Update Success Response
 */
export interface BondMutationResponse {
  message: string;
}

/**
 * Partner Bonds Response
 */
export interface PartnerBondsResponse {
  message: string;
  data: {
    bondId: number;
    bondName: string;
    bondCode: string;
    status: BondStatus;
    dateAssigned: string;
  }[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Customer Bonds Response
 */
export interface CustomerBondsResponse {
  message: string;
  data: CustomerBondHolding[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}