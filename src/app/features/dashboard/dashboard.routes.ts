import { Routes } from '@angular/router';

/**
 * Dashboard feature routes
 */
export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - Ejara Admin Panel'
  }
];
