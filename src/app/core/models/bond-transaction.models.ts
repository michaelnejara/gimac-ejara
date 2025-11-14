/**
 * Transaction Type Enum
 */
export type TransactionType = 'deposit' | 'withdrawal' | 'purchase';

/**
 * Transaction Status Enum
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'processing';

/**
 * Payment Status
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed';

/**
 * Blockchain Status
 */
export type BlockchainStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Bond Transaction Entity
 */
export interface BondTransaction {
  id: number;
  transactionReference: string;
  partnerTransactionReference: string;
  transactionType: TransactionType;

  // Partner & Customer Info
  partnerId: number;
  partnerName: string;
  customerFirstName: string;
  customerLastName: string;
  partnerUserId: string;

  // Financial Details
  amount: number;
  fee: number;
  total: number;

  // Payment Details
  paymentStatus: PaymentStatus;

  // Blockchain Details
  blockchainStatus: BlockchainStatus;

  // Timestamps
  dateCreated: string;
  lastUpdated: string;

  // Optional fields for backward compatibility
  status?: TransactionStatus;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  bondId?: number;
  bondName?: string;
  bondCode?: string;
  units?: number;
  pricePerUnit?: number;
  totalAmount?: number;
  currency?: string;
  commission?: number;
  commissionRate?: number;
  fees?: number;
  netAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  blockchainTxHash?: string;
  blockchainConfirmations?: number;
  metadata?: Record<string, any>;
  dateConfirmed?: string;
  dateCompleted?: string;
}

/**
 * Transaction Filter Parameters
 */
export interface TransactionFilterParams {
  bondId?: number;
  partnerId?: number;
  customerId?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Pagination Meta
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

/**
 * Transactions List Response
 */
export interface TransactionsResponse {
  message: string;
  data: BondTransaction[];
  meta: PaginationMeta;
}

/**
 * Single Transaction Response
 */
export interface TransactionResponse {
  message: string;
  data: BondTransaction;
}

/**
 * Transaction Statistics
 */
export interface TransactionStats {
  totalTransactions: number;
  totalPurchases: number;
  totalWithdrawals: number;
  totalVolume: number;
  withdrawalVolume?:number;
  purchaseVolume?:number;
  averageTransactionSize: number;
  pendingCount: number;
  confirmedCount: number;
  failedCount: number;
  processingCount:number;
  averageTransactionAmount?:number;
}