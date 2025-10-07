import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '@shared/breadcrumb/breadcrumb';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Navbar, Sidebar, RouterOutlet, BreadcrumbComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
