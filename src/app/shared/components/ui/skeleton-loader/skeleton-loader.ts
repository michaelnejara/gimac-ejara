import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Skeleton Loader Component
 * 
 * Reusable skeleton placeholder for loading states.
 * Provides visual feedback while content is being loaded.
 * 
 * Features:
 * - Multiple types (card, text, circle, rectangle)
 * - Customizable dimensions
 * - Smooth shimmer animation
 * - Responsive design
 * 
 * @example
 * ```html
 * <!-- Loading card -->
 * <app-skeleton-loader type="card" [repeat]="3"></app-skeleton-loader>
 * 
 * <!-- Loading text lines -->
 * <app-skeleton-loader type="text" [repeat]="5"></app-skeleton-loader>
 * ```
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss'
})
export class SkeletonLoader {
  /** Type of skeleton to display */
  @Input() type: 'dashboard-card' | 'card' | 'text' | 'circle' | 'rectangle' = 'card';

  /** Number of skeleton items to repeat */
  @Input() repeat: number = 1;

  /** Width of skeleton (for text and rectangle types) */
  @Input() width: string = '100%';

  /** Height of skeleton (for rectangle type) */
  @Input() height: string = '100px';

  /** Size of skeleton (for circle type) */
  @Input() size: number = 40;

  /**
   * Generate array for *ngFor repeat
   * @param count - Number of items
   * @returns Array of specified length
   */
  getArray(count: number): any[] {
    return Array(count).fill(0);
  }
}
