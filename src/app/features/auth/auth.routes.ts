import { Routes } from '@angular/router';

/**
 * Authentication feature routes
 * Handles login, MFA, and password reset flows
 */
export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Ejara Admin Panel'
  },
  {
    path: 'mfa-verify',
    loadComponent: () => import('./pages/mfa-verify/mfa-verify.component').then(m => m.MfaVerifyComponent),
    title: 'MFA Verification - Ejara Admin Panel'
  },
  {
    path: 'mfa-setup',
    loadComponent: () => import('./pages/mfa-setup/mfa-setup.component').then(m => m.MfaSetupComponent),
    title: 'MFA Setup - Ejara Admin Panel'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password - Ejara Admin Panel'
  }
];