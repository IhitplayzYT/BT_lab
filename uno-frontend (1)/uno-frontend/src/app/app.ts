import { Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FxService } from './services/fx.service';
import { AnimationService } from './services/animation.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private fx = inject(FxService);
  private animation = inject(AnimationService);

  constructor() {
    // Browser-only: smooth scroll + the global interaction layer
    afterNextRender(() => {
      this.animation.initializeSmoothScroll();
      this.fx.init();
    });
  }
}
