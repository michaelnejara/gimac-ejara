/**
 * Partner Status Enum
 */
export type PartnerStatus = 'active' | 'suspended' | 'inactive';

/**
 * Allowed Bond (nested in Partner listing)
 */
export interface AllowedBond {
  id: number;
  name: string;
}

/**
 * Partner Entity (used in listing)
 * Matches API response from GET /partners
 */
export interface Partner {
  id: number;
  name: string;
  code: string;
  apiKey: string;
  webhookUrl?: string;
  allowedIpAddresses: string[];
  commissionRate: number;
  settlementAccount: string;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  status: PartnerStatus;
  createdAt: string; // API uses createdAt/updatedAt in listing
  updatedAt: string;
  allowedBonds: AllowedBond[];
}

/**
 * Single Partner (used in get by id)
 * Matches API response from GET /partners/:id
 */
export interface SinglePartner {
  id: number;
  name: string;
  code: string;
  apiKey: string;
  apiSecret: string;
  description?: string;
  webhookUrl?: string;
  allowedIpAddresses: string[];
  preferredLanguage?: string;
  commissionRate: number;
  settlementAccount: string;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: PartnerStatus;
  dateCreated: string;
  dateUpdated: string;
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Partner Detail (legacy - use SinglePartner instead)
 * @deprecated Use SinglePartner for new code
 */
export type PartnerDetail = SinglePartner;

/**
 * Create Partner Request (Updated)
 */
export interface CreatePartnerRequest {
  name: string;
  description?: string;
  webhookUrl?: string;
  allowedIpAddresses?: string[];
  allowedBonds: number[];
  commissionRate: number;
  settlementAccount?: string;
  minTransactionAmount: number;
  maxTransactionAmount?: number;
  dailyTransactionLimit?: number;
  monthlyTransactionLimit?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Update Partner Request (Updated)
 */
export interface UpdatePartnerRequest {
  name?: string;
  description?: string;
  webhookUrl?: string;
  allowedIpAddresses?: string[];
  commissionRate?: number;
  settlementAccount?: string;
  minTransactionAmount?: number;
  maxTransactionAmount?: number;
  dailyTransactionLimit?: number;
  monthlyTransactionLimit?: number;
}

/**
 * Update Partner Status Request
 */
export interface UpdatePartnerStatusRequest {
  status: PartnerStatus;
  reason: string;
}

/**
 * Assign Bonds to Partner Request
 */
export interface AssignBondsRequest {
  bondIds: number[];
  reason?: string;
}

/**
 * Remove Bonds from Partner Request
 */
export interface RemoveBondsRequest {
  bondIds: number[];
  reason?: string;
}

/**
 * Assign/Remove Bonds Response
 */
export interface BondAssignmentResponse {
  message: string;
  data: {
    assignedCount?: number;
    removedCount?: number;
    bondIds: number[];
  };
}

/**
 * Partner Filter Parameters
 */
export interface PartnerFilterParams {
  status?: PartnerStatus;
  code?: string;
  name?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'dateCreated' | 'name';
  sortOrder?: 'asc' | 'desc';

  minCommissionRate?: number;
  maxCommissionRate?: number;
  bondId?: number;
}

/**
 * Partners List Response
 */
export interface PartnersResponse {
  message: string;
  data: Partner[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Single Partner Response (get by id)
 */
export interface PartnerResponse {
  message: string;
  data: PartnerDetail;
}

/**
 * Create Partner Response
 */
export interface CreatePartnerResponse {
  message: string;
  data: {
    partnerId: number;
    name: string;
    code: string;
    status: PartnerStatus;
  };
}

/**
 * Update Partner Response
 */
export interface UpdatePartnerResponse {
  message: string;
  data: {
    id: number;
    name: string;
    dateUpdated: string;
  };
}

/**
 * Status Update Response
 */
export interface StatusUpdateResponse {
  message: string;
}

export interface PartnerStatistics {
  totalTransactions:number;
  totalVolume:number;
  averageTransactionAmount:number;
  activeCustomers: number;
  totalCommissionEarned:number;
  monthlyGrowth:number;
  successRate:number;
}