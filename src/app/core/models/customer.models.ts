/**
 * Customer Entity
 */
export interface Customer {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  totalInvestment: number;
  totalWithdrawn: number;
  currentBalance: number;
  activeBondsCount: number;
  dateCreated: string;
  lastActivity: string;
}

/**
 * Customer Filter Parameters
 */
export interface CustomerFilterParams {
  partnerId?: number;
  partnerUserId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}

/**
 * Customers List Response
 */
export interface CustomersResponse {
  message: string;
  data: Customer[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Single Customer Response
 */
export interface CustomerResponse {
  message: string;
  data: Customer;
}