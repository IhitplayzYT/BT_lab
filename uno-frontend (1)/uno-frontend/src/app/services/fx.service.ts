import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Global "feel" layer for the whole app. Everything here works by event
 * delegation and a MutationObserver, so components get cursor glow, card
 * spotlights, 3D tilt, magnetic buttons, ripples, scroll reveals, count-ups,
 * scroll-drawn SVG and parallax without any per-component wiring.
 *
 * Opt-ins (plain attributes in templates):
 *   data-count            animate the first number found in the element's text
 *   data-scroll-draw      on an SVG path: stroke is drawn as it scrolls through view
 *   data-parallax="0.2"   sets --py (px) on scroll; use `translate: 0 var(--py)`
 *   data-reveal="left|right|zoom"   alternative reveal direction
 *   .no-reveal            opt an element out of the automatic reveal
 */

const REVEAL = [
  '.section-header',
  '.card',
  '.faq-item',
  '.pricing-card',
  '.accounts-table',
  '.applications-table',
  '.users-table',
  '.officers-table',
  '.dashboard-section > h2',
  '.reports-category > h3',
  '.reveal'
].join(',');

const REVEAL_SKIP = '.no-reveal, .modal-overlay, .form-overlay, .auth-container, .hero, .navbar, .footer, .modal, .review-modal';

const TILT = [
  '.feature-card',
  '.value-card',
  '.leader-card',
  '.testimonial-card',
  '.security-card',
  '.pricing-card',
  '.package-card',
  '.product-card',
  '.contract-card',
  '.stat-card',
  '.analytics-card',
  '.report-card',
  '.application-card',
  '.bundle-card',
  '.distribution-card',
  '.info-card'
].join(',');

const MAGNETIC = '.btn-primary, .btn-accent, .theme-toggle, .magnetic-btn, .social-link';
const HOVERABLE = 'a, button, [role="button"], .btn, select, label, .report-card, .application-card, .bundle-card, .faq-question';

@Injectable({ providedIn: 'root' })
export class FxService {
  private zone = inject(NgZone);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private started = false;

  private draws: { el: SVGGeometryElement; len: number }[] = [];
  private parallaxEls = new Set<HTMLElement>();
  private revealIO!: IntersectionObserver;
  private countIO!: IntersectionObserver;
  private scrollQueued = false;

  init(): void {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    this.zone.runOutsideAngular(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      this.initScroll();
      this.initRipple();
      if (fine) {
        this.initPointer();
        this.initDelegates(!reduced);
      }
      this.initObservers(reduced);
    });
  }

  /* ---------------------------------------------------------------- scroll */

  private initScroll(): void {
    const bar = document.querySelector<HTMLElement>('.fx-progress span');
    const update = () => {
      this.scrollQueued = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      doc.classList.toggle('scrolled', window.scrollY > 40);
      this.updateDraws();
      this.updateParallax();
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!this.scrollQueued) {
          this.scrollQueued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', () => {
      this.draws.forEach((d) => (d.len = this.prepareDash(d.el)));
      update();
    });
    update();
  }

  private updateDraws(): void {
    const vh = window.innerHeight;
    this.draws = this.draws.filter((d) => d.el.isConnected);
    for (const d of this.draws) {
      const r = d.el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.78 - r.top) / (r.height + vh * 0.22)));
      d.el.style.strokeDashoffset = String(d.len * (1 - p));
    }
  }

  private updateParallax(): void {
    const vh = window.innerHeight;
    this.parallaxEls.forEach((el) => {
      if (!el.isConnected) {
        this.parallaxEls.delete(el);
        return;
      }
      const speed = parseFloat(el.dataset['parallax'] || '0.15');
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.setProperty('--py', `${((r.top + r.height / 2 - vh / 2) * -speed).toFixed(1)}px`);
    });
  }

  private prepareDash(el: SVGGeometryElement): number {
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    return len;
  }

  /* --------------------------------------------------------------- pointer */

  private initPointer(): void {
    const root = document.documentElement;
    const glow = document.querySelector<HTMLElement>('.fx-glow');
    const ring = document.querySelector<HTMLElement>('.fx-ring');
    if (!glow || !ring) return;

    let tx = 0, ty = 0, gx = 0, gy = 0, rx = 0, ry = 0;
    let running = false;

    const loop = () => {
      gx += (tx - gx) * 0.07;
      gy += (ty - gy) * 0.07;
      rx += (tx - rx) * 0.24;
      ry += (ty - ry) * 0.24;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };

    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'touch') return;
        tx = e.clientX;
        ty = e.clientY;
        if (!running) {
          running = true;
          gx = rx = tx;
          gy = ry = ty;
          root.classList.add('fx-live');
          requestAnimationFrame(loop);
        }
        ring.classList.toggle('is-hover', !!(e.target as Element).closest?.(HOVERABLE));
      },
      { passive: true }
    );
    window.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    window.addEventListener('pointerup', () => ring.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => root.classList.remove('fx-live'));
    document.addEventListener('mouseenter', () => running && root.classList.add('fx-live'));
  }

  private initDelegates(motion: boolean): void {
    let tiltEl: HTMLElement | null = null;
    let magEl: HTMLElement | null = null;

    const clearTilt = () => {
      if (!tiltEl) return;
      tiltEl.classList.remove('tilt-on');
      tiltEl.style.removeProperty('--rx');
      tiltEl.style.removeProperty('--ry');
      tiltEl = null;
    };
    const clearMag = () => {
      if (!magEl) return;
      magEl.style.translate = '';
      magEl = null;
    };

    document.addEventListener(
      'pointermove',
      (e) => {
        const target = e.target as Element | null;
        if (!target || !target.closest) return;

        // Spotlight: gold hairline + light pool that follows the pointer
        const card = target.closest<HTMLElement>('.card');
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        }

        if (!motion) return;

        // 3D tilt
        const t = target.closest<HTMLElement>(TILT);
        if (t !== tiltEl) clearTilt();
        if (t && !t.closest('.modal-overlay, .form-overlay')) {
          const r = t.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          t.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
          t.style.setProperty('--rx', `${(-(py - 0.5) * 12).toFixed(2)}deg`);
          t.classList.add('tilt-on');
          tiltEl = t;
        }

        // Magnetic pull
        const m = target.closest<HTMLElement>(MAGNETIC);
        if (m !== magEl) clearMag();
        if (m && !m.matches(':disabled')) {
          const r = m.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          m.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
          magEl = m;
        }
      },
      { passive: true }
    );

    document.addEventListener('pointerleave', () => {
      clearTilt();
      clearMag();
    });
  }

  private initRipple(): void {
    document.addEventListener('pointerdown', (e) => {
      const btn = (e.target as Element | null)?.closest?.<HTMLElement>('.btn');
      if (!btn || (btn as HTMLButtonElement).disabled) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const dot = document.createElement('span');
      dot.className = 'fx-ripple';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - r.left - size / 2}px`;
      dot.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(dot);
      setTimeout(() => dot.remove(), 850);
    });
  }

  /* ------------------------------------------------------------- observers */

  private initObservers(reduced: boolean): void {
    this.revealIO = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          this.revealIO.unobserve(el);
          requestAnimationFrame(() => el.classList.add('fx-in'));
          const delay = parseInt(el.style.getPropertyValue('--fx-delay')) || 0;
          // Hand the element back to its own transitions once the entrance is done
          setTimeout(() => {
            el.classList.remove('fx-reveal', 'fx-in');
            el.style.removeProperty('--fx-delay');
          }, delay + 1400);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    this.countIO = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          this.countIO.unobserve(en.target);
          this.runCount(en.target as HTMLElement, reduced);
        }
      },
      { threshold: 0.4 }
    );

    const scan = (root: ParentNode | Element) => {
      const els: Element[] = [];
      if (root instanceof Element) els.push(root);
      els.push(...Array.from(root.querySelectorAll('*')));
      for (const el of els) {
        if (!reduced && el.matches(REVEAL)) this.prepReveal(el as HTMLElement);
        if (el.hasAttribute('data-count') && !(el as HTMLElement).dataset['fxCount']) {
          (el as HTMLElement).dataset['fxCount'] = '1';
          this.countIO.observe(el);
        }
        if (el.hasAttribute('data-scroll-draw') && 'getTotalLength' in el) {
          const g = el as SVGGeometryElement;
          this.draws.push({ el: g, len: this.prepareDash(g) });
          if (reduced) g.style.strokeDashoffset = '0';
        }
        if (el.hasAttribute('data-parallax') && !reduced) this.parallaxEls.add(el as HTMLElement);
      }
      if (this.draws.length || this.parallaxEls.size) requestAnimationFrame(() => (this.updateDraws(), this.updateParallax()));
    };

    scan(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n as Element));
    }).observe(document.body, { childList: true, subtree: true });
  }

  private prepReveal(el: HTMLElement): void {
    if (el.dataset['fxSeen']) return;
    el.dataset['fxSeen'] = '1';
    if (el.closest(REVEAL_SKIP)) return;
    const parentReveal = el.parentElement?.closest('.fx-reveal');
    if (parentReveal) return;

    const sibs = Array.from(el.parentElement?.children ?? []).filter((c) => c.matches(REVEAL));
    const idx = Math.max(0, sibs.indexOf(el));
    el.style.setProperty('--fx-delay', `${Math.min(idx, 8) * 75}ms`);
    el.classList.add('fx-reveal');
    this.revealIO.observe(el);
  }

  private runCount(el: HTMLElement, reduced: boolean): void {
    const node = el.firstChild && el.firstChild.nodeType === 3 ? (el.firstChild as Text) : null;
    const text = (node ? node.nodeValue : el.textContent) ?? '';
    const m = text.match(/^(\D*?)(\d[\d,]*\.?\d*)(.*)$/s);
    if (!m || reduced) return;
    const [, pre, numStr, suf] = m;
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (!isFinite(target)) return;
    const decimals = (numStr.split('.')[1] || '').length;
    const grouped = numStr.includes(',');
    const set = (v: number) => {
      let s = v.toFixed(decimals);
      if (grouped) s = Number(s).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      const out = pre + s + suf;
      if (node) node.nodeValue = out;
      else el.textContent = out;
    };
    const dur = 1900;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      set(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    set(0);
    requestAnimationFrame(step);
  }
}
