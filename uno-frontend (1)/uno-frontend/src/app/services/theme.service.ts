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

  /** Flips the theme with a circular reveal that grows from `origin` (when supported). */
  toggle(origin?: Element | null): void {
    if (!this.isBrowser) return;
    const next = !this.isDark();
    const apply = () => {
      document.body.classList.toggle('dark-mode', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      this.isDark.set(next);
    };

    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduced) {
      apply();
      return;
    }

    const r = origin?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth - 60;
    const y = r ? r.top + r.height / 2 : 40;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    document.documentElement.classList.add('theme-switching');
    const vt = doc.startViewTransition(apply);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 850, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
    vt.finished.finally(() => document.documentElement.classList.remove('theme-switching'));
  }
}
