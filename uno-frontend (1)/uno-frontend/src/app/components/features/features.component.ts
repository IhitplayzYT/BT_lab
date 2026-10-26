import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [TranslatePipe, CommonModule, IconComponent],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  features = [
    {
      icon: 'lock',
      title: 'Bank-Grade Security',
      description: 'Your investments are protected with 256-bit encryption and multi-factor authentication.'
    },
    {
      icon: 'trending-up',
      title: 'Competitive Rates',
      description: 'Enjoy industry-leading interest rates up to 8.5% p.a. on your fixed deposits.'
    },
    {
      icon: 'zap',
      title: 'Instant Processing',
      description: 'Open FD accounts and process transactions in real-time with zero delays.'
    },
    {
      icon: 'target',
      title: 'Flexible Tenures',
      description: 'Choose from 6 to 120 months tenure options to match your financial goals.'
    },
    {
      icon: 'wallet',
      title: 'Easy Management',
      description: 'Manage all your FDs from one intuitive dashboard with detailed analytics.'
    },
    {
      icon: 'globe',
      title: '24/7 Access',
      description: 'Access your accounts anytime, anywhere with our secure online platform.'
    }
  ];
}
