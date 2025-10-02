import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { LoginComponent } from './login.component';
import { AuthActions } from '@store/auth/auth.actions';
import { selectLoading, selectError } from '@store/auth/auth.state';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;
  let router: jasmine.SpyObj<Router>;

  const initialState = {
    auth: {
      user: null,
      authToken: null,
      refreshToken: null,
      isAuthenticated: false,
      mfaRequired: false,
      mfaData: [],
      loginReference: null,
      shouldVerifyPhoneNumber: false,
      canAccessPanel: false,
      loading: false,
      error: null,
      deviceId: null,
      lastActivity: null
    }
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as MockStore;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize login form with empty values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('usernameOrPhoneNumber')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have invalid form when empty', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should initialize hidePassword as true', () => {
      expect(component.hidePassword).toBeTrue();
    });

    it('should initialize submitted as false', () => {
      expect(component.submitted).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should require username field', () => {
      const control = component.loginForm.get('usernameOrPhoneNumber');
      expect(control?.hasError('required')).toBeTrue();
    });

    it('should require password field', () => {
      const control = component.loginForm.get('password');
      expect(control?.hasError('required')).toBeTrue();
    });

    it('should validate password minimum length of 6', () => {
      const control = component.loginForm.get('password');
      
      control?.setValue('12345');
      expect(control?.hasError('minlength')).toBeTrue();
      
      control?.setValue('123456');
      expect(control?.hasError('minlength')).toBeFalsy();
    });

    it('should be valid when all fields are filled correctly', () => {
      component.loginForm.patchValue({
        usernameOrPhoneNumber: 'recitMichael',
        password: '123456789'
      });
      
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('Login Option Detection', () => {
    it('should detect email format', () => {
      expect(component.getLoginOption('user@example.com')).toBe('email');
    });

    it('should detect phone format', () => {
      expect(component.getLoginOption('+237652522021')).toBe('phone');
    });

    it('should default to username format', () => {
      expect(component.getLoginOption('recitMichael')).toBe('username');
    });
  });

  describe('Form Submission', () => {
    it('should not dispatch action when form is invalid', () => {
      component.onLogin();
      
      expect(component.submitted).toBeTrue();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      spyOn(component.loginForm, 'markAllAsTouched');
      
      component.onLogin();
      
      expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should dispatch loginStart action when form is valid', () => {
      component.loginForm.patchValue({
        usernameOrPhoneNumber: 'recitMichael',
        password: '123456789'
      });

      component.onLogin();

      expect(store.dispatch).toHaveBeenCalledWith(
        AuthActions.loginStart({
          usernameOrPhoneNumber: 'recitMichael',
          password: '123456789',
          loginOption: 'username'
        })
      );
    });

    it('should set submitted flag to true', () => {
      component.loginForm.patchValue({
        usernameOrPhoneNumber: 'recitMichael',
        password: '123456789'
      });

      component.onLogin();

      expect(component.submitted).toBeTrue();
    });

    it('should detect correct login option for email', () => {
      component.loginForm.patchValue({
        usernameOrPhoneNumber: 'user@example.com',
        password: '123456789'
      });

      component.onLogin();

      expect(store.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          loginOption: 'email'
        })
      );
    });

    it('should detect correct login option for phone', () => {
      component.loginForm.patchValue({
        usernameOrPhoneNumber: '+237652522021',
        password: '123456789'
      });

      component.onLogin();

      expect(store.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          loginOption: 'phone'
        })
      );
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle hidePassword from true to false', () => {
      expect(component.hidePassword).toBeTrue();
      
      component.togglePasswordVisibility();
      
      expect(component.hidePassword).toBeFalse();
    });

    it('should toggle hidePassword from false to true', () => {
      component.hidePassword = false;
      
      component.togglePasswordVisibility();
      
      expect(component.hidePassword).toBeTrue();
    });
  });

  describe('Navigation', () => {
    it('should navigate to forgot password page', () => {
      component.onForgotPassword();
      
      expect(router.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
    });
  });

  describe('Error Handling', () => {
    it('should return true when field has error and is touched', () => {
      const field = component.loginForm.get('usernameOrPhoneNumber');
      field?.markAsTouched();
      
      expect(component.hasError('usernameOrPhoneNumber', 'required')).toBeTrue();
    });

    it('should return true when field has error and submitted', () => {
      component.submitted = true;
      
      expect(component.hasError('usernameOrPhoneNumber', 'required')).toBeTrue();
    });

    it('should return false when field is valid', () => {
      component.loginForm.patchValue({ usernameOrPhoneNumber: 'recitMichael' });
      
      expect(component.hasError('usernameOrPhoneNumber', 'required')).toBeFalse();
    });

    it('should return correct error message for required username', () => {
      const message = component.getErrorMessage('usernameOrPhoneNumber');
      
      expect(message).toBe('Username is required');
    });

    it('should return correct error message for required password', () => {
      const message = component.getErrorMessage('password');
      
      expect(message).toBe('Password is required');
    });

    it('should return correct error message for short password', () => {
      const control = component.loginForm.get('password');
      control?.setValue('123');
      control?.markAsTouched();
      
      const message = component.getErrorMessage('password');
      
      expect(message).toBe('Password must be at least 6 characters');
    });
  });

  describe('Store Integration', () => {
    it('should subscribe to loading state', (done) => {
      store.overrideSelector(selectLoading, true);
      store.refreshState();

      component.loading$.subscribe(loading => {
        expect(loading).toBeTrue();
        done();
      });
    });

    it('should subscribe to error state', (done) => {
      const mockError = {
        errorCode: 'test_error',
        message: 'Test error message'
      };
      
      store.overrideSelector(selectError, mockError);
      store.refreshState();

      component.error$.subscribe(error => {
        expect(error).toEqual(mockError);
        done();
      });
    });

    it('should dispatch clearError when form changes after submission', fakeAsync(() => {
      component.submitted = true;
      
      component.loginForm.patchValue({ usernameOrPhoneNumber: 'newValue' });
      tick();

      expect(store.dispatch).toHaveBeenCalledWith(AuthActions.clearError());
      flush();
    }));

    it('should not dispatch clearError when form changes before submission', fakeAsync(() => {
      component.submitted = false;
      
      component.loginForm.patchValue({ usernameOrPhoneNumber: 'newValue' });
      tick();

      expect(store.dispatch).not.toHaveBeenCalledWith(AuthActions.clearError());
      flush();
    }));
  });

  describe('Component Cleanup', () => {
    it('should clear password on destroy', () => {
      component.loginForm.patchValue({ password: '123456789' });
      
      component.ngOnDestroy();
      
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should complete destroy$ subject', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Form Value Changes', () => {
    it('should clear error when typing after failed submission', fakeAsync(() => {
      component.submitted = true;
      
      component.loginForm.get('usernameOrPhoneNumber')?.setValue('test');
      tick(100);

      expect(store.dispatch).toHaveBeenCalledWith(AuthActions.clearError());
      flush();
    }));
  });
});