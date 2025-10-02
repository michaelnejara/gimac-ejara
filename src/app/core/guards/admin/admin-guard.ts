import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUser, selectIsAuthenticated } from '@store/auth/auth.state';

/**
 * Admin Guard
 * Protects routes that require admin access
 * 
 * @returns {boolean} True if user is admin, redirects to dashboard if not
 * 
 * @example
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, adminGuard]
 * }
 */
export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectUser).pipe(
    take(1),
    map(user => {
      if (user?.accountType === 'admin' && user?.canAccessPanel) {
        return true;
      }
      
      // Redirect to dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};