import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '@store/auth/auth.state';

/**
 * Guest Guard
 * Protects routes that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 * 
 * @returns {boolean} True if not authenticated, redirects to dashboard if authenticated
 * 
 * @example
 * {
 *   path: 'auth/login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 */
export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }
      
      // Already logged in, redirect to dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};