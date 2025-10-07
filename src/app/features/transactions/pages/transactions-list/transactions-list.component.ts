import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {
  ReusableTableComponent,
  TableAction,
  TableColumn,
} from '@shared/reusabble-table/reusable-table';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
})
export class TransactionsListComponent {
  searchKeyword: string = '';

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, type: 'number' },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'createdAt',
      label: 'Date de création',
      sortable: true,
      type: 'date',
    },
    {
      key: 'salary',
      label: 'Salaire',
      sortable: true,
      format: (value) => `${value} €`,
    },
  ];

  users = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean@example.com',
      createdAt: '2024-01-15',
      salary: 45000,
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie@example.com',
      createdAt: '2024-02-20',
      salary: 52000,
    },
    {
      id: 3,
      name: 'Pierre Durand',
      email: 'pierre@example.com',
      createdAt: '2024-03-10',
      salary: 48000,
    },
  ];

  actions: TableAction[] = [
    {
      label: 'Voir',
      icon: 'visibility',
      color: 'primary',
      callback: (row) => this.viewUser(row),
    },
    {
      label: 'Modifier',
      icon: 'edit',
      color: 'accent',
      callback: (row) => this.editUser(row),
    },
    {
      label: 'Supprimer',
      icon: 'delete',
      color: 'warn',
      callback: (row) => this.deleteUser(row),
      condition: (row) => row.id !== 1, // Exemple: désactiver pour l'ID 1
    },
  ];

  onKeywordChange(keyword: string) {
    console.log('Keyword recherché:', keyword);
    this.searchKeyword = keyword;
    // Vous pouvez faire des actions supplémentaires ici
    // par exemple: appeler une API avec le keyword
  }

  viewUser(user: any) {
    console.log('Voir utilisateur:', user);
  }

  editUser(user: any) {
    console.log('Modifier utilisateur:', user);
  }

  deleteUser(user: any) {
    console.log('Supprimer utilisateur:', user);
  }
}
