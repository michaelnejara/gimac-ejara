import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin/admin-guard';
import { authGuard } from '@core/guards/auth/auth-guard';
import { guestGuard } from '@core/guards/guest/guest-guard';
import { Layout } from '@shared/components/layout/layout';

/**
 * Main application routes
 * Implements lazy loading for all feature modules
 */
export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Authentication routes (public)
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Dashboard (protected)
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },

      // Payments & Reconciliation (protected)
      {
        path: 'transactions',
        data: { breadcrumb: 'Transactions' },
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then((m) => m.transactionssRoutes),
      },

      // Bond Transactions (protected)
      {
        path: 'bond-transactions',
        data: { breadcrumb: 'Bond Transactions' },
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/bond-transactions/bond-transactions.routes').then((m) => m.bondTransactionsRoutes),
      },

      // Partners Management (protected)
      {
        path: 'partners',
        data: { breadcrumb: 'Partner' },
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/partners/partners.routes').then((m) => m.partnersRoutes),
      },

      // Bond Management (protected)
      {
        path: 'bonds',
        data: { breadcrumb: 'Bonds' },
        canActivate: [authGuard],
        loadChildren: () => import('./features/bonds/bonds.routes').then((m) => m.bondsRoutes),
      },

      // User Management (protected)
      {
        path: 'users',
        canActivate: [authGuard],
        loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
      },

      // Reports & Compliance (protected)
      {
        path: 'reports',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.reportsRoutes),
      },

      // Alerts & Notifications (protected)
      {
        path: 'alerts',
        canActivate: [authGuard],
        loadChildren: () => import('./features/alerts/alerts.routes').then((m) => m.alertsRoutes),
      },

      // Audit Logs (protected, admin only)
      {
        path: 'audit',
        canActivate: [authGuard, adminGuard],
        loadChildren: () => import('./features/audit/audit.routes').then((m) => m.auditRoutes),
      },
    ],
  },

  // 404 Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
