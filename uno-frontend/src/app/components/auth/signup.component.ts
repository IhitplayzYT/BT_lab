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
  transition
} from '@angular/animations';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
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
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private validationService = inject(ValidationService);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;
  
  // Validation errors
  usernameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';

  // Password strength indicators
  passwordStrength = 0;
  passwordRequirements = {
    length: false,
    alphabet: false,
    numeric: false,
    special: false
  };

  checkPasswordStrength(): void {
    const requirements = {
      length: this.password.length >= 8,
      alphabet: /[a-zA-Z]/.test(this.password),
      numeric: /[0-9]/.test(this.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(this.password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    this.passwordStrength = metRequirements;
  }

  isPasswordStrong(): boolean {
    return Object.values(this.passwordRequirements).every(Boolean);
  }

  validateUsername(): void {
    const result = this.validationService.validateAndCleanUsername(this.username);
    if (!result.valid) {
      this.usernameError = result.error || '';
    } else {
      this.username = result.cleaned;
      this.usernameError = '';
    }
  }

  validateEmail(): void {
    const result = this.validationService.validateAndCleanEmail(this.email);
    if (!result.valid) {
      this.emailError = result.error || '';
    } else {
      this.email = result.cleaned;
      this.emailError = '';
    }
  }

  validatePassword(): void {
    const strength = this.validationService.getPasswordStrength(this.password);
    this.passwordStrength = strength.score;
    this.passwordRequirements = strength.requirements;
    
    if (!this.password) {
      this.passwordError = 'Password is required';
    } else if (strength.score < 4) {
      this.passwordError = 'Password must meet all requirements';
    } else {
      this.passwordError = '';
    }
  }

  validateConfirmPassword(): void {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
    } else {
      this.confirmPasswordError = '';
    }
  }

  async signup(): Promise<void> {
    this.error = '';
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    
    // Validate all inputs
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();
    
    if (this.usernameError || this.emailError || this.passwordError || this.confirmPasswordError) {
      this.error = 'Please fix the errors above';
      return;
    }

    // Log inputs
    console.log('=== SIGNUP MIDDLEWARE LOG ===');
    console.log('📝 INPUTS RECEIVED:');
    console.log('  Username:', this.username);
    console.log('  Email:', this.email);
    console.log('  Password length:', this.password.length);
    console.log('  Password provided:', !!this.password);
    console.log('  Confirm password length:', this.confirmPassword.length);
    console.log('  Passwords match:', this.password === this.confirmPassword);
    console.log('  Password strength:', this.passwordStrength, '/ 4');
    console.log('  Password requirements met:', this.passwordRequirements);

    if (!this.username.trim()) {
      console.log('❌ VALIDATION FAILED: Username required');
      this.error = 'Username is required';
      return;
    }

    if (!this.email.trim()) {
      console.log('❌ VALIDATION FAILED: Email required');
      this.error = 'Email is required';
      return;
    }

    if (!this.email.includes('@') || !this.email.includes('.')) {
      console.log('❌ VALIDATION FAILED: Invalid email');
      this.error = 'Please enter a valid email address';
      return;
    }

    if (!this.password) {
      console.log('❌ VALIDATION FAILED: Password required');
      this.error = 'Password is required';
      return;
    }

    if (!this.isPasswordStrong()) {
      console.log('❌ VALIDATION FAILED: Password too weak');
      this.error = 'Password must be at least 8 characters and contain letters, numbers, and special characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      console.log('❌ VALIDATION FAILED: Passwords do not match');
      this.error = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    console.log('🚀 SENDING SIGNUP REQUEST...');
    console.log('  Endpoint: http://localhost:8090/api/auth/signup');
    console.log('  Method: POST');
    console.log('  Request body:', {
      username: this.username,
      email: this.email,
      password: '[REDACTED]',
      role: 'CUSTOMER (default)'
    });

    try {
      const response = await this.authService.signup(this.username, this.password, this.email);
      console.log('✅ SIGNUP RESPONSE RECEIVED:');
      console.log('  Response:', response);
      console.log('  Has accessToken:', !!response?.accessToken);
      console.log('  Has refreshToken:', !!response?.refreshToken);
      console.log('  Username in response:', response?.username);
      console.log('  Roles in response:', response?.roles);
      console.log('  Token type:', response?.tokenType);
      console.log('  Expires in:', response?.expiresIn);
      console.log('🔄 REDIRECTING TO DASHBOARD...');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.log('❌ SIGNUP ERROR:');
      console.log('  Error:', error);
      console.log('  Error message:', error.message);
      console.log('  Error status:', error.status);
      console.log('  Error body:', error.error);
      this.error = error.error?.message || 'Signup failed. Please try again.';
    } finally {
      this.isLoading = false;
      console.log('=== END SIGNUP MIDDLEWARE LOG ===');
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
