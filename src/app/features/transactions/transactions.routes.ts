import { Routes } from '@angular/router';

/**
 * Transactions feature routes
 */
export const transactionssRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    data: { breadcrumb: 'List', title: 'Transactions' },
    loadComponent: () =>
      import('./pages/transactions-list/transactions-list.component').then(
        (m) => m.TransactionsListComponent
      ),
    title: 'Transactions - Ejara Admin Panel',
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./pages/transactions-details/transactions-details.component').then(
        (m) => m.TransactionDetailsComponent
      ),
    title: 'Transaction Details - Ejara Admin Panel',
  },
  {
    path: 'reconciliation',
    loadComponent: () =>
      import('./pages/reconciliation/reconciliation.component').then(
        (m) => m.ReconciliationComponent
      ),
    title: 'Reconciliation - Ejara Admin Panel',
  },
];
