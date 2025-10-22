import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerCustomersModal } from './partner-customers-modal';

describe('PartnerCustomersModal', () => {
  let component: PartnerCustomersModal;
  let fixture: ComponentFixture<PartnerCustomersModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerCustomersModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerCustomersModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
