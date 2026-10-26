import { Injectable, NgZone, inject, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private lenis: Lenis | null = null;
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  
  private isBrowser = isPlatformBrowser(this.platformId);

  // Animation tokens
  readonly easing = {
    expoOut: 'expo.out',
    power4InOut: 'power4.inOut',
    power3InOut: 'power3.inOut',
    elasticOut: 'elastic.out(1, 0.5)'
  };

  readonly durations = {
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
    verySlow: 1.5
  };

  constructor() {
    if (this.isBrowser) {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  private tick: ((time: number) => void) | null = null;

  /** Starts Lenis once for the whole app (safe to call from any component). */
  initializeSmoothScroll(): void {
    if (!this.isBrowser || this.lenis) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.ngZone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        allowNestedScroll: true,
        infinite: false
      });

      // Keep ScrollTrigger in sync with Lenis
      this.lenis.on('scroll', ScrollTrigger.update);

      this.tick = (time: number) => this.lenis?.raf(time * 1000);
      gsap.ticker.add(this.tick);
      gsap.ticker.lagSmoothing(0);
    });
  }

  /** Smooth-scrolls to a selector, element or pixel offset. */
  scrollTo(target: string | number | HTMLElement, offset = 0): void {
    if (!this.isBrowser) return;
    if (this.lenis) {
      this.lenis.scrollTo(target as any, { offset, duration: 1.4 });
      return;
    }
    if (typeof target === 'number') {
      window.scrollTo({ top: target + offset, behavior: 'smooth' });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Text reveal animation
  textReveal(element: HTMLElement, delay: number = 0): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(
        element,
        {
          y: 100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: this.durations.normal,
          ease: this.easing.power4InOut,
          delay
        }
      );
    });
  }

  // Staggered reveal for multiple elements
  staggerReveal(elements: HTMLElement[], stagger: number = 0.1): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(
        elements,
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: this.durations.normal,
          ease: this.easing.power4InOut,
          stagger
        }
      );
    });
  }

  // Magnetic button effect
  magneticButton(element: HTMLElement): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      const xTo = gsap.quickTo(element, 'x', { duration: 0.5, ease: this.easing.elasticOut });
      const yTo = gsap.quickTo(element, 'y', { duration: 0.5, ease: this.easing.elasticOut });

      element.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        xTo(x * 0.3);
        yTo(y * 0.3);
      });

      element.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  // Parallax effect
  parallax(element: HTMLElement, speed: number = 0.5): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      gsap.to(element, {
        y: () => ScrollTrigger.maxScroll(window) * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // Clip path reveal
  clipPathReveal(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up'): void {
    if (!this.isBrowser) return;

    const clipPaths = {
      up: 'inset(100% 0 0 0)',
      down: 'inset(0 0 100% 0)',
      left: 'inset(0 100% 0 0)',
      right: 'inset(0 0 0 100%)'
    };

    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(
        element,
        {
          clipPath: clipPaths[direction]
        },
        {
          clipPath: 'inset(0 0 0 0)',
          duration: this.durations.slow,
          ease: this.easing.power4InOut
        }
      );
    });
  }

  // Number counter animation
  counterAnimation(element: HTMLElement, endValue: number, duration: number = 2): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      const obj = { value: 0 };
      
      gsap.to(obj, {
        value: endValue,
        duration,
        ease: this.easing.power4InOut,
        onUpdate: () => {
          element.textContent = Math.round(obj.value).toLocaleString();
        }
      });
    });
  }

  // Scroll progress indicator
  scrollProgress(element: HTMLElement): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      gsap.to(element, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        }
      });
    });
  }

  // Fade in on scroll
  fadeInOnScroll(element: HTMLElement, start: string = 'top 80%'): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: this.durations.normal,
          ease: this.easing.power4InOut,
          scrollTrigger: {
            trigger: element,
            start
          }
        }
      );
    });
  }

  // Cleanup method
  cleanup(): void {
    if (this.tick) {
      gsap.ticker.remove(this.tick);
      this.tick = null;
    }
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
}
