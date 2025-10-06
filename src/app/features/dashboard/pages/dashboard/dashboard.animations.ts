// src/app/pages/dashboard/dashboard.animations.ts
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

/**
 * Dashboard Animations
 * 
 * Provides smooth entrance animations for dashboard elements
 */
export const dashboardAnimations = {
  /**
   * Fade in animation
   * Elements fade in from transparent to opaque
   */
  fadeIn: trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('500ms ease-in', style({ opacity: 1 }))
    ])
  ]),

  /**
   * Slide in animation
   * Elements slide up while fading in
   */
  slideIn: trigger('slideIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),

  /**
   * Stagger animation for lists
   * Child elements animate one after another
   */
  listAnimation: trigger('listAnimation', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(50, [
          animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ])
};