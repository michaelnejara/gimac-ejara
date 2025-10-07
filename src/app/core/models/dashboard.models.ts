/**
 * Data Transfer Object for Dashboard Statistics
 * Contains all metrics for transactions, bonds, and customers
 */
export interface DashboardStatsDTO {
  /** Total number of transactions */
  totalTransactions: number;
  /** Number of successfully completed transactions */
  successfulTransactions: number;
  /** Number of failed transactions */
  failedTransactions: number;
  /** Number of transactions awaiting completion */
  pendingTransactions: number;
  /** Number of reconciled transactions */
  reconciledTransactions: number;
  /** Number of unreconciled transactions */
  unreconciledTransactions: number;
  /** Total number of bonds published */
  totalBondsPublished: number;
  /** Number of bonds that have been sold */
  bondsSold: number;
  /** Number of bonds that have been settled */
  bondsSettled: number;
  /** Number of bonds pending settlement */
  bondsPendingSettlement: number;
  /** Number of unique customers in the system */
  numberOfUniqueCustomer: number;
}