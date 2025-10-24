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
export type InterestCalculationPeriod = 'daily' | 'monthly' | 'annually';

/**
 * Currency Type
 */
export type CurrencyCode = 'XAF' | 'USD' | 'EUR' | 'NGN' | 'GHS' | 'KES';

/**
 * Issuer Type
 */
export type IssuerType = 'government' | 'institution' | 'corporate';

/**
 * Bond Entity
 * Matches API response structure from GIMAC TB B2B service
 */
export interface Bond {
  id: number;
  name: string;
  code: string;
  descriptionEn: string | null; // Bond description in English (nullable)
  descriptionFr: string | null; // Bond description in French (nullable)
  color: string; // Hex color code without # (e.g., "FBDE4A")
  colorCode?: string; // Optional: Hex color code with # for backward compatibility
  amount: number; // Total bond amount/principal
  amountPurchased: number; // Total amount purchased (can have decimals)
  availableBalance: number; // Available balance (can be negative if oversold)
  lifetime: number; // Bond lifetime in days
  startDate: string; // Bond start date (ISO 8601 with timezone)
  maturityDate: string; // Bond maturity date (ISO 8601 with timezone)
  dateCreated: string; // Creation timestamp
  dailyInterest: number; // Daily interest rate (decimal)
  interestValue: number; // Annual interest rate (percentage)
  ejaraInterestRate: number; // Ejara's commission/interest rate (percentage)
  customerInterestRate: number; // Customer interest rate (percentage)
  maturityPercentage: number; // Percentage of maturity reached
  unlockingPenaltyRate: number; // Penalty rate for early withdrawal
  smartContractId: string; // ID of the associated smart contract
  defaultFiatCurrency: CurrencyCode; // Currency code (XAF, USD, etc.)
  fiatTokenEquivalent: number; // Fiat to token conversion rate
  rank: number; // Display order ranking
  interestCalculationPeriod: InterestCalculationPeriod; // Interest calculation period (daily, monthly, annually)
  issuerNameEn: string; // Issuer name in English
  issuerNameFr: string; // Issuer name in French
  issuerDescriptionEn: string; // Issuer description in English
  issuerDescriptionFr: string; // Issuer description in French
  issuerType: IssuerType; // Type of issuer (government, institution, corporate)
  issuerIcon: string; // Issuer icon filename or URL
  withdrawalPeriod: WithdrawalPeriod; // Withdrawal period (daily, maturity)
  isWithdrawalBlocked: boolean; // Whether withdrawals are blocked
  shouldBeDisplayedInApp: boolean; // Whether to display in app
  momoMinimumDeposit: number; // Minimum deposit amount via mobile money
  bankMinimumDeposit: number; // Minimum deposit amount via bank transfer
  blockchain: string; // Blockchain network (tezos, ethereum, etc.)
  status: BondStatus; // Bond status (active, pre-allocation, sold-out)
  statusColorCode: string; // Android hex color format (e.g., "0xFF28C9C3")
}

/**
 * Create Bond Request
 * Matches API POST /bonds structure
 */
export interface CreateBondRequest {
  name: string;
  descriptionEn: string;
  descriptionFr: string;
  colorCode: string;
  amount: number;
  ejaraInterestRate: number;
  customerInterestRate: number;
  startDate: string; // ISO format
  maturityDate: string; // ISO format
  smartContractId: string;
  defaultFiatCurrency: CurrencyCode;
  fiatTokenEquivalent: number;
  status: BondStatus;
  isWithdrawalBlocked: boolean;
  shouldBeDisplayedInApp: boolean;
  momoMinimumDeposit: number;
  bankMinimumDeposit: number;
  interestCalculationPeriod: InterestCalculationPeriod;
  rank: number;
  blockchain: string;
  issuerNameEn: string;
  issuerNameFr: string;
  issuerDescriptionEn: string;
  issuerDescriptionFr: string;
  issuerType: IssuerType;
  issuerIcon: string;
  withdrawalPeriod: string;
  unlockingPenaltyRate: number;
}

/**
 * Update Bond Request
 * Matches API PUT /bonds/:id structure
 * All fields are optional
 */
export interface UpdateBondRequest {
  name?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  colorCode?: string;
  amount?: number;
  ejaraInterestRate?: number;
  customerInterestRate?: number;
  startDate?: string; // ISO format
  maturityDate?: string; // ISO format
  smartContractId?: string;
  defaultFiatCurrency?: CurrencyCode;
  fiatTokenEquivalent?: number;
  status?: BondStatus;
  isWithdrawalBlocked?: boolean;
  shouldBeDisplayedInApp?: boolean;
  momoMinimumDeposit?: number;
  bankMinimumDeposit?: number;
  interestCalculationPeriod?: InterestCalculationPeriod;
  rank?: number;
  blockchain?: string;
  issuerNameEn?: string;
  issuerNameFr?: string;
  issuerDescriptionEn?: string;
  issuerDescriptionFr?: string;
  issuerType?: IssuerType;
  issuerIcon?: string;
  withdrawalPeriod?: string;
  unlockingPenaltyRate?: number;
}

/**
 * Bond Filter Parameters
 */
export interface BondFilterParams {
  bondName?: string;
  bondCode?: string;
  status?: BondStatus;
  fiatCurrency?: CurrencyCode;
  defaultFiatCurrency?: CurrencyCode; // Allow both naming conventions
  issuer?: string;
  issuerNameEn?: string; // Allow direct issuer name filter
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
 * Bond Mutation Response
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