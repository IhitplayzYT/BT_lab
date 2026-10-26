import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  isLoading = false;
  error = '';
  showPassword = false;

  async login(): Promise<void> {
    this.error = '';
    
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.login(this.username, this.password);
      
      // Verify user has admin role
      if (!this.authService.isAdmin()) {
        this.error = 'Access denied. Admin privileges required.';
        this.authService.logout();
        return;
      }
      
      this.router.navigate(['/admin']);
    } catch (error: any) {
      this.error = 'Invalid credentials. Please check your username and password.';
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
