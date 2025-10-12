import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth-interceptor';
import { errorInterceptor } from '@core/interceptors/error/error-interceptor';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from '@store/auth/auth.effects';
import { environment } from '@environments/environment';
import { ErrorBoundaryService } from '@core/services/error-boundary.service';
import { GimacPaymentCredentialsInterceptor } from '@core/interceptors/gimac-payment-credentials.interceptor';
import { DashboardEffects } from '@store/dashboard/dashboard.effects';
import { dashboardReducer } from '@store/dashboard/dashboard.reducer';
import { authReducer } from '@store/auth/auth.reducer';
import { TransactionsEffects } from '@store/transactions/transactions.effects';
import { transactionsReducer } from '@store/transactions/transactions.reducer';
import { transactionDetailReducer } from '@store/transactions/transaction-detail/transaction-detail.reducer';
import { TransactionDetailEffects } from '@store/transactions/transaction-detail/transaction-detail.effects';
import { PartnersEffects } from '@store/partners/partners.effects';
import { partnersReducer } from '@store/partners/partners.reducer';
import { bondsReducer } from '@store/bonds/bonds.reducer';
import { BondsEffects } from '@store/bonds/bonds.effects';
import { CustomersEffects } from '@store/customers/customers.effects';
import { BondTransactionsEffects } from '@store/bond-transactions/bond-transaction.effects';
import { customersReducer } from '@store/customers/customers.reducer';
import { bondTransactionsReducer } from '@store/bond-transactions/bond-transactions.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    // Global error listeners for unhandled errors
    provideBrowserGlobalErrorListeners(),

    // Zone.js configuration with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // HTTP client with interceptors chain
    provideHttpClient(
      withInterceptors([
        GimacPaymentCredentialsInterceptor,
        authInterceptor,
        errorInterceptor
      ])
    ),

    // Global error handler for uncaught exceptions
    { provide: ErrorHandler, useClass: ErrorBoundaryService },
    provideStore(
      {
        auth: authReducer,
        dashboard: dashboardReducer,
        transactions: transactionsReducer,
        transactionDetail: transactionDetailReducer,
        partners: partnersReducer,
        bonds: bondsReducer,
        customers: customersReducer,
        bondTransactions: bondTransactionsReducer
      }
    ),
    // provideState(authFeature),
    provideEffects([
      AuthEffects,
      DashboardEffects,
      TransactionsEffects,
      TransactionDetailEffects,
      PartnersEffects,
      BondsEffects,
      CustomersEffects,
      BondTransactionsEffects
    ]),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production,
      connectInZone: true // Restrict extension to log-only mode
    }),
    provideAnimationsAsync(),
    // provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
  ]
};
