/**
 * Bond Status Enum
 */
export type BondStatus = 'active' | 'inactive' | 'matured';

/**
 * Bond Risk Level Enum
 */
export type BondRiskLevel = 'low' | 'medium' | 'high';

/**
 * Currency Type
 */
export type CurrencyCode = 'XAF' | 'USD' | 'EUR' | 'NGN' | 'GHS' | 'KES';

/**
 * Bond Entity
 */
export interface Bond {
  id: number;
  name: string;
  code: string;
  description?: string;
  principalAmount: number;
  interestRate: number;
  couponRate: number;
  issueDate: string;
  maturityDate: string;
  valueDate: string;
  tenor: number; // in months
  fiatCurrency: CurrencyCode;
  minPurchaseAmount: number;
  maxPurchaseAmount?: number;
  amountPurchased: number;
  issuer: string;
  status: BondStatus;
  riskLevel?: BondRiskLevel;
  dateCreated: string;
  lastUpdated: string;

  type?: string;
  currency?:string;
  faceValue?:number;
  currentValue?:number;
  minimumInvestment?:number;
  maximumInvestment?:number;
  totalIssued?:number;
  totalSubscribed?:number;
  availableUnits?:number;
  features?:string[];
  earlyRedemptionAllowed?: boolean;
  earlyRedemptionPenalty?: number; // percentage
  partnerCount?: number;
  customerCount?: number;
  // createdAt?: string;
  // updatedAt?: string;
}

/**
 * Create Bond Request
 */
export interface CreateBondRequest {
  name: string;
  code: string;
  description?: string;
  principalAmount: number;
  interestRate: number;
  couponRate: number;
  issueDate: string;
  maturityDate: string;
  valueDate: string;
  tenor: number;
  fiatCurrency: CurrencyCode;
  minPurchaseAmount: number;
  maxPurchaseAmount?: number;
  issuer: string;
  status: BondStatus;
  riskLevel?: BondRiskLevel;
}

/**
 * Update Bond Request
 */
export interface UpdateBondRequest {
  name?: string;
  description?: string;
  principalAmount?: number;
  interestRate?: number;
  couponRate?: number;
  issueDate?: string;
  maturityDate?: string;
  valueDate?: string;
  tenor?: number;
  fiatCurrency?: CurrencyCode;
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
  issuer?: string;
  status?: BondStatus;
  riskLevel?: BondRiskLevel;
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
 */
export interface CustomerBondHolding {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerUserId: string;
  customerId: number;
  customerName: string;
  bondId: number;
  bondName: string;
  bondCode: string;
  investmentAmount: number;
  currentBalance: number;
  interestEarned: number;
  withdrawnAmount: number;
  purchaseDate: string;
  maturityDate: string;
  status: CustomerBondStatus;
  currency: CurrencyCode;
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
  data: Bond[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Single Bond Response
 */
export interface BondResponse {
  message: string;
  data: Bond;
}

/**
 * Customer Bonds Response
 */
export interface CustomerBondsResponse {
  message: string;
  data: CustomerBondHolding[];
  total: number;
  limit: number;
  offset: number;
}