import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification/notification.service';
import { NotificationContainer } from "@shared/components/notification-container/notification-container";
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('gimac-admin-panel');
  // notification = inject(NotificationService);
  constructor (private notification: NotificationService) {}
  ngOnInit() {
    console.log('App initialized');
    this.notification.showInfo('App initialized', 'Info');
  }
  showSampleToast() {
    console.log('Showing sample toast');
    this.notification.showSuccess('This is a sample success toast!', 'Success');
  }
}
