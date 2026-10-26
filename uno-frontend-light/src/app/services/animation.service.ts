import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Small, dependency-free replacement for the old GSAP + Lenis service.
 * The public methods keep their names so existing components don't change,
 * but everything now uses native scrolling and the Web Animations API.
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private get reduced(): boolean {
    return this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Kept for compatibility: the browser's own smooth scrolling is used now (see _base.scss). */
  initializeSmoothScroll(): void {}

  /** Scrolls to a selector, element or pixel position. */
  scrollTo(target: string | number | HTMLElement, offset = 0): void {
    if (!this.isBrowser) return;
    const behavior: ScrollBehavior = this.reduced ? 'auto' : 'smooth';
    if (typeof target === 'number') {
      window.scrollTo({ top: target + offset, behavior });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior });
  }

  /** Quick fade + rise for a list of elements, lightly staggered. */
  staggerReveal(elements: HTMLElement[], stagger = 0.1): void {
    if (!this.isBrowser || this.reduced) return;
    elements.forEach((el, i) => this.fadeUp(el, Math.min(i, 8) * Math.min(stagger, 0.05) * 1000));
  }

  fadeInOnScroll(element: HTMLElement | null): void {
    if (!this.isBrowser || this.reduced || !element) return;
    this.fadeUp(element, 0);
  }

  clipPathReveal(element: HTMLElement, _direction: 'up' | 'down' | 'left' | 'right' = 'up'): void {
    if (!this.isBrowser || this.reduced || !element) return;
    this.fadeUp(element, 0);
  }

  private fadeUp(el: HTMLElement, delay: number): void {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' }
      ],
      { duration: 300, delay, easing: 'ease-out', fill: 'backwards' }
    );
  }
}
