import { Routes } from '@angular/router';

/**
 * Bonds feature routes
 */
export const bondsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
   {
    path: 'bond-management',
    loadComponent: () => import('./pages/bonds-list/bonds-list.component').then(m => m.BondsListComponent),
    title: 'Bonds - Ejara Admin Panel'
  },
   {
    path: 'bond-transactions',
    loadComponent: () => import('./pages/bond-transactions/bond-transactions').then(m => m.BondTransactionsComponent),
    title: 'Bonds - Transactions'
  },
  {
    path: 'partner-management',
    loadComponent: () => import('./pages/bonds-list/bonds-list.component').then(m => m.BondsListComponent),
    title: 'Bonds - Ejara Admin Panel'
  },
   {
    path: 'customer-management',
    loadComponent: () => import('./pages/customer-management/customer-management.component').then(m => m.CustomerManagementComponent),
    title: 'Bonds - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/bond-details/bond-details.component').then(m => m.BondDetailsComponent),
    title: 'Bond Details - Ejara Admin Panel'
  }
];