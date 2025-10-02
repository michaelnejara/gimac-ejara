import { Routes } from '@angular/router';

/**
 * Audit feature routes
 */
export const auditRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
    title: 'Audit Logs - Ejara Admin Panel'
  }
];