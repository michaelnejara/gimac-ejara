import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        provideMockStore({
          initialState: {
            auth: {
              user: null,
              authToken: null,
              refreshToken: null,
              isAuthenticated: false,
              mfaRequired: false,
              loginReference: null,
              loading: false,
              error: null
            }
          }
        })
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have mapCustomerDataToUser method', () => {
    expect(service.mapCustomerDataToUser).toBeDefined();
  });
});
