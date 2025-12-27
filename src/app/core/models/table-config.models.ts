import { TemplateRef } from '@angular/core';

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Column type for special rendering
 */
export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'badge'
  | 'boolean'
  | 'color'  // Hex color code rendering with preview
  | 'template'; // New: custom template type

/**
 * Badge configuration for badge column type
 */
export interface BadgeConfig {
  /** Map of values to badge colors */
  colorMap?: Record<string, string>;
  /** Default color if value not in map */
  defaultColor?: string;
  /** Function to transform value before display */
  transform?: (value: any) => string;
}

/**
 * Table column configuration
 * Defines how each column should be displayed and behave
 */
export interface TableColumn<T = any> {
  /** Unique identifier for the column */
  key: string;
  
  /** Display label for column header */
  label: string;
  
  /** Column type for special rendering */
  type?: ColumnType;
  
  /** Whether column is sortable */
  sortable?: boolean;
  
  /** Text alignment */
  align?: ColumnAlign;
  
  /** Column width (CSS value) */
  width?: string;
  
  /** Whether column is sticky */
  sticky?: boolean;
  
  /** Sticky position (left or right) */
  stickyPosition?: 'left' | 'right';
  
  /** Custom formatter function */
  formatter?: (value: any, row: T) => string;
  
  /** Badge configuration (for badge type) */
  badgeConfig?: BadgeConfig;
  
  /** Whether column is hidden */
  hidden?: boolean;
  
  /** Custom CSS classes for column */
  cssClass?: string;
  
  /** Tooltip text */
  tooltip?: string | ((row: T) => string);
  
  /** Template reference for custom column rendering */
  templateRef?: TemplateRef<any>;
  
  /** 
   * Cell renderer function (alternative to template)
   * Returns the display value from the row data
   * Useful for combining multiple fields
   */
  cellRenderer?: (row: T) => any;
}

/**
 * Table action button configuration
 */
export interface TableAction<T = any> {
  /** Unique identifier */
  key: string;
  
  /** Icon name (Material icon) */
  icon: string;
  
  /** Label text (optional, for buttons with text) */
  label?: string;
  
  /** Tooltip text */
  tooltip: string;
  
  /** Action handler */
  handler: (row: T) => void;
  
  /** Button color */
  color?: 'primary' | 'accent' | 'warn';
  
  /** Button type */
  type?: 'icon' | 'button' | 'flat';
  
  /** Whether action is disabled */
  disabled?: (row: T) => boolean;
  
  /** Whether action is hidden */
  hidden?: (row: T) => boolean;
  
  /** Custom CSS classes */
  cssClass?: string;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page number (0-indexed) */
  pageIndex: number;
  
  /** Number of items per page */
  pageSize: number;
  
  /** Total number of items */
  totalItems: number;
  
  /** Available page size options */
  pageSizeOptions?: number[];
}

/**
 * Table configuration
 */
export interface TableConfig<T = any> {
  /** Column definitions */
  columns: TableColumn<T>[];

  /** Actions column width */
  actionsWidth?: string;
  
  /** Action buttons */
  actions?: TableAction<T>[];
  
  /** Whether to show actions column */
  showActions?: boolean;
  
  /** Actions column label */
  actionsLabel?: string;
  
  /** Pagination configuration */
  pagination?: PaginationConfig;
  
  /** Whether table data is loading */
  loading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Whether rows are selectable */
  selectable?: boolean;
  
  /** Whether to highlight rows on hover */
  highlightOnHover?: boolean;
  
  /** Custom row CSS class */
  rowCssClass?: string | ((row: T) => string);
  
  /** Click handler for entire row */
  rowClickHandler?: (row: T) => void;
  
  /** Custom actions template */
  actionsTemplate?: TemplateRef<any>;
}

/**
 * Table events
 */
export interface TablePageEvent {
  pageIndex: number;
  pageSize: number;
  previousPageIndex?: number;
}

export interface TableSortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export interface TableSelectionEvent<T> {
  selected: T[];
}