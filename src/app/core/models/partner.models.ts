/**
 * Partner Status Enum
 */
export type PartnerStatus = 'active' | 'suspended' | 'inactive';

/**
 * Partner Entity
 */
export interface Partner {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: PartnerStatus;
  apiKey: string;
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
  dateCreated: string;
  lastUpdated: string;
}

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
}

/**
 * Partners List Response
 */
export interface PartnersResponse {
  message: string;
  data: Partner[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Single Partner Response
 */
export interface PartnerResponse {
  message: string;
  data: Partner;
}

/**
 * Status Update Response
 */
export interface StatusUpdateResponse {
  message: string;
  data: {
    id: number;
    status: PartnerStatus;
    updatedAt: string;
  };
}