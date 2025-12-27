import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPartner } from './add-partner';

describe('AddPartner', () => {
  let component: AddPartner;
  let fixture: ComponentFixture<AddPartner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPartner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPartner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
