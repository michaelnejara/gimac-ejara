import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBondsModal } from './assign-bonds-modal';

describe('AssignBondsModal', () => {
  let component: AssignBondsModal;
  let fixture: ComponentFixture<AssignBondsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignBondsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignBondsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
