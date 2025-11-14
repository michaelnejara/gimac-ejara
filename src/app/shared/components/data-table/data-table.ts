import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ViewChild,
  OnInit,
  OnChanges,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef, // ADD THIS
  ContentChildren,
  QueryList,
  TemplateRef,
  ContentChild,
  ViewEncapsulation
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

// Models
import { 
  TableConfig, 
  TableColumn, 
  TableAction,
  TablePageEvent,
  TableSortEvent,
  TableSelectionEvent
} from '@core/models/table-config.models';

// Directives (for ContentChildren queries only)
import { TableColumnDirective, TableActionsDirective } from './data-table-directives';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DataTable<T = any> implements OnInit, OnChanges, AfterContentInit {
  
  // ==================
  // INPUTS & OUTPUTS
  // ==================
  
  @Input() data: T[] = [];
  @Input() config!: TableConfig<T>;
  
  @Output() pageChange = new EventEmitter<TablePageEvent>();
  @Output() sortChange = new EventEmitter<TableSortEvent>();
  @Output() selectionChange = new EventEmitter<TableSelectionEvent<T>>();
  @Output() rowClick = new EventEmitter<T>();

  // ==================
  // CONTENT CHILDREN
  // ==================
  
  @ContentChildren(TableColumnDirective) columnTemplates!: QueryList<TableColumnDirective>;
  @ContentChild(TableActionsDirective) actionsTemplate?: TableActionsDirective;

  // ==================
  // VIEW CHILDREN
  // ==================
  
  dataSource = new MatTableDataSource<T>();
  selection = new SelectionModel<T>(true, []);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // ==================
  // COMPONENT STATE
  // ==================
  
  displayedColumns: string[] = [];
  private columnTemplateMap = new Map<string, TemplateRef<any>>();

  // ADD THIS: constructor to inject ChangeDetectorRef
  constructor(private cdr: ChangeDetectorRef) {}

  // ==================
  // LIFECYCLE HOOKS
  // ==================

  ngOnInit(): void {
    this.initializeTable();
  }

  ngAfterContentInit(): void {
    // Build template map from content children
    this.columnTemplates.forEach(directive => {
      this.columnTemplateMap.set(directive.columnKey, directive.template);
    });

    // CRITICAL FIX: Rebuild displayed columns now that we have access to actionsTemplate
    this.displayedColumns = this.buildDisplayedColumns();
    
    // Trigger change detection to update the view
    this.cdr.detectChanges();
  }

  ngOnChanges(): void {
    this.updateDataSource();
    
    // Also rebuild columns on config changes (after content init)
    if (this.columnTemplates && this.columnTemplates.length > 0) {
      this.displayedColumns = this.buildDisplayedColumns();
    }
  }

  // ==================
  // PRIVATE METHODS
  // ==================

  private initializeTable(): void {
    // Initial build - will be rebuilt in ngAfterContentInit
    this.displayedColumns = this.buildDisplayedColumns();
    this.updateDataSource();
  }

  private buildDisplayedColumns(): string[] {
    if (!this.config) return [];

    const columns: string[] = [];
    
    // Add selection column
    if (this.config.selectable) {
      columns.push('select');
    }
    
    // Add data columns
    const dataColumns = this.config.columns
      .filter((col) => !col.hidden)
      .map((col) => col.key);
    columns.push(...dataColumns);
    
    // Add actions column
    // Check if showActions is true AND either:
    // 1. There are config actions, OR
    // 2. There is an actions template from parent
    if (this.config.showActions) {
      const hasConfigActions = this.config.actions && this.config.actions.length > 0;
      const hasActionsTemplate = !!this.actionsTemplate;
      
      console.log('Building columns - showActions:', this.config.showActions);
      console.log('Building columns - hasConfigActions:', hasConfigActions);
      console.log('Building columns - hasActionsTemplate:', hasActionsTemplate);
      
      // Always add actions column if showActions is true
      // The template will handle showing appropriate content
      columns.push('actions');
    }
    
    return columns;
  }

  private updateDataSource(): void {
    this.dataSource.data = this.data;
  }

  private formatDate(value: any): string {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString();
  }

  private formatCurrency(value: any): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  private formatNumber(value: any): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US').format(value);
  }

  /**
   * Formats a color code to ensure it's a valid hex color
   * Supports: "FBDE4A", "#FBDE4A", "fbde4a", "#fbde4a"
   * Returns: "#FBDE4A" format for CSS
   */
  formatColorCode(value: any): string {
    if (!value) return '';

    const colorValue = String(value).trim();

    // If already has #, return as-is (after validation)
    if (colorValue.startsWith('#')) {
      // Validate it's a proper 6-character hex code
      if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
        return colorValue.toUpperCase();
      }
      return '';
    }

    // If it's a 6-character hex code without #, add it
    if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) {
      return `#${colorValue.toUpperCase()}`;
    }

    // Invalid format
    return '';
  }

  private emitSelectionChange(): void {
    this.selectionChange.emit({
      selected: this.selection.selected
    });
  }

  // ==================
  // PUBLIC METHODS
  // ==================

  getColumn(key: string): TableColumn<T> | undefined {
    return this.config.columns.find((col) => col.key === key);
  }

  getColumnTemplate(columnKey: string): TemplateRef<any> | null {
    const column = this.getColumn(columnKey);
    
    if (column?.templateRef) {
      return column.templateRef;
    }
    
    return this.columnTemplateMap.get(columnKey) || null;
  }

  hasCustomTemplate(columnKey: string): boolean {
    const column = this.getColumn(columnKey);
    return column?.type === 'template' || !!this.getColumnTemplate(columnKey);
  }

  getCellValue(row: T, column: TableColumn<T>): any {
    if (column.cellRenderer) {
      return column.cellRenderer(row);
    }
    
    const value = (row as any)[column.key];
    
    if (column.formatter) {
      return column.formatter(value, row);
    }
    
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

  getBadgeColor(column: TableColumn<T>, value: any): string {
    if (!column.badgeConfig) return 'default';
    
    const { colorMap, defaultColor } = column.badgeConfig;
    
    if (colorMap && colorMap[value]) {
      return colorMap[value];
    }
    
    return defaultColor || 'default';
  }

  getBadgeValue(column: TableColumn<T>, value: any): string {
    if (!column.badgeConfig || !column.badgeConfig.transform) {
      return value;
    }
    
    return column.badgeConfig.transform(value);
  }

  getVisibleActions(row: T): TableAction<T>[] {
    if (!this.config.actions) return [];
    
    return this.config.actions.filter((action) => {
      if (action.hidden) {
        return !action.hidden(row);
      }
      return true;
    });
  }

  isActionDisabled(action: TableAction<T>, row: T): boolean {
    if (action.disabled) {
      return action.disabled(row);
    }
    return false;
  }

  getColumnAlignClass(column: TableColumn<T>): string {
    return `text-${column.align || 'left'}`;
  }

  getRowClass(row: T): string {
    if (!this.config.rowCssClass) return '';
    
    if (typeof this.config.rowCssClass === 'function') {
      return this.config.rowCssClass(row);
    }
    
    return this.config.rowCssClass;
  }

  getHeaderTooltip(column: TableColumn<T>): string {
    if (!column.tooltip) {
      return '';
    }

    if (typeof column.tooltip === 'string') {
      return column.tooltip;
    }

    return '';
  }

  getCellTooltip(column: TableColumn<T>, row: T): string {
    if (!column.tooltip) {
      return '';
    }

    if (typeof column.tooltip === 'function') {
      return column.tooltip(row);
    }

    return column.tooltip;
  }

  getActionButtonType(action: TableAction<T>): string {
    return action.type || 'icon';
  }

  // ==================
  // EVENT HANDLERS
  // ==================

  onRowClick(row: T): void {
    if (this.config.rowClickHandler) {
      this.config.rowClickHandler(row);
    }
    this.rowClick.emit(row);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      previousPageIndex: event.previousPageIndex
    });
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction
    });
  }

  onActionClick(action: TableAction<T>, row: T, event: Event): void {
    event.stopPropagation();
    action.handler(row);
  }

  // ==================
  // SELECTION METHODS
  // ==================

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
    
    this.emitSelectionChange();
  }

  toggleRow(row: T): void {
    this.selection.toggle(row);
    this.emitSelectionChange();
  }

  isRowSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  checkboxLabel(row?: T): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
}