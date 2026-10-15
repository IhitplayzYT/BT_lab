import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Products', href: '#features' },
    { label: 'Pricing', href: '#pricing' }
  ];

  supportLinks = [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' }
  ];

  socialLinks = [
    { icon: '𝕏', href: '#' },
    { icon: 'in', href: '#' },
    { icon: '📘', href: '#' }
  ];

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
