# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GIMAC Admin Panel** - An Angular 20 administrative dashboard for managing tokenized bonds, transactions, partners, customers, and financial operations. Built with NgRx for state management, Angular Material for UI components, and TailwindCSS for styling.

## Development Commands

### Start Development Server
```bash
ng serve
# or
npm start
# Runs on http://localhost:4200/
```

### Build
```bash
ng build                          # Development build
ng build --configuration production  # Production build
# Output: dist/ directory
```

### Testing
```bash
ng test                          # Run all tests with Karma
ng test --include='**/auth-guard.spec.ts'  # Run specific test file
```

### Code Generation
```bash
ng generate component component-name
ng generate service services/service-name
ng generate guard guards/guard-name
```

### Watch Mode
```bash
ng build --watch --configuration development
```

## Architecture Overview

### State Management (NgRx)

The application uses NgRx for centralized state management with a feature-based store architecture:

**Store Structure:**
- `src/app/store/` - All NgRx state management
  - Each feature has: `actions.ts`, `effects.ts`, `reducer.ts`, `state.ts`
  - Features: `auth`, `dashboard`, `transactions`, `transaction-detail`, `partners`, `bonds`, `customers`, `bondTransactions`, `ui`

**Key State Management Patterns:**
- **State Persistence:** Auth state is persisted to localStorage and restored on app startup (see `src/app/store/auth/auth.state.ts`)
- **Effects for Side Effects:** All API calls, routing, and async operations handled in effects
- **Selectors:** Memoized selectors for efficient state access (created with `createSelector`)
- **Actions:** Typed actions following `[Feature] Action Name` naming convention

**Example State Access:**
```typescript
// In component
private store = inject(Store);
user$ = this.store.select(selectUser);
```

### Routing & Guards

**Lazy Loading:** All feature modules are lazy loaded via route configuration in `src/app/app.routes.ts`

**Route Guards:**
- `authGuard` - Protects authenticated routes (checks for valid auth token)
- `guestGuard` - Redirects authenticated users away from auth pages
- `adminGuard` - Admin-only routes (requires admin role)

Guards are applied at route level and use NgRx store for authentication state.

### HTTP Interceptors

**Interceptor Chain** (applied in order in `app.config.ts`):
1. `GimacPaymentCredentialsInterceptor` - Adds API credentials for GIMAC TB B2B service
2. `authInterceptor` - Adds JWT token to requests, handles 401 errors, adds language headers
3. `errorInterceptor` - Global error handling and user notifications

**Skip Authentication:** Use special URL patterns in `authInterceptor` for public endpoints (login, password reset, etc.)

### Core Services Architecture

**Location:** `src/app/core/services/`

**Key Services:**
- `AuthService` - Authentication API calls
- `StorageService` - Type-safe localStorage wrapper
- `NotificationService` - Toast notifications (wraps ngx-toastr)
- `LoadingService` - Global loading state management
- `ErrorBoundaryService` - Global error handler (implements Angular ErrorHandler)
- `GeolocationService` - IP geolocation for login tracking

**API Services Pattern:**
- Feature services in `src/app/core/services/{feature}/`
- Each has a corresponding mock service (e.g., `bonds.service.ts` and `bonds-mock.service.ts`)
- Mock services can be toggled via `environment.features.enableMockData`

### Component Architecture

**Feature Modules:**
Located in `src/app/features/` with lazy-loaded routing:
- `auth` - Login, MFA, password reset
- `dashboard` - Overview metrics and charts
- `transactions` - Payment transactions listing and details
- `bond-transactions` - Bond-specific transactions
- `bonds` - Bond management (create, list, edit)
- `partners` - Partner organization management
- `customers` - Customer accounts management
- `users` - User administration
- `reports` - Financial reports and compliance
- `alerts` - Notifications and alerts
- `audit` - Audit logs (admin only)

**Shared Components:**
Located in `src/app/shared/components/`:
- `data-table` - **Reusable table component** with sorting, pagination, selection, and custom templates
- `layout` - Main app layout with sidebar and navbar
- `sidebar` - Navigation sidebar
- `navbar` - Top navigation bar
- `forms` - Reusable form components
- `ui` - UI primitives and modals

### Data Table Component

**Location:** `src/app/shared/components/data-table/`

The `data-table` component is a highly reusable Material table wrapper:

**Key Features:**
- Declarative configuration via `TableConfig<T>` interface
- Built-in sorting, pagination, and row selection
- Custom column templates via `TableColumnDirective`
- Custom actions templates via `TableActionsDirective`
- Column types: text, number, date, currency, badge, boolean, template
- Action buttons with conditional visibility/disabled states
- Loading states and empty state messages

**Usage Pattern:**
```typescript
// In component
tableConfig: TableConfig<MyData> = {
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'badge', badgeConfig: {...} }
  ],
  actions: [
    { key: 'edit', icon: 'edit', tooltip: 'Edit', handler: (row) => {...} }
  ],
  pagination: { pageIndex: 0, pageSize: 10, totalItems: 100 }
};
```

See `src/app/core/models/table-config.models.ts` for complete configuration interface.

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:
- `@*` → `src/app/*`
- `@environments/*` → `src/environments/*`

**Common aliases:**
- `@core/` - Core services, guards, interceptors, models, utils
- `@shared/` - Shared components and utilities
- `@store/` - NgRx store modules
- `@features/` - Feature modules

### Models and Types

**Location:** `src/app/core/models/`

Centralized TypeScript interfaces for:
- `auth.models.ts` - User, LoginPayload, MfaData, tokens
- `transaction.models.ts` - Payment transactions
- `bond.models.ts` - Bond securities
- `partner.models.ts` - Partner organizations
- `customer.models.ts` - Customer accounts
- `table-config.models.ts` - Data table configuration
- `error.models.ts` - Error responses
- `notification.models.ts` - Toast notification types

### Environment Configuration

**Files:**
- `src/environments/environment.ts` - Production config
- `src/environments/environment.development.ts` - Development config (if exists)

**Structure:**
```typescript
environment = {
  production: boolean,
  apiUrl: string,
  features: {
    enableMockData: boolean,
    enableDevTools: boolean
  },
  // External API configs
  nellysCoin: { apiUrl, clientKey, clientSecret },
  mfa: { apiUrl, clientKey, clientSecret },
  gimacTbB2B: { apiUrl, useMockData }
}
```

### Styling

- **Framework:** TailwindCSS 4.x (via PostCSS)
- **Component Styles:** SCSS with Angular Material theming
- **Global Styles:** `src/styles.scss`
- **Component Prefix:** `app-`

### Error Handling

**Global Error Handler:** `ErrorBoundaryService` catches all unhandled errors
- Logs to console in development
- Can be extended for remote logging
- Shows user-friendly notifications via `NotificationService`

**HTTP Errors:** Handled by `errorInterceptor`
- 401: Triggers logout and redirect to login
- 4xx/5xx: Shows toast notification with error message
- Network errors: Shows connection error message

## Key Development Patterns

### Authentication Flow

1. User submits credentials → `AuthActions.loginStart` dispatched
2. `AuthEffects.login$` fetches geolocation, generates device ID, calls API
3. If MFA required → `AuthActions.loginMfaRequired` (user stays on MFA page)
4. User completes MFA → `AuthActions.completeMfaLogin` dispatched
5. `AuthEffects.completeMfaLogin$` calls complete-login endpoint
6. On success → `AuthActions.loginSuccess` (stores token, user data, redirects)
7. Auth state persisted to localStorage automatically
8. On app reload, auth state restored from localStorage

### Adding a New Feature Module

1. Generate feature with routing:
   ```bash
   ng generate component features/my-feature/pages/my-feature-list
   ```
2. Create routes file: `src/app/features/my-feature/my-feature.routes.ts`
3. Add NgRx store (if needed):
   - Create `src/app/store/my-feature/` with actions, effects, reducer, state
   - Register in `app.config.ts`: `provideState()` and `provideEffects()`
4. Create service: `src/app/core/services/my-feature/my-feature.service.ts`
5. Add route to `app.routes.ts` with lazy loading and guards

### Working with the Data Table

1. Define your data interface
2. Create `TableConfig<YourDataType>` in component
3. Use `<app-data-table>` with inputs: `[config]`, `[data]`
4. Handle outputs: `(pageChange)`, `(sortChange)`, `(selectionChange)`
5. For custom columns: Use `<ng-template tableColumn="columnKey">` with context
6. For custom actions: Use `<ng-template tableActions>` with `let-row`

### API Integration

**Service Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private apiUrl = inject(Environment).gimacTbB2B.apiUrl;
  private http = inject(HttpClient);

  getData(): Observable<Response> {
    return this.http.get<Response>(`${this.apiUrl}/endpoint`);
  }
}
```

**Effect Pattern:**
```typescript
loadData$ = createEffect(() =>
  this.actions$.pipe(
    ofType(MyActions.loadData),
    switchMap(() =>
      this.myService.getData().pipe(
        map(data => MyActions.loadDataSuccess({ data })),
        catchError(error => of(MyActions.loadDataFailure({ error })))
      )
    )
  )
);
```

## Important Notes

### NgRx DevTools
- Available in development when `environment.features.enableDevTools: true`
- Access via Redux DevTools browser extension
- Limited to log-only in production

### Mock Data
- Toggle via `environment.features.enableMockData`
- Mock services located alongside real services with `-mock` suffix
- Useful for development without backend

### Component Styles
- Use component-level SCSS files (`.scss` suffix)
- Encapsulation: Default (Emulated)
- Budget limits: 4kB warning, 8kB error per component style

### TypeScript Strict Mode
- Strict type checking enabled
- No implicit any, returns, or overrides
- Follow existing patterns for type safety
