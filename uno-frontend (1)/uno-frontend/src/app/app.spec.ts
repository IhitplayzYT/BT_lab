import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AnimationService } from './services/animation.service';
import { FxService } from './services/fx.service';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: FxService, useValue: { init: () => undefined } },
        { provide: AnimationService, useValue: { initializeSmoothScroll: () => undefined } },
      ],
    }).compileComponents();
  });

  it('creates the application shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the router outlet used by application routes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
