import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvShows } from './tv-shows';

describe('TvShows', () => {
  let component: TvShows;
  let fixture: ComponentFixture<TvShows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TvShows]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TvShows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
