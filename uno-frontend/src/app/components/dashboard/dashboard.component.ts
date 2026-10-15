import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiClientService } from '../../services/api-client.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiClient = inject(ApiClientService);
  private router = inject(Router);

  readonly user = this.authService.user;
  readonly isLoggedIn = this.authService.isLoggedIn;

  fdAccounts = signal<any[]>([]);
  products = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  userRole = signal('');

  ngOnInit(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirect based on role
    const roles = this.user()?.roles || [];
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/admin']);
      return;
    } else if (roles.includes('BANK_OFFICER')) {
      this.router.navigate(['/officer']);
      return;
    }

    // Customer stays on this dashboard
    this.userRole.set('CUSTOMER');
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      const [accounts, products] = await Promise.all([
        this.apiClient.getActiveProductsIntegration('FD').toPromise(),
        this.apiClient.getActiveProducts('FD').toPromise()
      ]);

      this.products.set(products || []);
      // Note: FD accounts would need a specific endpoint - using products as placeholder
      this.fdAccounts.set([]);
    } catch (error: any) {
      console.error('Dashboard data load error:', error);
      // Don't show error to user - just show empty state
      this.products.set([]);
      this.fdAccounts.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  navigateToCalculator(): void {
    this.router.navigate(['/'], { fragment: 'calculator' });
  }

  navigateToApplyFD(): void {
    this.router.navigate(['/apply-fd']);
  }
}
