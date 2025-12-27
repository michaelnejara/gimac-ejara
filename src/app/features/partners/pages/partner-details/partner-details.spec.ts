import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerDetails } from './partner-details';

describe('PartnerDetails', () => {
  let component: PartnerDetails;
  let fixture: ComponentFixture<PartnerDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
