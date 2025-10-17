# Bonds & Bond Transactions API Specification

**Version:** 1.0
**Date:** 2025-10-17
**Target:** Backend Implementation
**Purpose:** Dashboard KPIs and Core API Endpoints

---

## Table of Contents

1. [Overall Dashboard KPIs](#overall-dashboard-kpis)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [User Stories](#user-stories)
4. [Detailed API Specifications](#detailed-api-specifications)
5. [Data Models](#data-models)
6. [Dashboard UI Requirements](#dashboard-ui-requirements)

---

## Overall Dashboard KPIs

### Financial Performance Metrics

#### 1. Total Bonds Value
**Description:** Total monetary value of all active bonds in the system
**Calculation:** Sum of `amount` field for all bonds with `status = 'active'`
**Format:** Currency (XAF)
**Dashboard Display:** Large metric card with trend indicator (% change from previous period)

#### 2. Total Amount Purchased
**Description:** Total amount invested across all bonds
**Calculation:** Sum of `amountPurchased` field for all bonds
**Format:** Currency (XAF)
**Dashboard Display:** Large metric card with comparison to total bonds value

#### 3. Subscription Rate
**Description:** Percentage of bond capacity that has been purchased
**Calculation:** `(Total Amount Purchased / Total Bonds Value) × 100`
**Format:** Percentage
**Dashboard Display:** Progress bar with percentage label
**Target:** 80% or higher

#### 4. Total Available Balance
**Description:** Remaining bond capacity available for purchase
**Calculation:** Sum of `availableBalance` field for all bonds
**Format:** Currency (XAF)
**Dashboard Display:** Metric card with trend indicator

#### 5. Average Daily Interest Rate
**Description:** Weighted average daily interest rate across all active bonds
**Calculation:** `Σ(bond.dailyInterest × bond.amountPurchased) / Total Amount Purchased`
**Format:** Percentage (4 decimal places)
**Dashboard Display:** Metric card with comparison to market average

---

### Transaction Performance Metrics

#### 6. Total Transactions
**Description:** Total number of bond transactions (all time or filtered by date range)
**Calculation:** Count of all transactions (filtered by date range if provided)
**Format:** Number
**Dashboard Display:** Metric card with % change from previous period

#### 7. Transaction Success Rate
**Description:** Percentage of successful transactions
**Calculation:** `(Successful Transactions / Total Transactions) × 100`
**Format:** Percentage
**Dashboard Display:** Metric card with status indicator (green if >95%, yellow if 90-95%, red if <90%)
**Target:** ≥95%

#### 8. Total Transaction Volume
**Description:** Total monetary value of all transactions (all time or filtered by date range)
**Calculation:** Sum of transaction amounts
**Format:** Currency (XAF)
**Dashboard Display:** Metric card with trend chart

#### 9. Average Transaction Value
**Description:** Average value per transaction
**Calculation:** `Total Transaction Volume / Total Transactions`
**Format:** Currency (XAF)
**Dashboard Display:** Metric card with comparison to previous period

---

### Operational Health Metrics

#### 10. Active Bonds Count
**Description:** Number of bonds currently available for purchase
**Calculation:** Count of bonds with `status = 'active'`
**Format:** Number
**Dashboard Display:** Metric card with breakdown by type (government, corporate, etc.)

#### 11. Bonds Nearing Maturity
**Description:** Number of bonds maturing within next 90 days
**Calculation:** Count of bonds with `maturityDate <= (today + 90 days)`
**Format:** Number
**Dashboard Display:** Alert card with list of bonds and maturity dates

#### 12. Average Bond Lifetime
**Description:** Average lifetime of all active bonds
**Calculation:** Average of `lifetime` field for active bonds
**Format:** Days (convert to years/months for display)
**Dashboard Display:** Metric card with distribution chart

---

## API Endpoints Overview

### Core Endpoints Required

1. **GET** `/api/dashboard/kpis` - Retrieve all dashboard KPIs
2. **GET** `/api/bonds` - List bonds with filtering and pagination
3. **GET** `/api/bonds/:id` - Get single bond details
4. **POST** `/api/bonds` - Create new bond
5. **PUT** `/api/bonds/:id` - Update bond
6. **DELETE** `/api/bonds/:id` - Delete bond
7. **GET** `/api/bond-transactions` - List bond transactions
8. **GET** `/api/bond-transactions/:id` - Get transaction details
9. **GET** `/api/partners/:id/bonds` - Get bonds assigned to partner
10. **GET** `/api/customers/:id/bonds` - Get customer's bond holdings
11. **GET** `/api/dashboard/trends` - Get historical trends for charts

---

## User Stories

### Dashboard User Stories

**As an administrator**, I want to:
1. View all key financial metrics on a single dashboard so I can monitor overall system health
2. See transaction success rates and volumes to identify potential issues
3. Identify bonds nearing maturity to plan for renewals or replacements
4. Compare current performance against previous periods to understand trends
5. Filter dashboard data by date range to analyze specific time periods

### Bond Management User Stories

**As an administrator**, I want to:
1. Create new bonds with all required fields (name, amount, interest rates, maturity dates)
2. Update existing bond details (descriptions, status, available balance)
3. View all bonds with filtering by status, partner, date range
4. Assign bonds to specific partners for distribution
5. See which customers have purchased each bond

### Transaction Monitoring User Stories

**As an administrator**, I want to:
1. View all bond transactions with filtering and search capabilities
2. Track transaction status (pending, completed, failed)
3. Investigate failed transactions to understand reasons
4. Monitor transaction volumes by time period, partner, and bond type
5. Export transaction data for reporting and compliance

---

## Detailed API Specifications

### 1. Dashboard KPIs Endpoint

#### GET `/api/dashboard/kpis`

**Description:** Returns all dashboard KPI metrics in a single request

**Query Parameters:**
- `startDate` (optional): ISO 8601 date string. If not provided, includes all data from the beginning
- `endDate` (optional): ISO 8601 date string. If not provided, includes all data up to current date
- `partnerId` (optional): Filter metrics by specific partner

**Default Behavior:** If no date range is provided, returns all-time statistics

**Response:**
```json
{
  "message": "Dashboard KPIs retrieved successfully",
  "data": {
    "financial": {
      "totalBondsValue": {
        "value": 10000000000,
        "currency": "XAF",
        "change": 5.2,
        "changeType": "percentage",
        "trend": "up"
      },
      "totalAmountPurchased": {
        "value": 7500000000,
        "currency": "XAF",
        "change": 8.5,
        "changeType": "percentage",
        "trend": "up"
      },
      "subscriptionRate": {
        "value": 75.0,
        "unit": "percentage",
        "target": 80.0,
        "status": "on-track"
      },
      "totalAvailableBalance": {
        "value": 2500000000,
        "currency": "XAF",
        "change": -8.5,
        "changeType": "percentage",
        "trend": "down"
      },
      "averageDailyInterestRate": {
        "value": 0.0162,
        "unit": "percentage",
        "formatted": "1.62%",
        "marketAverage": 0.0155
      }
    },
    "transactions": {
      "totalCount": {
        "value": 15234,
        "change": 12.5,
        "previousValue": 13542
      },
      "successRate": {
        "value": 96.8,
        "unit": "percentage",
        "status": "good",
        "successCount": 14746,
        "failureCount": 488
      },
      "totalVolume": {
        "value": 4500000000,
        "currency": "XAF",
        "change": 15.3,
        "trend": "up"
      },
      "averageValue": {
        "value": 295500,
        "currency": "XAF",
        "change": 2.4,
        "previousValue": 288500
      }
    },
    "operational": {
      "activeBondsCount": {
        "value": 15,
        "byType": {
          "government": 6,
          "corporate": 7,
          "municipal": 2
        }
      },
      "bondsNearingMaturity": {
        "value": 3,
        "daysThreshold": 90,
        "bonds": [
          {
            "id": 2,
            "name": "Corporate Bond Series A",
            "code": "CBS-A",
            "maturityDate": "2025-12-15",
            "daysUntilMaturity": 59,
            "amount": 500000000,
            "amountPurchased": 425000000
          },
          {
            "id": 5,
            "name": "Municipal Development Bond",
            "code": "MDB-2024",
            "maturityDate": "2026-01-20",
            "daysUntilMaturity": 95,
            "amount": 300000000,
            "amountPurchased": 280000000
          }
        ]
      },
      "averageBondLifetime": {
        "value": 1825,
        "unit": "days",
        "formatted": "5 years"
      }
    },
    "metadata": {
      "calculatedAt": "2025-10-17T10:30:00Z",
      "startDate": null,
      "endDate": null,
      "dateRangeType": "all_time",
      "currency": "XAF",
      "partnerId": null
    }
  }
}
```

**Example with Date Range:**
```
GET /api/dashboard/kpis?startDate=2025-09-01&endDate=2025-09-30
```

**Response with Date Range:**
```json
{
  "message": "Dashboard KPIs retrieved successfully",
  "data": {
    "financial": { /* same structure */ },
    "transactions": { /* filtered by date range */ },
    "operational": { /* same structure */ },
    "metadata": {
      "calculatedAt": "2025-10-17T10:30:00Z",
      "startDate": "2025-09-01",
      "endDate": "2025-09-30",
      "dateRangeType": "custom",
      "currency": "XAF",
      "partnerId": null
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid date range (startDate > endDate)
- `401` - Unauthorized
- `404` - Partner not found (if partnerId provided)
- `500` - Server error

---

### 2. Dashboard Trends Endpoint

#### GET `/api/dashboard/trends`

**Description:** Returns historical data for charts and trend analysis

**Query Parameters:**
- `metric` (required): Metric to retrieve
  - Options: 'transaction_volume', 'transaction_count', 'subscription_rate', 'active_customers', 'active_bonds'
- `startDate` (optional): ISO 8601 date string (default: 30 days ago)
- `endDate` (optional): ISO 8601 date string (default: today)
- `granularity` (optional): 'daily', 'weekly', 'monthly' (default: 'daily')
- `partnerId` (optional): Filter by specific partner
- `bondId` (optional): Filter by specific bond

**Default Behavior:** If no date range provided, returns last 30 days

**Response:**
```json
{
  "message": "Trend data retrieved successfully",
  "data": {
    "metric": "transaction_volume",
    "granularity": "daily",
    "currency": "XAF",
    "dataPoints": [
      {
        "date": "2025-09-17",
        "value": 14500000,
        "count": 49
      },
      {
        "date": "2025-09-18",
        "value": 16200000,
        "count": 55
      },
      {
        "date": "2025-09-19",
        "value": 13800000,
        "count": 47
      }
    ],
    "summary": {
      "total": 450000000,
      "average": 15000000,
      "min": 8500000,
      "max": 24500000,
      "trend": "up",
      "changePercentage": 15.3
    },
    "metadata": {
      "startDate": "2025-09-17",
      "endDate": "2025-10-17",
      "partnerId": null,
      "bondId": null
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid metric or date range
- `401` - Unauthorized
- `500` - Server error

---

### 3. Bonds Listing Endpoint

#### GET `/api/bonds`

**Description:** Retrieve paginated list of bonds with filtering

**Query Parameters:**
- `limit` (optional): Number of records per page (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `status` (optional): Filter by status ('active', 'inactive', 'matured')
- `keyword` (optional): Search by name or code
- `partnerId` (optional): Filter by assigned partner
- `customerId` (optional): Filter by customer holdings
- `sortBy` (optional): Field to sort by (default: 'dateCreated')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')
- `startDate` (optional): Filter bonds created after this date (ISO 8601)
- `endDate` (optional): Filter bonds created before this date (ISO 8601)

**Default Behavior:** Returns all bonds (paginated) if no filters provided

**Response:**
```json
{
  "message": "Bonds retrieved successfully",
  "data": {
    "bonds": [
      {
        "id": 1,
        "name": "Government Treasury Bond 2024",
        "code": "GTB2024",
        "descriptionEn": "Government-backed treasury bond with guaranteed returns",
        "descriptionFr": "Obligation du Trésor soutenue par le gouvernement",
        "color": "#1976D2",
        "amount": 1000000000,
        "amountPurchased": 325000000,
        "availableBalance": 675000000,
        "lifetime": 2190,
        "startDate": "2024-01-01",
        "maturityDate": "2029-12-31",
        "dateCreated": "2024-01-01T10:00:00Z",
        "dailyInterest": 0.0151,
        "interestValue": 5.5,
        "maturityPercentage": 33.0,
        "unlockingPenaltyRate": 2.0,
        "defaultFiatCurrency": "XAF",
        "rank": 1,
        "interestCalculationPeriod": "daily",
        "issuerNameEn": "Government of Cameroon",
        "issuerNameFr": "Gouvernement du Cameroun",
        "withdrawalPeriod": "maturity",
        "status": "active",
        "statusColorCode": "#4CAF50"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0,
      "totalPages": 2,
      "currentPage": 1
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

### 4. Create Bond Endpoint

#### POST `/api/bonds`

**Description:** Create a new bond

**Request Body:**
```json
{
  "name": "Corporate Bond 2025",
  "code": "CB2025",
  "descriptionEn": "High-yield corporate bond with quarterly interest payments",
  "descriptionFr": "Obligation d'entreprise à haut rendement avec paiements trimestriels",
  "color": "#FF9800",
  "amount": 500000000,
  "lifetime": 1825,
  "startDate": "2025-01-01",
  "maturityDate": "2030-01-01",
  "dailyInterest": 0.0192,
  "interestValue": 7.0,
  "maturityPercentage": 42.0,
  "unlockingPenaltyRate": 3.5,
  "defaultFiatCurrency": "XAF",
  "rank": 1,
  "interestCalculationPeriod": "daily",
  "issuerNameEn": "Ejara Corporation",
  "issuerNameFr": "Ejara Corporation",
  "withdrawalPeriod": "maturity",
  "status": "active"
}
```

**Validation Rules:**
- `name`: Required, max 200 characters
- `code`: Required, unique, max 50 characters, alphanumeric + hyphens
- `amount`: Required, positive number, min 1000000 (1M XAF)
- `lifetime`: Required, positive integer (days), min 30
- `startDate`: Required, ISO 8601, cannot be in the past
- `maturityDate`: Required, ISO 8601, must be after startDate
- `dailyInterest`: Required, decimal, min 0, max 1 (100%)
- `interestValue`: Required, decimal, min 0, max 100
- `unlockingPenaltyRate`: Required, decimal, min 0, max 100
- `interestCalculationPeriod`: Required, enum value
- `withdrawalPeriod`: Required, enum value
- `status`: Required, enum value

**Response:**
```json
{
  "message": "Bond created successfully",
  "data": {
    "id": 16,
    "name": "Corporate Bond 2025",
    "code": "CB2025",
    "dateCreated": "2025-10-17T10:30:00Z",
    "status": "active",
    "availableBalance": 500000000,
    "amountPurchased": 0,
    "amount": 500000000
  }
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Validation error (invalid input)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (duplicate code)
- `500` - Server error

---

### 5. Update Bond Endpoint

#### PUT `/api/bonds/:id`

**Description:** Update an existing bond

**Request Body:** (All fields optional, only include fields to update)
```json
{
  "name": "Government Treasury Bond 2024 - Updated",
  "descriptionEn": "Updated description",
  "descriptionFr": "Description mise à jour",
  "status": "inactive",
  "color": "#2196F3"
}
```

**Restrictions:**
- Cannot update `code` after creation
- Cannot update `amount` if `amountPurchased > 0`
- Cannot change dates if bond has active transactions
- Cannot change `dailyInterest` or `interestValue` if customers have holdings

**Response:**
```json
{
  "message": "Bond updated successfully",
  "data": {
    "id": 1,
    "name": "Government Treasury Bond 2024 - Updated",
    "code": "GTB2024",
    "status": "inactive",
    "dateUpdated": "2025-10-17T10:35:00Z"
  }
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (cannot modify due to restrictions)
- `404` - Bond not found
- `500` - Server error

---

### 6. Delete Bond Endpoint

#### DELETE `/api/bonds/:id`

**Description:** Soft delete a bond (sets status to 'inactive')

**Restrictions:**
- Cannot delete if `amountPurchased > 0`
- Cannot delete if bond has active customer holdings
- Performs soft delete (status = 'inactive'), not permanent deletion

**Response:**
```json
{
  "message": "Bond deleted successfully",
  "data": {
    "id": 1,
    "status": "inactive",
    "deletedAt": "2025-10-17T10:40:00Z"
  }
}
```

**Status Codes:**
- `200` - Deleted successfully
- `400` - Cannot delete (has active holdings)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Bond not found
- `500` - Server error

---

### 7. Bond Transactions Listing Endpoint

#### GET `/api/bond-transactions`

**Description:** Retrieve paginated list of bond transactions

**Query Parameters:**
- `limit` (optional): Number of records per page (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `bondId` (optional): Filter by specific bond
- `customerId` (optional): Filter by specific customer
- `partnerId` (optional): Filter by specific partner
- `status` (optional): Filter by transaction status ('pending', 'completed', 'failed', 'cancelled')
- `transactionType` (optional): 'purchase', 'withdrawal', 'interest_payout'
- `startDate` (optional): Filter transactions after this date (ISO 8601)
- `endDate` (optional): Filter transactions before this date (ISO 8601)
- `sortBy` (optional): Field to sort by (default: 'dateCreated')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')
- `keyword` (optional): Search by reference or customer name

**Default Behavior:** Returns all transactions (paginated) if no filters provided

**Response:**
```json
{
  "message": "Bond transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 1001,
        "bondId": 1,
        "bondName": "Government Treasury Bond 2024",
        "bondCode": "GTB2024",
        "customerId": 5042,
        "customerName": "Jean Kouassi",
        "customerEmail": "jean.kouassi@example.com",
        "partnerId": 1,
        "partnerName": "Ejara Financial Services",
        "transactionType": "purchase",
        "amount": 500000,
        "currency": "XAF",
        "status": "completed",
        "dateCreated": "2025-10-17T08:15:00Z",
        "dateCompleted": "2025-10-17T08:15:23Z",
        "reference": "TXN-GTB2024-1001",
        "interestRate": 5.5,
        "maturityDate": "2029-12-31",
        "failureReason": null
      },
      {
        "id": 1002,
        "bondId": 3,
        "bondName": "Corporate Infrastructure Bond",
        "bondCode": "CIB-2025",
        "customerId": 5043,
        "customerName": "Marie Diop",
        "customerEmail": "marie.diop@example.com",
        "partnerId": 2,
        "partnerName": "FinTech Partners SA",
        "transactionType": "purchase",
        "amount": 1000000,
        "currency": "XAF",
        "status": "failed",
        "dateCreated": "2025-10-17T09:22:00Z",
        "dateCompleted": null,
        "reference": "TXN-CIB-2025-1002",
        "interestRate": 6.8,
        "maturityDate": "2030-06-30",
        "failureReason": "Insufficient balance"
      }
    ],
    "pagination": {
      "total": 15234,
      "limit": 10,
      "offset": 0,
      "totalPages": 1524,
      "currentPage": 1
    },
    "summary": {
      "totalVolume": 4500000000,
      "successRate": 96.8,
      "averageTransactionValue": 295500
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

### 8. Get Single Transaction Endpoint

#### GET `/api/bond-transactions/:id`

**Description:** Get detailed information about a specific transaction

**Response:**
```json
{
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 1001,
    "bondId": 1,
    "bond": {
      "id": 1,
      "name": "Government Treasury Bond 2024",
      "code": "GTB2024",
      "interestValue": 5.5,
      "maturityDate": "2029-12-31"
    },
    "customerId": 5042,
    "customer": {
      "id": 5042,
      "firstName": "Jean",
      "lastName": "Kouassi",
      "email": "jean.kouassi@example.com",
      "phone": "+237670123456"
    },
    "partnerId": 1,
    "partner": {
      "id": 1,
      "name": "Ejara Financial Services",
      "code": "EFS"
    },
    "transactionType": "purchase",
    "amount": 500000,
    "currency": "XAF",
    "status": "completed",
    "dateCreated": "2025-10-17T08:15:00Z",
    "dateCompleted": "2025-10-17T08:15:23Z",
    "reference": "TXN-GTB2024-1001",
    "paymentMethod": "mobile_money",
    "paymentReference": "MM-20251017-081500",
    "interestRate": 5.5,
    "expectedReturn": 27500,
    "maturityDate": "2029-12-31",
    "metadata": {
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "deviceId": "device-uuid"
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Transaction not found
- `500` - Server error

---

### 9. Get Partner Bonds Endpoint

#### GET `/api/partners/:partnerId/bonds`

**Description:** Get all bonds assigned to a specific partner

**Query Parameters:**
- `limit` (optional): Number of records per page (default: 10)
- `offset` (optional): Number of records to skip (default: 0)
- `status` (optional): Filter by bond status

**Response:**
```json
{
  "message": "Partner bonds retrieved successfully",
  "data": {
    "partnerId": 1,
    "partnerName": "Ejara Financial Services",
    "bonds": [
      {
        "id": 1,
        "name": "Government Treasury Bond 2024",
        "code": "GTB2024",
        "status": "active",
        "amount": 1000000000,
        "amountPurchased": 325000000,
        "subscriptionRate": 32.5,
        "interestValue": 5.5
      }
    ],
    "pagination": {
      "total": 6,
      "limit": 10,
      "offset": 0
    },
    "summary": {
      "totalBonds": 6,
      "activeBonds": 5,
      "totalVolume": 2100000000,
      "totalPurchased": 1450000000,
      "averageSubscriptionRate": 69.0
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Partner not found
- `500` - Server error

---

### 10. Get Customer Bonds Endpoint

#### GET `/api/customers/:customerId/bonds`

**Description:** Get all bond holdings for a specific customer

**Query Parameters:**
- `limit` (optional): Number of records per page (default: 10)
- `offset` (optional): Number of records to skip (default: 0)
- `status` (optional): Filter by holding status ('active', 'matured', 'withdrawn')

**Response:**
```json
{
  "message": "Customer bonds retrieved successfully",
  "data": {
    "customerId": 5042,
    "customerName": "Jean Kouassi",
    "holdings": [
      {
        "id": 1,
        "bondId": 1,
        "bondName": "Government Treasury Bond 2024",
        "bondCode": "GTB2024",
        "amountInvested": 500000,
        "currentValue": 527500,
        "interestEarned": 27500,
        "interestRate": 5.5,
        "purchaseDate": "2025-10-17T08:15:00Z",
        "maturityDate": "2029-12-31",
        "status": "active",
        "canWithdraw": false,
        "withdrawalPenalty": 10000
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 10,
      "offset": 0
    },
    "summary": {
      "totalInvested": 1500000,
      "currentValue": 1582500,
      "totalInterestEarned": 82500,
      "activeHoldings": 3,
      "maturedHoldings": 0
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Customer not found
- `500` - Server error

---

## Data Models

### Bond Model
```typescript
interface Bond {
  id: number;
  name: string;
  code: string;
  descriptionEn: string;
  descriptionFr: string;
  color: string;
  amount: number;
  amountPurchased: number;
  availableBalance: number;
  lifetime: number;
  startDate: string;
  maturityDate: string;
  dateCreated: string;
  dailyInterest: number;
  interestValue: number;
  maturityPercentage: number;
  unlockingPenaltyRate: number;
  defaultFiatCurrency: string;
  rank: number;
  interestCalculationPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  issuerNameEn: string;
  issuerNameFr: string;
  withdrawalPeriod: 'anytime' | 'maturity' | 'after_period';
  status: 'active' | 'inactive' | 'matured';
  statusColorCode: string;
}
```

### Bond Transaction Model
```typescript
interface BondTransaction {
  id: number;
  bondId: number;
  bondName: string;
  bondCode: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  partnerId: number;
  partnerName: string;
  transactionType: 'purchase' | 'withdrawal' | 'interest_payout';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  dateCreated: string;
  dateCompleted: string | null;
  reference: string;
  interestRate: number;
  maturityDate: string;
  failureReason: string | null;
  paymentMethod?: string;
  paymentReference?: string;
  metadata?: Record<string, any>;
}
```

### Dashboard KPIs Model
```typescript
interface DashboardKPIs {
  financial: {
    totalBondsValue: MetricValue;
    totalAmountPurchased: MetricValue;
    subscriptionRate: MetricValue;
    totalAvailableBalance: MetricValue;
    averageDailyInterestRate: MetricValue;
  };
  transactions: {
    totalCount: MetricValue;
    successRate: MetricValue;
    totalVolume: MetricValue;
    averageValue: MetricValue;
  };
  operational: {
    activeBondsCount: OperationalMetric;
    bondsNearingMaturity: MaturityMetric;
    averageBondLifetime: MetricValue;
  };
  metadata: {
    calculatedAt: string;
    startDate: string | null;
    endDate: string | null;
    dateRangeType: 'all_time' | 'custom';
    currency: string;
    partnerId: number | null;
  };
}

interface MetricValue {
  value: number;
  currency?: string;
  unit?: string;
  formatted?: string;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'stable';
  previousValue?: number;
  target?: number;
  status?: 'good' | 'warning' | 'critical' | 'on-track';
}

interface OperationalMetric {
  value: number;
  byType?: Record<string, number>;
}

interface MaturityMetric {
  value: number;
  daysThreshold: number;
  bonds: Array<{
    id: number;
    name: string;
    code: string;
    maturityDate: string;
    daysUntilMaturity: number;
    amount: number;
    amountPurchased: number;
  }>;
}
```

---

## Dashboard UI Requirements

### Layout

**Main Dashboard Page:**
1. **Header Section**
   - Page title: "Dashboard Overview"
   - Date range selector: Quick options (All Time, Last 7 days, Last 30 days, Last 90 days, This Year, Custom)
   - Export button (PDF/CSV)
   - Refresh button

2. **Financial Metrics Section** (Top row, 4 cards)
   - Total Bonds Value (large number with trend)
   - Total Amount Purchased (large number with trend)
   - Subscription Rate (circular progress indicator)
   - Average Daily Interest Rate (percentage with comparison)

3. **Transaction Metrics Section** (Second row, 4 cards)
   - Total Transactions
   - Transaction Success Rate (with status indicator)
   - Total Transaction Volume (with mini trend sparkline)
   - Average Transaction Value

4. **Charts Section** (Third row, 2 charts)
   - Transaction Volume Trend (Line chart, responsive to date range)
   - Bonds Subscription Comparison (Horizontal bar chart)

5. **Operational Health Section** (Fourth row, 3 cards)
   - Active Bonds Count (with breakdown pie chart)
   - Bonds Nearing Maturity (alert card with expandable list)
   - Average Bond Lifetime (gauge chart)

6. **Recent Activity Section** (Bottom)
   - Recent Transactions table (last 10, with "View All" link)
   - Quick action buttons (Create Bond, View Reports)

### Visual Design

**Metric Cards:**
- White background with subtle shadow
- Large primary value (36px font, bold)
- Label above value (14px, gray-600)
- Trend indicator with icon and % change
- Color coding: Green (positive), Red (negative), Blue (neutral)

**Status Indicators:**
- Transaction Success Rate:
  - ≥95%: Green badge "Excellent"
  - 90-94%: Yellow badge "Good"
  - <90%: Red badge "Needs Attention"

**Charts:**
- Line charts: Smooth curves, blue primary color
- Bar charts: Material color palette (blue, green, orange)
- Tooltips on hover with detailed values
- Responsive sizing based on container

**Alert Cards (Bonds Nearing Maturity):**
- Amber background (#FFF3E0)
- Warning icon
- Expandable list showing bond details
- "View Details" action button

### Responsive Behavior
- **Desktop (>1200px):** 4-column grid
- **Tablet (768-1200px):** 2-column grid
- **Mobile (<768px):** Single column stack

---

## Implementation Notes

### Backend Considerations

1. **Performance Optimization:**
   - Cache dashboard KPIs for 5 minutes
   - Use database materialized views for complex aggregations
   - Index frequently queried fields: `status`, `partnerId`, `dateCreated`, `bondId`
   - Use query result caching for trend data

2. **Data Consistency:**
   - Use database transactions for bond purchases
   - Update `amountPurchased` and `availableBalance` atomically
   - Validate available balance before completing transactions
   - Implement pessimistic locking for concurrent purchases

3. **Date Range Handling:**
   - If no dates provided, include ALL data (no default filtering)
   - Support ISO 8601 format with timezone
   - Validate startDate <= endDate
   - Convert dates to UTC for storage and comparison

4. **Calculations:**
   - Calculate `change` by comparing current period to previous period of same duration
   - For trend direction: >1% = "up", <-1% = "down", else "stable"
   - Round currency values to 0 decimal places
   - Round percentages to 1 decimal place

5. **Error Handling:**
   - Return standardized error format
   - Log all 500 errors with context
   - Provide meaningful validation messages
   - Never expose internal error details

6. **Security:**
   - Require JWT authentication on all endpoints
   - Implement role-based access (admin only for bond CRUD)
   - Validate and sanitize all input
   - Rate limit: 100 requests per minute per user

### Frontend Integration

1. **State Management (NgRx):**
   - Store dashboard KPIs in dedicated state slice
   - Auto-refresh every 5 minutes
   - Show loading skeletons during fetch
   - Cache for 5 minutes to reduce API calls

2. **Date Range Selector:**
   - Default: "All Time" (no date params sent to API)
   - Quick options: Last 7/30/90 days, This Year, Custom
   - Custom range: Material DatePicker with validation
   - Store selected range in component state

3. **Error Handling:**
   - Display toast notifications for errors
   - Retry failed requests (max 3 attempts)
   - Show offline indicator
   - Fallback to cached data if available

4. **Charts:**
   - Use Chart.js or ng2-charts
   - Responsive sizing
   - Animate on data update
   - Export chart as image option

---

## Success Metrics

### API Performance Targets
- Dashboard KPI endpoint: <500ms response time
- Bonds listing: <300ms response time
- Transaction listing: <400ms response time
- Uptime: 99.9%

### Data Accuracy
- KPI calculation accuracy: 100%
- Data consistency: Zero discrepancies
- Historical data retention: 2+ years

### User Experience
- Dashboard load time: <2 seconds
- Chart rendering: <500ms
- Metric card updates: <100ms

---

## Appendix

### Currency Format
- **Currency:** XAF (Central African CFA Franc)
- **Format:** "XAF 1,000,000" (no decimals)
- **Example:** 1500000 → "XAF 1,500,000"

### Date Format
- **Storage:** ISO 8601 with timezone (UTC)
- **API:** ISO 8601 strings
- **Display:** Localized format (e.g., "Oct 17, 2025")

### Status Enums

**Bond Status:**
- `active` - Available for purchase
- `inactive` - Not available (paused)
- `matured` - Reached maturity date

**Transaction Status:**
- `pending` - Awaiting processing
- `completed` - Successfully processed
- `failed` - Processing failed
- `cancelled` - Cancelled by user/admin

**Transaction Type:**
- `purchase` - Customer buying bond
- `withdrawal` - Customer withdrawing investment
- `interest_payout` - Interest payment to customer

---

**End of Specification**
