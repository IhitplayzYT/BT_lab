import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-officer-login',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './officer-login.component.html',
  styleUrls: ['./officer-login.component.scss']
})
export class OfficerLoginComponent {
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
      
      // Verify user has officer role
      if (!this.authService.isBankOfficer()) {
        this.error = 'Access denied. Bank Officer privileges required.';
        this.authService.logout();
        return;
      }
      
      this.router.navigate(['/officer']);
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
