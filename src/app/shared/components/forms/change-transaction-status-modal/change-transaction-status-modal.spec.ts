import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTransactionStatusModal } from './change-transaction-status-modal';

describe('ChangeTransactionStatusModal', () => {
  let component: ChangeTransactionStatusModal;
  let fixture: ComponentFixture<ChangeTransactionStatusModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeTransactionStatusModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeTransactionStatusModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
