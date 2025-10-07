// ============================================
// reusable-table.component.ts
// ============================================
import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'custom';
  format?: (value: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  callback: (row: any) => void;
  condition?: (row: any) => boolean;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './reusable-table.html',
  styleUrls: ['./reusable-table.scss'],
})
export class ReusableTableComponent {
  @Input() set data(value: any[]) {
    this.dataSource.data = value;
  }

  @Input() set columns(value: TableColumn[]) {
    this._columns = value;
    this.displayedColumns = value.map((col) => col.key);
    if (this.actions && this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
  }

  @Input() set actions(value: TableAction[]) {
    this._actions = value;
    if (value && value.length > 0 && !this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }
  }

  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() showFilter: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() set keyword(value: string) {
    if (value) {
      this.dataSource.filter = value.trim().toLowerCase();
    }
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  _columns: TableColumn[] = [];
  _actions: TableAction[] = [];
  filterValue: string = '';

  @Output() keywordChange = new EventEmitter<string>();

  ngAfterViewInit() {
    if (this.showPagination) {
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.keywordChange.emit(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatCell(column: TableColumn, value: any): string {
    if (column.format) {
      return column.format(value);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    return value ?? '-';
  }

  executeAction(action: TableAction, row: any) {
    action.callback(row);
  }

  shouldShowAction(action: TableAction, row: any): boolean {
    return action.condition ? action.condition(row) : true;
  }

  getActionIcon(label: string): string {
    const iconMap: { [key: string]: string } = {
      edit: 'edit',
      delete: 'delete',
      view: 'visibility',
      download: 'download',
      share: 'share',
      archive: 'archive',
      restore: 'restore',
      duplicate: 'content_copy',
      print: 'print',
      export: 'file_download',
      details: 'info',
      activate: 'check_circle',
      deactivate: 'cancel',
      block: 'block',
      unblock: 'lock_open',
      assign: 'assignment',
      remove: 'remove_circle',
      send: 'send',
      refresh: 'refresh',
      settings: 'settings',
    };

    // Normaliser le label (minuscules, sans espaces)
    const normalizedLabel = label.toLowerCase().trim().replace(/\s+/g, '_');

    // Retourner l'icône correspondante ou une icône par défaut
    return iconMap[normalizedLabel] || 'more_horiz';
  }
}
