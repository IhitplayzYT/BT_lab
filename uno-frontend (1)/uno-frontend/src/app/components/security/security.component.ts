import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [TranslatePipe, CommonModule, IconComponent],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent {
  features = [
    {
      icon: 'lock',
      title: '256-bit Encryption',
      description: 'All data is encrypted using military-grade AES-256 encryption'
    },
    {
      icon: 'shield',
      title: 'Multi-Factor Auth',
      description: 'Secure your account with 2FA and biometric authentication'
    },
    {
      icon: 'eye',
      title: 'Real-time Monitoring',
      description: '24/7 fraud detection and suspicious activity monitoring'
    },
    {
      icon: 'phone',
      title: 'Secure Mobile Access',
      description: 'Bank safely with our secure mobile application'
    }
  ];
}
