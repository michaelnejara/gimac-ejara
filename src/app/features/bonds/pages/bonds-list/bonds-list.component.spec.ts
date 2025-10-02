import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondsListComponent } from './bonds-list.component';

describe('BondsListComponent', () => {
  let component: BondsListComponent;
  let fixture: ComponentFixture<BondsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BondsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
