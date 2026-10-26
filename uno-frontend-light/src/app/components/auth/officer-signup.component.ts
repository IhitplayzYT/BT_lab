import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-officer-signup',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './officer-signup.component.html',
  styleUrls: ['./officer-signup.component.scss']
})
export class OfficerSignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;

  // Password strength indicators
  passwordStrength = 0;
  passwordRequirements = {
    length: false,
    alphabet: false,
    numeric: false,
    special: false
  };

  checkPasswordStrength(): void {
    const pwd = this.password;
    this.passwordRequirements.length = pwd.length >= 8;
    this.passwordRequirements.alphabet = /[a-zA-Z]/.test(pwd);
    this.passwordRequirements.numeric = /[0-9]/.test(pwd);
    this.passwordRequirements.special = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    const metRequirements = Object.values(this.passwordRequirements).filter(Boolean).length;
    this.passwordStrength = metRequirements;
  }

  isPasswordStrong(): boolean {
    return Object.values(this.passwordRequirements).every(Boolean);
  }

  async signup(): Promise<void> {
    this.error = '';

    if (!this.username.trim()) {
      this.error = 'Username is required';
      return;
    }

    if (!this.email.trim()) {
      this.error = 'Email is required';
      return;
    }

    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.error = 'Please enter a valid email address';
      return;
    }

    if (!this.password) {
      this.error = 'Password is required';
      return;
    }

    if (!this.isPasswordStrong()) {
      this.error = 'Password must be at least 8 characters and contain letters, numbers, and special characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.signupWithRole(this.username, this.password, this.email, 'BANK_OFFICER');
      this.router.navigate(['/officer']);
    } catch (error: any) {
      this.error = error.error?.message || 'Signup failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
