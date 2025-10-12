import { Routes } from '@angular/router';

/**
 * Partners feature routes
 */
export const partnersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
   {
    path: 'list',
    loadComponent: () => import('./pages/partners-list/partners-list').then(m => m.PartnersList),
    title: 'Partners - Ejara Admin Panel'
  },
  {
    path: 'add-partner',
    loadComponent: () => import('./pages/add-partner/add-partner').then(m => m.AddPartner),
    title: 'New Partner - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/partner-details/partner-details').then(m => m.PartnerDetails),
    title: 'Partner Details - Ejara Admin Panel'
  }
];