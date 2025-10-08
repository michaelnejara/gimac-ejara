// src/app/shared/components/data-table/data-table-directives.ts
import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Directive for defining custom column templates
 * 
 * Use this directive to provide custom rendering for table columns.
 * The directive receives the row data as context.
 * 
 * @example
 * ```html
 * <app-data-table [data]="data" [config]="config">
 *   <ng-template appTableColumn="fullName" let-row>
 *     <strong>{{ row.firstName }} {{ row.lastName }}</strong>
 *   </ng-template>
 * </app-data-table>
 * ```
 */
@Directive({
  selector: '[appTableColumn]',
  standalone: true
})
export class TableColumnDirective {
  /** Column key that this template applies to */
  @Input('appTableColumn') columnKey!: string;
  
  constructor(public template: TemplateRef<any>) {}
}

/**
 * Directive for defining custom actions template
 * 
 * Use this directive to provide custom action buttons for each row.
 * The directive receives the row data as context.
 * 
 * @example
 * ```html
 * <app-data-table [data]="data" [config]="config">
 *   <ng-template appTableActions let-row>
 *     <button mat-button (click)="edit(row)">Edit</button>
 *     <button mat-button (click)="delete(row)">Delete</button>
 *   </ng-template>
 * </app-data-table>
 * ```
 */
@Directive({
  selector: '[appTableActions]',
  standalone: true
})
export class TableActionsDirective {
  constructor(public template: TemplateRef<any>) {}
}