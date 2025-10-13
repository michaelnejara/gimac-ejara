/**
 * Transaction Type Enum
 */
export type TransactionType = 'purchase' | 'withdrawal';

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
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  
  // Partner & Customer Info
  partnerId: number;
  partnerName: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  
  // Bond Info
  bondId: number;
  bondName: string;
  bondCode: string;
  
  // Financial Details
  units?: number;
  pricePerUnit?: number;
  amount: number;
  fee: number;
  totalAmount: number;
  currency: string;
  commission?:number;
  commissionRate?:number;
  fees?:number;
  netAmount?:number;
  
  // Payment Details
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Blockchain Details
  blockchainStatus: BlockchainStatus;
  blockchainTxHash?: string;
  blockchainConfirmations?: number;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  dateCreated: string;
  dateConfirmed?: string;
  dateCompleted?: string;
  lastUpdated: string;
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
 * Transactions List Response
 */
export interface TransactionsResponse {
  message: string;
  data: BondTransaction[];
  total: number;
  limit: number;
  offset: number;
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