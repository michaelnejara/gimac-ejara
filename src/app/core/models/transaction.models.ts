/**
 * Transaction Status Enum
 * Represents all possible states of a transaction
 */
export enum TransactionStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Transaction Data Transfer Object
 * Raw transaction data from API
 */
export interface TransactionDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  status: TransactionStatus;
  apiClientId: number;
  gimacServiceCode: Record<string, any>;
  gimacSupportedServiceId: number;
  gimacSupportedServiceConfigId: number;
  baseCurrencyId: number;
  rawAmount: Record<string, any>;
  baseAmount: Record<string, any>;
  netAmount: Record<string, any>;
  netAmountInBaseCurrency: Record<string, any>;
  receiverAmount: Record<string, any>;
  receiverCurrencyUsdRate: Record<string, any>;
  senderCurrencyUsdRate: Record<string, any>;
  baseCurrencyUsdRate: Record<string, any>;
  internalReference: string;
  externalReference: string;
  validatedAt: Date;
  reconciledAt: Date;
  webhookSentAt: Date;
  createdBy: number;
  senderAccountInfo: Record<string, any>;
  receiverAccountInfo: Record<string, any>;
  senderAccountIdentifier: string;
  receiverAccountIdentifier: string;
  billInfo: Record<string, any>;
  senderCountryId: number;
  receiverCountryId: number;
  senderCurrencyId: number;
  receiverCurrencyId: number;
  isWebhookSent: boolean;
  validationChannel: Record<string, any>;
  accumulatedFeePolicy: Record<string, any>;
  accumulatedFeeInSenderCurrency: Record<string, any>;
  accumulatedFeeInBaseCurrency: Record<string, any>;
  gimacFeeInBaseCurrency: Record<string, any>;
  receiverProviderFeeInBaseCurrency: Record<string, any>;
  acquirerFeeInBaseCurrency: Record<string, any>;
  issuerFeeInBaseCurrency: Record<string, any>;
  ejaraFeeInBaseCurrency: Record<string, any>;
  providerReference: string;
  clientIp: string;
  senderServiceProviderId: number;
  receiverServiceProviderId: number;
  providerResponse: Record<string, any>;
  providerWebhookResponse: Record<string, any>;
  providerCronCheckResponse: Record<string, any>;
  reconciliationResponse: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Gimac Transaction from API Response
 */
export interface GimacTransaction {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: Record<string, any>;
  apiClientId: number;
  gimacServiceCode: Record<string, any>;
  gimacSupportedServiceId: number;
  gimacSupportedServiceConfigId: number;
  baseCurrencyId: number;
  rawAmount: Record<string, any>;
  baseAmount: Record<string, any>;
  netAmount: Record<string, any>;
  netAmountInBaseCurrency: Record<string, any>;
  receiverAmount: Record<string, any>;
  receiverCurrencyUsdRate: Record<string, any>;
  senderCurrencyUsdRate: Record<string, any>;
  baseCurrencyUsdRate: Record<string, any>;
  internalReference: string;
  externalReference: string;
  validatedAt: string;
  reconciledAt: string;
  webhookSentAt: string;
  createdBy: number;
  senderAccountInfo: Record<string, any>;
  receiverAccountInfo: Record<string, any>;
  senderAccountIdentifier: string;
  receiverAccountIdentifier: string;
  billInfo: Record<string, any>;
  senderCountryId: number;
  receiverCountryId: number;
  senderCurrencyId: number;
  receiverCurrencyId: number;
  isWebhookSent: boolean;
  validationChannel: Record<string, any>;
  accumulatedFeePolicy: Record<string, any>;
  accumulatedFeeInSenderCurrency: Record<string, any>;
  accumulatedFeeInBaseCurrency: Record<string, any>;
  gimacFeeInBaseCurrency: Record<string, any>;
  receiverProviderFeeInBaseCurrency: Record<string, any>;
  acquirerFeeInBaseCurrency: Record<string, any>;
  issuerFeeInBaseCurrency: Record<string, any>;
  ejaraFeeInBaseCurrency: Record<string, any>;
  providerReference: string;
  clientIp: string;
  senderServiceProviderId: number;
  receiverServiceProviderId: number;
  providerResponse: Record<string, any>;
  providerWebhookResponse: Record<string, any>;
  providerCronCheckResponse: Record<string, any>;
  reconciliationResponse: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Pagination Information
 */
export interface PaginationInfo {
  currentPageNumber: number;
  totalPages: number;
  previousPageNumber: number;
  nextPageNumber: number;
}

/**
 * API Response for Transactions
 */
export interface GimacTransactionResponse {
  message: string;
  data: GimacTransaction[];
  count: number;
  totalCount: number;
  page: PaginationInfo;
}

/**
 * Transaction Filter Parameters
 * Used for filtering and searching transactions
 */
export interface GimacTransactionFilterParams {
  /** Transaction status filter */
  status?: string;
  /** Gimac supported service ID */
  gimacSupportedServiceId?: number;
  /** Sender account identifier */
  senderAccountIdentifier?: string;
  /** Receiver account identifier */
  receiverAccountIdentifier?: string;
  /** Gimac supported service config ID */
  gimacSupportedServiceConfigId?: number;
  /** Sender service provider ID */
  senderServiceProviderId?: number;
  /** Receiver service provider ID */
  receiverServiceProviderId?: number;
  /** Gimac service code */
  gimacServiceCode?: string;
  /** Filter start date (ISO format) */
  dateFrom?: string;
  /** Filter end date (ISO format) */
  dateTo?: string;
  /** Search keyword */
  keyword?: string;
  /** Number of items per page */
  limit?: number;
  /** Page number to fetch */
  pageNumber?: number;
}

/**
 * Normalized Transaction for UI Display
 * Simplified version with computed fields
 */
export interface Transaction {
  id: number;
  createdAt: string;
  status: string;
  internalReference: string;
  externalReference: string;
  senderAccountIdentifier: string;
  receiverAccountIdentifier: string;
  amount: string;
  currency: string;
  senderCountryId: number;
  receiverCountryId: number;
  isReconciled: boolean;
  isWebhookSent: boolean;
}