/**
 * Customer Entity (List Item)
 */
export interface Customer {
  id: number;
  partnerUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  partnerId: number;
  partnerName: string;
  dateCreated: string;
}

/**
 * Customer Details (Single Customer)
 */
export interface CustomerDetails extends Customer {
  partnerCode: string;
  totalInvestment: number;
  totalInterestEarned: number;
  activeBonds: number;
  lastActivityDate: string;
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
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Single Customer Response
 */
export interface CustomerResponse {
  message: string;
  data: CustomerDetails;
}