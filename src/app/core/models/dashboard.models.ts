/**
 * Data Transfer Object for Dashboard Statistics
 * Contains all metrics for partners, customers, transactions, and financial operations
 */
export interface DashboardStatsDTO {
  /** Total number of partners */
  totalPartners: number;
  /** Number of active partners */
  totalActivePartners: number;
  /** Total number of customers */
  totalCustomers: number;
  /** Number of active customers */
  totalActiveCustomers: number;
  /** Total number of deposit transactions */
  totalDeposits: number;
  /** Total amount deposited */
  totalDepositAmount: number;
  /** Total number of withdrawal transactions */
  totalWithdrawals: number;
  /** Total amount withdrawn */
  totalWithdrawalAmount: number;
  /** Total commission earned */
  totalCommissionEarned: number;
  /** Total principal amount invested */
  totalPrincipalInvested: number;
  /** Total interest paid to customers */
  totalInterestPaid: number;
  /** Number of transactions pending completion */
  totalPendingTransactions: number;
  /** Number of failed transactions */
  totalFailedTransactions: number;
}

/**
 * Dashboard filter parameters
 * All parameters are optional for filtering dashboard statistics
 */
export interface DashboardFilterParams {
  /** Filter from date (ISO 8601 format) */
  startDate?: string;
  /** Filter to date (ISO 8601 format) */
  endDate?: string;
  /** Filter by specific partner ID */
  partnerId?: string;
  /** Partner name for display purposes (not sent to API) */
  partnerName?: string;
}