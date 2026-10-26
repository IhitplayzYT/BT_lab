import { Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FxService } from './services/fx.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private fx = inject(FxService);

  constructor() {
    // Browser-only: scroll-reveal for cards and section headers
    afterNextRender(() => this.fx.init());
  }
}
