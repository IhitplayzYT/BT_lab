import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, DestroyRef, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AnimationService } from '../../services/animation.service';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../icon/icon.component';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslatePipe, CommonModule, IconComponent, LanguageSelectorComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private animationService = inject(AnimationService);
  private theme = inject(ThemeService);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly user = this.authService.user;

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly isDarkMode = this.theme.isDark;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.animationService.initializeSmoothScroll();

    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== this.isScrolled()) this.isScrolled.set(scrolled);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      document.documentElement.classList.remove('nav-open');
    });
  }

  toggleTheme(event?: Event): void {
    this.theme.toggle(event?.currentTarget as Element | null);
  }

  toggleMobileMenu(): void {
    this.setMenu(!this.isMobileMenuOpen());
  }

  private setMenu(open: boolean): void {
    this.isMobileMenuOpen.set(open);
    if (this.isBrowser) document.documentElement.classList.toggle('nav-open', open);
  }

  /** Scrolls to a landing-page section, navigating home first when needed. */
  goToSection(event: MouseEvent, id: string): void {
    if (event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    this.setMenu(false);
    const path = this.router.url.split(/[?#]/)[0];
    if (path === '/') {
      this.animationService.scrollTo('#' + id, -90);
    } else {
      this.router.navigate(['/']).then(() => setTimeout(() => this.animationService.scrollTo('#' + id, -90), 500));
    }
  }

  go(event: MouseEvent | null, route: string): void {
    if (event) {
      if (event.metaKey || event.ctrlKey) return;
      event.preventDefault();
    }
    this.setMenu(false);
    this.router.navigate([route]);
  }

  navigateTo(route: string): void {
    this.go(null, route);
  }

  async logout(): Promise<void> {
    this.setMenu(false);
    await this.authService.logout();
  }
}
