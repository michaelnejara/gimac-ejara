// src/app/shared/components/forms/color-picker/color-picker.ts
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

/**
 * Custom Color Picker Component
 *
 * A lightweight color picker without Material UI
 * Implements ControlValueAccessor for Reactive Forms integration
 *
 * Features:
 * - Hex color input
 * - Predefined color palette
 * - Color preview
 * - Recent colors tracking
 * - Accessible keyboard navigation
 *
 * Usage:
 * <app-color-picker
 *   formControlName="colorCode"
 *   [label]="'Bond Color'"
 *   [placeholder]="'#000000'"
 *   [disabled]="false">
 * </app-color-picker>
 */
@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPicker),
      multi: true
    }
  ]
})
export class ColorPicker implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '#000000';
  @Input() disabled = false;
  @Input() required = false;
  @Input() helpText = '';
  @Input() showPalette = true;

  // Picker state
  showPicker = false;
  selectedColor = '#000000';
  inputValue = '#000000';

  // Disabled state
  isDisabled = false;

  // Touch/change callbacks
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  // Predefined color palette
  colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
    '#000000', '#ffffff', '#dc2626', '#ea580c', '#d97706', '#ca8a04',
    '#65a30d', '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7',
    '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777',
    '#e11d48', '#475569', '#1f2937', '#f3f4f6'
  ];

  // Recent colors (loaded from localStorage)
  recentColors: string[] = [];

  constructor() {
    this.loadRecentColors();
  }

  /**
   * Write value from form control
   */
  writeValue(value: string | null): void {
    if (value) {
      this.selectedColor = value;
      this.inputValue = value;
    } else {
      this.selectedColor = '#000000';
      this.inputValue = '#000000';
    }
  }

  /**
   * Register change callback
   */
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Register touched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * Toggle picker visibility
   */
  togglePicker(): void {
    if (!this.isDisabled) {
      this.showPicker = !this.showPicker;
    }
  }

  /**
   * Close picker
   */
  closePicker(): void {
    this.showPicker = false;
    this.onTouched();
  }

  /**
   * Handle input change
   */
  onInputChange(value: string): void {
    this.inputValue = value;

    // Validate hex color format
    if (this.isValidHexColor(value)) {
      this.selectedColor = value;
      this.onChange(value);
      this.addToRecentColors(value);
    } else {
      this.onChange(null);
    }
  }

  /**
   * Select color from palette
   */
  selectColor(color: string): void {
    this.selectedColor = color;
    this.inputValue = color;
    this.onChange(color);
    this.addToRecentColors(color);
    this.closePicker();
  }

  /**
   * Validate hex color format
   */
  private isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Add color to recent colors
   */
  private addToRecentColors(color: string): void {
    // Remove if already exists
    this.recentColors = this.recentColors.filter(c => c !== color);

    // Add to beginning
    this.recentColors.unshift(color);

    // Keep only last 10
    this.recentColors = this.recentColors.slice(0, 10);

    // Save to localStorage
    this.saveRecentColors();
  }

  /**
   * Load recent colors from localStorage
   */
  private loadRecentColors(): void {
    try {
      const stored = localStorage.getItem('recentColors');
      if (stored) {
        this.recentColors = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load recent colors:', error);
    }
  }

  /**
   * Save recent colors to localStorage
   */
  private saveRecentColors(): void {
    try {
      localStorage.setItem('recentColors', JSON.stringify(this.recentColors));
    } catch (error) {
      console.error('Failed to save recent colors:', error);
    }
  }

  /**
   * Get contrasting text color for background
   */
  getContrastColor(backgroundColor: string): string {
    // Remove # if present
    const hex = backgroundColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? '#000000' : '#ffffff';
  }
}
