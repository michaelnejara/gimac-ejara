import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '@store/auth/auth.state';

/**
 * Authentication Guard
 * Protects routes that require authentication
 * 
 * @returns {boolean} True if authenticated, redirects to login if not
 * 
 * @example
 * // In route configuration
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      // Redirect to login
      router.navigate(['/auth/login']);
      return false;
    })
  );
};