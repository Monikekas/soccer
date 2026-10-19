import { TestBed } from '@angular/core/testing';
import { Leagues } from './leagues';

describe('Leagues', () => {
  let service: Leagues;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Leagues);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
