import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondTransactionsList } from './bond-transactions-list';

describe('BondTransactions', () => {
  let component: BondTransactionsList;
  let fixture: ComponentFixture<BondTransactionsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondTransactionsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BondTransactionsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
