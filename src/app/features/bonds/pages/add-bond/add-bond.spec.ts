import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBond } from './add-bond';

describe('AddBond', () => {
  let component: AddBond;
  let fixture: ComponentFixture<AddBond>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBond]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBond);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
