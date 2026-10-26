import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Light "feel" layer: a one-shot fade-up when cards and section headers
 * scroll into view. One IntersectionObserver, no scroll/pointer listeners,
 * and each element is released from the observer as soon as it has appeared.
 *
 * Opt out with the .no-reveal class; opt in with .reveal.
 */

const REVEAL = [
  '.section-header',
  '.card',
  '.faq-item',
  '.pricing-card',
  '.reveal'
].join(',');

const REVEAL_SKIP = '.no-reveal, .modal-overlay, .form-overlay, .auth-container, .hero, .navbar, .footer, .modal, .review-modal';

@Injectable({ providedIn: 'root' })
export class FxService {
  private zone = inject(NgZone);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private started = false;

  init(): void {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.zone.runOutsideAngular(() => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (!en.isIntersecting) continue;
            const el = en.target as HTMLElement;
            io.unobserve(el);
            el.classList.add('fx-in');
            // Hand the element back to its own transitions once it has appeared
            setTimeout(() => {
              el.classList.remove('fx-reveal', 'fx-in');
              el.style.removeProperty('--fx-delay');
            }, 700);
          }
        },
        { threshold: 0.08 }
      );

      const prep = (el: HTMLElement) => {
        if (el.dataset['fxSeen']) return;
        el.dataset['fxSeen'] = '1';
        if (el.closest(REVEAL_SKIP) || el.parentElement?.closest('.fx-reveal')) return;
        const sibs = Array.from(el.parentElement?.children ?? []).filter((c) => c.matches(REVEAL));
        el.style.setProperty('--fx-delay', `${Math.min(Math.max(0, sibs.indexOf(el)), 5) * 40}ms`);
        el.classList.add('fx-reveal');
        io.observe(el);
      };

      const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>(REVEAL).forEach(prep);

      // Batch DOM additions (route changes) into one scan per frame
      let queued = false;
      const pending = new Set<Element>();
      const flush = () => {
        queued = false;
        pending.forEach((n) => {
          if (n.isConnected) {
            if (n.matches(REVEAL)) prep(n as HTMLElement);
            scan(n);
          }
        });
        pending.clear();
      };

      scan(document.body);
      new MutationObserver((muts) => {
        for (const m of muts) m.addedNodes.forEach((n) => n.nodeType === 1 && pending.add(n as Element));
        if (pending.size && !queued) {
          queued = true;
          requestAnimationFrame(flush);
        }
      }).observe(document.body, { childList: true, subtree: true });
    });
  }
}
