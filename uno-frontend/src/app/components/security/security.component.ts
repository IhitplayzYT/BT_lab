import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent {
  features = [
    {
      icon: '🔐',
      title: '256-bit Encryption',
      description: 'All data is encrypted using military-grade AES-256 encryption'
    },
    {
      icon: '🛡️',
      title: 'Multi-Factor Auth',
      description: 'Secure your account with 2FA and biometric authentication'
    },
    {
      icon: '🔍',
      title: 'Real-time Monitoring',
      description: '24/7 fraud detection and suspicious activity monitoring'
    },
    {
      icon: '📱',
      title: 'Secure Mobile Access',
      description: 'Bank safely with our secure mobile application'
    }
  ];
}
