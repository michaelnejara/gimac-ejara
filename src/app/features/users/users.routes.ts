import { Routes } from '@angular/router';

/**
 * Users feature routes
 */
export const usersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/users-list/users-list.component').then(m => m.UsersListComponent),
    title: 'Users - Ejara Admin Panel'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/user-details/user-details.component').then(m => m.UserDetailsComponent),
    title: 'User Details - Ejara Admin Panel'
  }
];