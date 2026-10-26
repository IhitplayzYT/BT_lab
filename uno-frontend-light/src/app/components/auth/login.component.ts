import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../services/validation.service';
import {
  trigger,
  style,
  animate,
  transition,
  sequence,
  group,
  query,
  animateChild
} from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('fadeInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('bounce', [
      transition(':enter', [
        style({ transform: 'translateY(0)' }),
        animate('1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ transform: 'translateY(-10px)' })),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('pulse', [
      transition(':enter', [
        style({ transform: 'scale(1)', opacity: 0.5 }),
        animate('2000ms ease-in-out', style({ transform: 'scale(1.1)', opacity: 0.8 })),
        animate('2000ms ease-in-out', style({ transform: 'scale(1)', opacity: 0.5 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('buttonPulse', [
      transition('* => hover', [
        animate('300ms ease-out', style({ transform: 'scale(1.02)' }))
      ]),
      transition('* => leave', [
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private validationService = inject(ValidationService);

  username = '';
  password = '';
  isLoading = false;
  error = '';
  showPassword = false;
  
  // Validation errors
  usernameError = '';
  passwordError = '';

  validateUsername(): void {
    const result = this.validationService.validateAndCleanUsername(this.username);
    if (!result.valid) {
      this.usernameError = result.error || '';
    } else {
      this.username = result.cleaned;
      this.usernameError = '';
    }
  }

  validatePassword(): void {
    if (!this.password) {
      this.passwordError = 'Password is required';
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
    } else {
      this.passwordError = '';
    }
  }

  async login(): Promise<void> {
    this.error = '';
    this.usernameError = '';
    this.passwordError = '';
    
    // Validate inputs
    this.validateUsername();
    this.validatePassword();
    
    if (this.usernameError || this.passwordError) {
      this.error = 'Please fix the errors above';
      return;
    }
    
    // Log inputs
    console.log('=== LOGIN MIDDLEWARE LOG ===');
    console.log('📝 INPUTS RECEIVED:');
    console.log('  Username:', this.username);
    console.log('  Password length:', this.password.length);
    console.log('  Password provided:', !!this.password);
    
    if (!this.username.trim() || !this.password.trim()) {
      console.log('❌ VALIDATION FAILED: Missing fields');
      this.error = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    console.log('🚀 SENDING LOGIN REQUEST...');
    console.log('  Endpoint: http://localhost:8090/api/auth/login');
    console.log('  Method: POST');
    console.log('  Request body:', {
      username: this.username,
      password: '[REDACTED]'
    });

    try {
      const response = await this.authService.login(this.username, this.password);
      console.log('✅ LOGIN RESPONSE RECEIVED:');
      console.log('  Response:', response);
      console.log('  Has accessToken:', !!response?.accessToken);
      console.log('  Has refreshToken:', !!response?.refreshToken);
      console.log('  Username in response:', response?.username);
      console.log('  Roles in response:', response?.roles);
      console.log('🔄 REDIRECTING TO DASHBOARD...');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.log('❌ LOGIN ERROR:');
      console.log('  Error:', error);
      console.log('  Error message:', error.message);
      console.log('  Error status:', error.status);
      console.log('  Error body:', error.error);
      
      let errorMessage = 'Invalid credentials. Please check your username and password.';
      
      if (error.status === 401) {
        errorMessage = 'Invalid username or password. Please try again.';
      } else if (error.status === 404) {
        errorMessage = 'User not found. Please check your username or sign up for a new account.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Your account may be locked or inactive.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.error = errorMessage;
      alert(errorMessage);
      
      // Optionally reload the page after showing error
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      this.isLoading = false;
      console.log('=== END LOGIN MIDDLEWARE LOG ===');
    }
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearFields(): void {
    this.username = '';
    this.password = '';
    this.usernameError = '';
    this.passwordError = '';
    this.error = '';
    this.showPassword = false;
  }
}
