import { Routes } from '@angular/router';

/**
 * Customers feature routes
 */
export const partnersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
   {
    path: 'list',
    loadComponent: () => import('./pages/customers-list/customers-list').then(m => m.CustomersList),
    title: 'Customers - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/customer-details/customer-details').then(m => m.CustomerDetails),
    title: 'Customer Details - Ejara Admin Panel'
  }
];