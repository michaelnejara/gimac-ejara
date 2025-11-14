import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmBondsModal } from './confirm-bonds-modal';

describe('ConfirmUnassignBondsModal', () => {
  let component: ConfirmBondsModal;
  let fixture: ComponentFixture<ConfirmBondsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmBondsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmBondsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
