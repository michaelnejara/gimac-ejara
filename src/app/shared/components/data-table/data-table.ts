import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  TemplateRef,
  ContentChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import {
  TableConfig,
  TableColumn,
  TableAction,
  TablePageEvent,
  TableSortEvent,
  TableSelectionEvent
} from '@core/models/table-config.models';

/**
 * Directive for defining custom column templates
 */
import { Directive } from '@angular/core';

@Directive({
  selector: '[appTableColumn]',
  standalone: true
})
export class TableColumnDirective {
  @Input('appTableColumn') columnKey!: string;

  constructor(public template: TemplateRef<any>) { }
}

/**
 * Directive for defining custom actions template
 */
@Directive({
  selector: '[appTableActions]',
  standalone: true
})
export class TableActionsDirective {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Reusable Data Table Component
 * 
 * A flexible, feature-rich table component built on Angular Material.
 * 
 * Features:
 * - Configurable columns with multiple types
 * - Custom column templates
 * - Custom cell renderers
 * - Sorting
 * - Pagination
 * - Row actions (icon buttons or regular buttons)
 * - Custom actions template
 * - Row selection
 * - Loading states
 * - Empty states
 * - Custom formatters
 * - Badge rendering
 * - Sticky columns
 * 
 * @example
 * ```html
 * <app-data-table
 *   [data]="transactions"
 *   [config]="tableConfig"
 *   (pageChange)="onPageChange($event)"
 *   (sortChange)="onSortChange($event)">
 *   
 *   <!-- Custom column template -->
 *   <ng-template appTableColumn="fullName" let-row>
 *     <strong>{{ row.firstName }} {{ row.lastName }}</strong>
 *   </ng-template>
 *   
 *   <!-- Custom actions template -->
 *   <ng-template appTableActions let-row>
 *     <button mat-button (click)="onEdit(row)">Edit</button>
 *     <button mat-button (click)="onDelete(row)">Delete</button>
 *   </ng-template>
 * </app-data-table>
 * ```
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    TableColumnDirective,
    TableActionsDirective
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable<T = any> implements OnInit {
  /** Table data */
  @Input() data: T[] = [];

  /** Table configuration */
  @Input() config!: TableConfig<T>;

  /** Page change event */
  @Output() pageChange = new EventEmitter<TablePageEvent>();

  /** Sort change event */
  @Output() sortChange = new EventEmitter<TableSortEvent>();

  /** Selection change event */
  @Output() selectionChange = new EventEmitter<TableSelectionEvent<T>>();

  /** Row click event */
  @Output() rowClick = new EventEmitter<T>();

  /** Custom column templates */
  @ContentChildren(TableColumnDirective) columnTemplates!: QueryList<TableColumnDirective>;

  /** Custom actions template */
  @ContentChild(TableActionsDirective) actionsTemplate?: TableActionsDirective;

  /** Material table data source */
  dataSource = new MatTableDataSource<T>();

  /** Selection model for checkbox selection */
  selection = new SelectionModel<T>(true, []);

  /** Paginator reference */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Sort reference */
  @ViewChild(MatSort) sort!: MatSort;

  /** Displayed column keys */
  displayedColumns: string[] = [];

  /** Map of column keys to templates */
  private columnTemplateMap = new Map<string, TemplateRef<any>>();

  ngOnInit(): void {
    this.initializeTable();
  }

  ngAfterContentInit(): void {
    // Build template map from content children
    this.columnTemplates.forEach(directive => {
      this.columnTemplateMap.set(directive.columnKey, directive.template);
    });
  }

  ngOnChanges(): void {
    this.updateDataSource();
  }

  /**
   * Initialize table configuration
   */
  private initializeTable(): void {
    // Build displayed columns array
    this.displayedColumns = this.buildDisplayedColumns();

    // Update data source
    this.updateDataSource();
  }

  /**
   * Build array of displayed column keys
   * Includes selection column and actions column if configured
   */
  private buildDisplayedColumns(): string[] {
    const columns: string[] = [];

    // Add selection column
    if (this.config.selectable) {
      columns.push('select');
    }

    // Add data columns
    const dataColumns = this.config.columns
      .filter(col => !col.hidden)
      .map(col => col.key);
    columns.push(...dataColumns);

    // Add actions column
    if (this.config.showActions && (this.config.actions?.length || this.actionsTemplate)) {
      columns.push('actions');
    }

    return columns;
  }

  /**
   * Update data source with new data
   */
  private updateDataSource(): void {
    this.dataSource.data = this.data;
  }

  /**
   * Get column configuration by key
   */
  getColumn(key: string): TableColumn<T> | undefined {
    return this.config.columns.find(col => col.key === key);
  }

  /**
   * Get custom template for column
   */
  getColumnTemplate(columnKey: string): TemplateRef<any> | null {
    const column = this.getColumn(columnKey);

    // Check if column has templateRef
    if (column?.templateRef) {
      return column.templateRef;
    }

    // Check content children templates
    return this.columnTemplateMap.get(columnKey) || null;
  }

  /**
   * Check if column has custom template
   */
  hasCustomTemplate(columnKey: string): boolean {
    const column = this.getColumn(columnKey);
    return column?.type === 'template' || !!this.getColumnTemplate(columnKey);
  }

  /**
   * Get formatted cell value
   */
  getCellValue(row: T, column: TableColumn<T>): any {
    // Use cell renderer if provided
    if (column.cellRenderer) {
      return column.cellRenderer(row);
    }

    const value = (row as any)[column.key];

    // Use custom formatter if provided
    if (column.formatter) {
      return column.formatter(value, row);
    }

    // Apply type-based formatting
    switch (column.type) {
      case 'date':
        return this.formatDate(value);
      case 'currency':
        return this.formatCurrency(value);
      case 'number':
        return this.formatNumber(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value;
    }
  }

  /**
   * Format date value
   */
  private formatDate(value: any): string {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString();
  }

  /**
   * Format currency value
   */
  private formatCurrency(value: any): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  /**
   * Format number value
   */
  private formatNumber(value: any): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US').format(value);
  }

  /**
   * Get badge color for value
   */
  getBadgeColor(column: TableColumn<T>, value: any): string {
    if (!column.badgeConfig) return 'default';

    const { colorMap, defaultColor } = column.badgeConfig;

    if (colorMap && colorMap[value]) {
      return colorMap[value];
    }

    return defaultColor || 'default';
  }

  /**
   * Get badge display value
   */
  getBadgeValue(column: TableColumn<T>, value: any): string {
    if (!column.badgeConfig || !column.badgeConfig.transform) {
      return value;
    }

    return column.badgeConfig.transform(value);
  }

  /**
   * Get visible actions for row
   */
  getVisibleActions(row: T): TableAction<T>[] {
    if (!this.config.actions) return [];

    return this.config.actions.filter(action => {
      if (action.hidden) {
        return !action.hidden(row);
      }
      return true;
    });
  }

  /**
   * Check if action is disabled for row
   */
  isActionDisabled(action: TableAction<T>, row: T): boolean {
    if (action.disabled) {
      return action.disabled(row);
    }
    return false;
  }

  /**
   * Get column alignment class
   */
  getColumnAlignClass(column: TableColumn<T>): string {
    return `text-${column.align || 'left'}`;
  }

  /**
   * Get row CSS class
   */
  getRowClass(row: T): string {
    if (!this.config.rowCssClass) return '';

    if (typeof this.config.rowCssClass === 'function') {
      return this.config.rowCssClass(row);
    }

    return this.config.rowCssClass;
  }

  /**
   * Handle row click
   */
  onRowClick(row: T): void {
    if (this.config.rowClickHandler) {
      this.config.rowClickHandler(row);
    }
    this.rowClick.emit(row);
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      previousPageIndex: event.previousPageIndex
    });
  }

  /**
   * Handle sort change
   */
  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction
    });
  }

  /**
   * Handle action button click
   */
  onActionClick(action: TableAction<T>, row: T, event: Event): void {
    event.stopPropagation();
    action.handler(row);
  }

  /**
   * Whether all rows are selected
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Toggle all rows selection
   */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }

    this.emitSelectionChange();
  }

  /**
   * Toggle single row selection
   */
  toggleRow(row: T): void {
    this.selection.toggle(row);
    this.emitSelectionChange();
  }

  /**
   * Emit selection change event
   */
  private emitSelectionChange(): void {
    this.selectionChange.emit({
      selected: this.selection.selected
    });
  }

  /**
   * Check if row is selected
   */
  isRowSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  /**
   * Get checkbox label
   */
  checkboxLabel(row?: T): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /**
   * Get button type class
   */
  getActionButtonType(action: TableAction<T>): string {
    return action.type || 'icon';
  }

  /**
   * Get tooltip text for column header
   * Resolves tooltip if it's a function or returns the string directly
   * 
   * @param column - Table column configuration
   * @param row - Row data (optional, for cell tooltips)
   * @returns Tooltip string or empty string
   */
  getTooltip(column: TableColumn<T>, row?: T): string {
    if (!column.tooltip) {
      return '';
    }

    if (typeof column.tooltip === 'function') {
      if (row) {
        return column.tooltip(row);
      }
      return '';
    }

    return column.tooltip;
  }

  /**
   * Check if column has tooltip
   * 
   * @param column - Table column configuration
   * @returns true if column has tooltip defined
   */
  hasTooltip(column: TableColumn<T>): boolean {
    return !!column.tooltip;
  }

  /**
   * Get column header tooltip
   * Only returns tooltip if it's a static string
   * 
   * @param column - Table column configuration
   * @returns Tooltip string for header or empty string
   */
  getHeaderTooltip(column: TableColumn<T>): string {
    if (!column.tooltip) {
      return '';
    }

    // Only show tooltip on header if it's a static string
    if (typeof column.tooltip === 'string') {
      return column.tooltip;
    }

    return '';
  }

  /**
   * Get cell tooltip
   * Resolves tooltip function with row data
   * 
   * @param column - Table column configuration
   * @param row - Row data
   * @returns Tooltip string for cell
   */
  getCellTooltip(column: TableColumn<T>, row: T): string {
    return this.getTooltip(column, row);
  }
}
