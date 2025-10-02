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
    path: 'list',
    loadComponent: () => import('./pages/bonds-list/bonds-list.component').then(m => m.BondsListComponent),
    title: 'Bonds - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/bond-details/bond-details.component').then(m => m.BondDetailsComponent),
    title: 'Bond Details - Ejara Admin Panel'
  }
];