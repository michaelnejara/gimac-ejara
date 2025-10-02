import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from '@core/services/notification/notification.service';
import { NotificationContainer } from './notification-container';

describe('NotificationContainerComponent', () => {
  let component: NotificationContainer;
  let fixture: ComponentFixture<NotificationContainer>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotificationContainer,
        NoopAnimationsModule
      ],
      providers: [NotificationService]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationContainer);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    notificationService.dismissAll();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have notifications array initialized', () => {
    expect(component.notifications).toBeDefined();
    expect(Array.isArray(component.notifications)).toBe(true);
  });

  it('should have default position', () => {
    expect(component.position).toBe('top-right');
  });

  it('should have dismiss method', () => {
    expect(component.dismiss).toBeDefined();
    expect(typeof component.dismiss).toBe('function');
  });

  it('should have handleAction method', () => {
    expect(component.handleAction).toBeDefined();
    expect(typeof component.handleAction).toBe('function');
  });

  it('should subscribe to notification service on init', () => {
    expect(component['subscription']).toBeDefined();
  });

  it('should unsubscribe on destroy', () => {
    const subscription = component['subscription'];
    expect(subscription).toBeDefined();
    
    spyOn(subscription!, 'unsubscribe');
    component.ngOnDestroy();
    
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });
});