import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeagueForm } from './league-form';

describe('LeagueForm', () => {
  let component: LeagueForm;
  let fixture: ComponentFixture<LeagueForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LeagueForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
