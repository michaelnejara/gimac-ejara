import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth-interceptor';
import { errorInterceptor } from '@core/interceptors/error/error-interceptor';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from '@store/auth/auth.effects';
import { authFeature } from '@store/auth/auth.state';
import { environment } from '@environments/environment';
import { ErrorBoundaryService } from '@core/services/error-boundary.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    // Global error handler
    { provide: ErrorHandler, useClass: ErrorBoundaryService },
    provideStore(),
    provideState(authFeature),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production,
      connectInZone: true // Restrict extension to log-only mode
    }),
    provideAnimationsAsync(),
    // provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
  ]
};
