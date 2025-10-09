import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondTransactions } from './bond-transactions';

describe('BondTransactions', () => {
  let component: BondTransactions;
  let fixture: ComponentFixture<BondTransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondTransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BondTransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
