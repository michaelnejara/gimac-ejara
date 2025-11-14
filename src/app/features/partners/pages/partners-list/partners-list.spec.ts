import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersList } from './partners-list';

describe('PartnersList', () => {
  let component: PartnersList;
  let fixture: ComponentFixture<PartnersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
