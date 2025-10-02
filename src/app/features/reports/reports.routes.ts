import { Routes } from '@angular/router';

/**
 * Reports feature routes
 */
export const reportsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/reports-list/reports-list.component').then(m => m.ReportsListComponent),
    title: 'Reports - Ejara Admin Panel'
  },
  {
    path: 'viewer/:id',
    loadComponent: () => import('./pages/report-viewer/report-viewer.component').then(m => m.ReportViewerComponent),
    title: 'Report Viewer - Ejara Admin Panel'
  }
];