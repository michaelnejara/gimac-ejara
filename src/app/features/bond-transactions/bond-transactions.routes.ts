import { Routes } from '@angular/router';

/**
 * Bonds feature routes
 */
export const bondTransactionsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
   {
    path: 'list',
    loadComponent: () => import('./pages/bond-transactions-list/bond-transactions-list').then(m => m.BondTransactionsList),
    title: 'Bond Transactions - Ejara Admin Panel'
  }
];