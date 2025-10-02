import { computed, Injectable, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { hideLoading, showLoading } from '../../../store/ui/loading.actions';
import { selectIsLoading } from '../../../store/ui/loading.selectors';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /**
   * Signal-based loading counter for tracking concurrent operations.
   * Increments on show(), decrements on hide().
   */
  private loadingCount = signal<number>(0);

  /**
   * Computed signal that returns true when any loading operation is active.
   * Use this in components with signal-based reactivity.
   */
  readonly isLoading = computed(() => this.loadingCount() > 0);

  /**
   * Observable stream of the loading state from NgRx store.
   * Emits true when loading is active, false otherwise.
   * Use this for traditional Observable-based patterns.
   */
  readonly isLoading$: Observable<boolean>;

  constructor(private store: Store) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  /**
   * Dispatches the `showLoading` action to the store.
   * Also increments the internal loading counter.
   * Marks the application as being in a loading state.
   */
  show(): void {
    this.loadingCount.update(count => count + 1);
    this.store.dispatch(showLoading());
  }

  /**
   * Dispatches the `hideLoading` action to the store.
   * Also decrements the internal loading counter.
   * Marks the application as no longer loading.
   */
  hide(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
    this.store.dispatch(hideLoading());
  }

  /**
   * Returns the current loading count.
   * Useful for debugging or checking how many concurrent operations are active.
   */
  getLoadingCount(): number {
    return this.loadingCount();
  }

  /**
   * Resets the loading counter to zero.
   * Use with caution - typically for cleanup or testing purposes.
   */
  reset(): void {
    this.loadingCount.set(0);
    this.store.dispatch(hideLoading());
  }
}