import { Routes } from '@angular/router';

/**
 * Payments feature routes
 */
export const paymentsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/payments-list/payments-list.component').then(m => m.PaymentsListComponent),
    title: 'Payments - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/payment-details/payment-details.component').then(m => m.PaymentDetailsComponent),
    title: 'Payment Details - Ejara Admin Panel'
  },
  {
    path: 'reconciliation',
    loadComponent: () => import('./pages/reconciliation/reconciliation.component').then(m => m.ReconciliationComponent),
    title: 'Reconciliation - Ejara Admin Panel'
  }
];