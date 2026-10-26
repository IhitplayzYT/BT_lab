import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe, CommonModule, IconComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'About Us', href: '#about', isAnchor: true },
    { label: 'Features', href: '#features', isAnchor: true },
    { label: 'Calculator', href: '/calculator', isAnchor: false }
  ];

  supportLinks = [
    { label: 'Help Center', href: '/help-center', isAnchor: false },
    { label: 'Contact Us', href: '/contact', isAnchor: false }
  ];

  socialLinks = [
    { icon: 'x', label: 'X', href: '#' },
    { icon: 'linkedin', label: 'LinkedIn', href: '#' },
    { icon: 'facebook', label: 'Facebook', href: '#' }
  ];

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
