/**
 * Login payload with geolocation data
 */
export interface LoginPayload {
  /** Username or phone number for authentication */
  usernameOrPhoneNumber: string;
  /** User password */
  password: string;
  /** Login option type (username, phone, email) */
  loginOption: 'username' | 'phone' | 'email';
  /** User's IP address from geolocation API */
  ipAddress: string;
  /** GPS latitude coordinate */
  latitude: string;
  /** GPS longitude coordinate */
  longitude: string;
  /** Unique device identifier (UUID v4) */
  deviceId: string;
}

/**
 * MFA data structure
 */
export interface MfaData {
  /** MFA method ID */
  id: number;
  /** MFA status */
  status: 'active' | 'inactive';
  /** MFA type */
  type: 'authenticator' | 'sms' | 'email';
}

/**
 * First login response (requires MFA)
 */
export interface LoginMfaResponse {
  /** Response message */
  message: string;
  /** Response data */
  data: {
    /** Reference ID for completing login */
    loginReference: string;
    /** Whether phone verification is required */
    shouldVerifyPhoneNumber: boolean;
    /** Whether MFA completion is required */
    shouldCompleteMfa: boolean;
    /** Whether user can access admin panel */
    canAccessPanel: boolean;
    /** Available MFA methods */
    mfaData: MfaData[];
  };
}

/**
 * Complete login payload (with OTP)
 */
export interface CompleteLoginPayload {
  /** 6-digit OTP code from authenticator */
  otpCode: string;
  /** Login reference from first step */
  loginReference: string;
}

/**
 * Customer data from successful login
 */
export interface CustomerData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  preferredLanguage: 'en' | 'fr' | 'es';
  kycLevel: number;
  isAccountVerified: number;
  isPhoneNumberVerified: number;
  phoneNumberVerifiedAt: string | null;
  isEmailVerified: number;
  emailVerifiedAt: string | null;
  isPartner: number;
  isAgent: number;
  isTester: number;
  isAMigratedAccount: number;
  appFlow: string;
  referralCode: string;
  canBuy: number;
  canSell: number;
  countryOfBirthCode: string | null;
  canSendFromXpress: number;
  canReceiveFromXpress: number;
  canAccessSavings: number;
  avatar: string;
  appPlatform: string;
  countryId: number;
  countryCode: string;
  countryName: string;
  countryNameEn: string;
  countryNameFr: string;
  countryContinent: string;
  currencyCode: string;
  deviceId: string;
  accountType: 'admin' | 'user' | 'agent' | 'partner';
  maxPaymentSettings: number;
  portfolioDescription: string | null;
  accountStatus: 'confirmed' | 'pending' | 'suspended';
  posAgentZone: string | null;
  posAgentDetailId: number | null;
  isAPosAgent: number;
  companyId: number;
  companyName: string;
  companyCode: string;
  referrerUsername: string | null;
  isReferrerAPartner: number | null;
  isReferrerAnAgent: number | null;
  merchantCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  permissions: string[] | null;
  roles: string[] | null;
  ussdPinHash: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  oldDbId: number;
}

/**
 * Complete login response with tokens
 */
export interface LoginSuccessResponse {
  /** Response message */
  message: string;
  /** Response data */
  data: {
    /** JWT authentication token */
    authToken: string;
    /** JWT refresh token */
    refreshToken: string;
    /** Complete customer data */
    customerData: CustomerData;
  };
}

/**
 * Login error response
 */
export interface LoginErrorResponse {
  /** Error code identifier */
  errorCode: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Simplified User interface for application
 */
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string;
  accountType: 'admin' | 'user' | 'agent' | 'partner';
  accountStatus: 'confirmed' | 'pending' | 'suspended';
  roles: string[];
  permissions: string[];
  kycLevel: number;
  countryCode: string;
  countryName: string;
  currencyCode: string;
  preferredLanguage: 'en' | 'fr' | 'es';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  canAccessPanel: boolean;
  companyName: string;
  companyCode: string;
  createdAt: string;
}

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error';
  children?: MenuItem[];
  expanded?: boolean;
}

/**
 * Forgot Password Flow Interfaces
 */

/**
 * Initiate password reset payload
 */
export interface InitiatePasswordResetPayload {
  /** Unique device identifier */
  deviceId: string;
  /** Email or phone number for password reset */
  emailOrPhoneNumber: string;
  /** Reset option type */
  resetOption: 'email' | 'phone';
}

/**
 * Initiate password reset success response
 */
export interface InitiatePasswordResetResponse {
  /**
   * Data property
  */
  data: {
    /** Reset reference ID for completing the flow */
    resetReference: string;
    /** Type of reset (email or phone) */
    type: 'email' | 'phone';
    /** MFA reference for validation */
    reference: string;
    /** Expiration time in seconds */
    expiresAt: number;
    /** Time to wait before resending (ISO 8601) */
    timeToWait: string;
  }
  /**
   * Message property
   */
  message: string
}

/**
 * Initiate password reset error response
 */
export interface InitiatePasswordResetErrorResponse {
  /** Error code identifier */
  errorCode: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Validate password reset code payload
 */
export interface ValidatePasswordResetCodePayload {
  /** MFA reference from initiate step */
  mfaReference: string;
  /** 6-digit OTP code */
  otpCode: string;
}

/**
 * Validate password reset code success response
 */
export interface ValidatePasswordResetCodeResponse {
  /** Success message */
  message: string;
}

/**
 * Complete password reset payload
 */
export interface CompletePasswordResetPayload {
  /** MFA reference from initiate step */
  mfaReference: string;
  /** Reset reference from initiate step */
  resetReference: string;
  /** New password */
  newPassword: string;
}

/**
 * Complete password reset success response
 */
export interface CompletePasswordResetResponse {
  /** Success message */
  message: string;
}