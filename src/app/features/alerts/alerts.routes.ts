import { Routes } from '@angular/router';

/**
 * Alerts feature routes
 */
export const alertsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/alerts-list/alerts-list.component').then(m => m.AlertsListComponent),
    title: 'Alerts - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/alert-details/alert-details.component').then(m => m.AlertDetailsComponent),
    title: 'Alert Details - Ejara Admin Panel'
  }
];
