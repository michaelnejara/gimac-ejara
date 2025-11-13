// src/app/shared/components/forms/date-picker/date-picker.ts
import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

/**
 * Custom Date Picker Component
 *
 * A lightweight date picker without Material UI
 * Implements ControlValueAccessor for Reactive Forms integration
 *
 * Features:
 * - Calendar popup for date selection
 * - Manual text input support
 * - Month/year navigation
 * - Disabled dates support
 * - Min/max date validation
 * - Accessible keyboard navigation
 *
 * Usage:
 * <app-date-picker
 *   formControlName="issueDate"
 *   [label]="'Issue Date'"
 *   [placeholder]="'Select date'"
 *   [minDate]="minDate"
 *   [maxDate]="maxDate"
 *   [disabled]="false">
 * </app-date-picker>
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true
    }
  ]
})
export class DatePicker implements ControlValueAccessor, OnInit {
  @Input() label = '';
  @Input() placeholder = 'Select a date';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabled = false;
  @Input() required = false;
  @Input() helpText = '';

  // Calendar state
  showCalendar = false;
  currentMonth!: Date;
  weeks: Date[][] = [];

  // Input value
  inputValue = '';
  selectedDate: Date | null = null;

  // Disabled state
  isDisabled = false;

  // Touch/change callbacks
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.currentMonth = new Date();
    this.currentMonth.setDate(1);
    this.generateCalendar();
  }

  /**
   * Write value from form control
   */
  writeValue(value: string | null): void {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.inputValue = this.formatDate(date);
        this.currentMonth = new Date(date);
        this.currentMonth.setDate(1);
        this.generateCalendar();
      }
    } else {
      this.selectedDate = null;
      this.inputValue = '';
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
   * Toggle calendar visibility
   */
  toggleCalendar(): void {
    if (!this.isDisabled) {
      this.showCalendar = !this.showCalendar;
      if (this.showCalendar) {
        this.generateCalendar();
      }
    }
  }

  /**
   * Close calendar
   */
  closeCalendar(): void {
    this.showCalendar = false;
    this.onTouched();
  }

  /**
   * Handle input change
   */
  onInputChange(value: string): void {
    this.inputValue = value;
    const date = this.parseDate(value);

    if (date && !isNaN(date.getTime())) {
      this.selectedDate = date;
      this.onChange(date.toISOString());
    } else {
      this.onChange(null);
    }
  }

  /**
   * Select a date from calendar
   */
  selectDate(date: Date): void {
    if (!this.isDateDisabled(date)) {
      this.selectedDate = date;
      this.inputValue = this.formatDate(date);
      this.onChange(date.toISOString());
      this.closeCalendar();
    }
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  /**
   * Generate calendar weeks
   */
  private generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Calculate calendar start (including previous month days)
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(calendarStart.getDate() - startingDayOfWeek);

    // Generate 6 weeks
    this.weeks = [];
    let currentDate = new Date(calendarStart);

    for (let week = 0; week < 6; week++) {
      const weekDays: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.weeks.push(weekDays);
    }
  }

  /**
   * Check if date is in current month
   */
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  /**
   * Check if date is selected
   */
  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return this.isSameDay(date, this.selectedDate);
  }

  /**
   * Check if date is today
   */
  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Check if date is disabled
   */
  isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  /**
   * Format date for display (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse date from string input
   */
  private parseDate(value: string): Date | null {
    if (!value) return null;

    // Try parsing as ISO string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try parsing as YYYY-MM-DD
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  }

  /**
   * Get month name
   */
  getMonthName(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.currentMonth.getMonth()];
  }

  /**
   * Get year
   */
  getYear(): number {
    return this.currentMonth.getFullYear();
  }

  /**
   * Get day names
   */
  getDayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }
}
