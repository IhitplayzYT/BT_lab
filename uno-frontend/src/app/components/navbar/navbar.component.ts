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

  ngAfterViewInit(): void {
    this.initializeScrollListener();
    this.animationService.initializeSmoothScroll();
  }

  private initializeScrollListener(): void {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
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
