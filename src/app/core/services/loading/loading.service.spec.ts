import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { LoadingService } from './loading.service';
import { showLoading, hideLoading } from '../../../store/ui/loading.actions';
import { selectIsLoading } from '../../../store/ui/loading.selectors';

describe('LoadingService', () => {
  let service: LoadingService;
  let store: MockStore;
  const initialState = { ui: { loading: { isLoading: false } } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideMockStore({ initialState })
      ]
    });

    service = TestBed.inject(LoadingService);
    store = TestBed.inject(Store) as MockStore;

    // Spy on store dispatch
    spyOn(store, 'dispatch');
  });

  afterEach(() => {
    // Reset the service state after each test
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoading signal', () => {
    it('should initially be false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should return true when loading count is greater than 0', () => {
      service.show();
      expect(service.isLoading()).toBe(true);
    });

    it('should return false when loading count is 0', () => {
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('isLoading$ observable', () => {
    it('should be defined', () => {
      expect(service.isLoading$).toBeDefined();
    });

    it('should emit the loading state from the store', (done) => {
      store.overrideSelector(selectIsLoading, true);
      store.refreshState();

      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(true);
        done();
      });
    });
  });

  describe('show()', () => {
    it('should dispatch showLoading action', () => {
      service.show();
      expect(store.dispatch).toHaveBeenCalledWith(showLoading());
    });

    it('should increment loading count', () => {
      expect(service.getLoadingCount()).toBe(0);
      service.show();
      expect(service.getLoadingCount()).toBe(1);
    });

    it('should set isLoading to true', () => {
      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should dispatch hideLoading action', () => {
      service.show();
      service.hide();
      expect(store.dispatch).toHaveBeenCalledWith(hideLoading());
    });

    it('should decrement loading count', () => {
      service.show();
      service.show();
      expect(service.getLoadingCount()).toBe(2);

      service.hide();
      expect(service.getLoadingCount()).toBe(1);
    });

    it('should not go below 0', () => {
      service.hide();
      service.hide();
      expect(service.getLoadingCount()).toBe(0);
    });

    it('should set isLoading to false when count reaches 0', () => {
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple show() calls', () => {
      service.show();
      service.show();
      service.show();

      expect(service.getLoadingCount()).toBe(3);
      expect(service.isLoading()).toBe(true);
    });

    it('should remain loading until all operations complete', () => {
      service.show();
      service.show();
      service.show();

      service.hide();
      expect(service.isLoading()).toBe(true);
      expect(service.getLoadingCount()).toBe(2);

      service.hide();
      expect(service.isLoading()).toBe(true);
      expect(service.getLoadingCount()).toBe(1);

      service.hide();
      expect(service.isLoading()).toBe(false);
      expect(service.getLoadingCount()).toBe(0);
    });

    it('should dispatch correct number of actions', () => {
      service.show();
      service.show();
      service.hide();

      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getLoadingCount()', () => {
    it('should return current loading count', () => {
      expect(service.getLoadingCount()).toBe(0);

      service.show();
      expect(service.getLoadingCount()).toBe(1);

      service.show();
      expect(service.getLoadingCount()).toBe(2);

      service.hide();
      expect(service.getLoadingCount()).toBe(1);
    });
  });

  describe('reset()', () => {
    it('should reset loading count to 0', () => {
      service.show();
      service.show();
      service.show();

      service.reset();
      expect(service.getLoadingCount()).toBe(0);
    });

    it('should set isLoading to false', () => {
      service.show();
      service.show();

      service.reset();
      expect(service.isLoading()).toBe(false);
    });

    it('should dispatch hideLoading action', () => {
      service.show();
      service.reset();

      expect(store.dispatch).toHaveBeenCalledWith(hideLoading());
    });
  });

  describe('edge cases', () => {
    it('should handle hide() called before show()', () => {
      service.hide();
      expect(service.getLoadingCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle multiple hide() calls when count is 0', () => {
      service.hide();
      service.hide();
      service.hide();

      expect(service.getLoadingCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle alternating show/hide calls', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('integration with store', () => {
  it('should have isLoading$ observable defined', () => {
    expect(service.isLoading$).toBeDefined();
  });
  
  it('should emit store values through isLoading$', (done) => {
    store.overrideSelector(selectIsLoading, true);
    store.refreshState();
    
    service.isLoading$.subscribe(isLoading => {
      expect(isLoading).toBe(true);
      done();
    });
  });
  
  it('should dispatch show and hide actions to store', () => {
    service.show();
    expect(store.dispatch).toHaveBeenCalledWith(showLoading());
    
    service.hide();
    expect(store.dispatch).toHaveBeenCalledWith(hideLoading());
  });
});
});