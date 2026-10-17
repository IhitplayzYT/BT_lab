import { Component, inject, ElementRef, AfterViewInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AnimationService } from '../../services/animation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly user = this.authService.user;

  isScrolled = false;
  isMobileMenuOpen = false;
  isDarkMode = false;

  ngAfterViewInit(): void {
    this.initializeScrollListener();
    this.animationService.initializeSmoothScroll();
    this.loadThemePreference();
  }

  private initializeScrollListener(): void {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMobileMenuOpen = false;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
