import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Dark is the default theme. The choice is stored under the same
 * `theme` localStorage key the rest of the app already uses.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly isDark = signal(true);

  constructor() {
    if (this.isBrowser) {
      this.isDark.set(localStorage.getItem('theme') !== 'light');
      document.body.classList.toggle('dark-mode', this.isDark());
    }
  }

  /** Flips the theme. (The `origin` argument is accepted for compatibility and ignored.) */
  toggle(_origin?: Element | null): void {
    if (!this.isBrowser) return;
    const next = !this.isDark();
    document.body.classList.toggle('dark-mode', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    this.isDark.set(next);
  }
}
