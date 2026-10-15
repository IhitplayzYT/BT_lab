import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements AfterViewInit {
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);

  features = [
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Your investments are protected with 256-bit encryption and multi-factor authentication.'
    },
    {
      icon: '📈',
      title: 'Competitive Rates',
      description: 'Enjoy industry-leading interest rates up to 8.5% p.a. on your fixed deposits.'
    },
    {
      icon: '⚡',
      title: 'Instant Processing',
      description: 'Open FD accounts and process transactions in real-time with zero delays.'
    },
    {
      icon: '🎯',
      title: 'Flexible Tenures',
      description: 'Choose from 6 to 120 months tenure options to match your financial goals.'
    },
    {
      icon: '💳',
      title: 'Easy Management',
      description: 'Manage all your FDs from one intuitive dashboard with detailed analytics.'
    },
    {
      icon: '🌐',
      title: '24/7 Access',
      description: 'Access your accounts anytime, anywhere with our secure online platform.'
    }
  ];

  ngAfterViewInit(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.feature-card');
    this.animationService.staggerReveal(Array.from(cards), 0.1);
  }
}
