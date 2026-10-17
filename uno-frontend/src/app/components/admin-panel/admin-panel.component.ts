import { Component, ElementRef, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { ProductManagementComponent } from '../product-management/product-management.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductManagementComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements AfterViewInit, OnInit {
  private elementRef = inject(ElementRef);
  private apiClient = inject(ApiClientService);
  
  showProductManagement = false;

  set activeTab(value: string) {
    this._activeTab = value;
    setTimeout(() => this.animateCards(), 50);
  }

  get activeTab(): string {
    return this._activeTab;
  }

  private _activeTab = 'analytics';

  analytics = {
    totalFDs: 0,
    totalDeposits: 0,
    pendingApprovals: 0,
    activeFDs: 0,
    maturedFDs: 0,
    rejectedFDs: 0,
    averageTenure: 0,
    totalInterestEarned: 0,
    approvalRate: 0,
    avgDepositAmount: 0,
    totalCustomers: 0
  };

  recentApplications: any[] = [];
  allApplications: any[] = [];
  productWiseDistribution: any[] = [];

  users: any[] = [];
  officers: any[] = [];

  isLoading = true;
  error = '';

  // Search and filter for applications
  appSearchQuery = '';
  appSortField = 'date';
  appSortOrder = 'desc';
  appFilterStatus = '';
  appFilterMinAmount: number | null = null;
  appFilterMaxAmount: number | null = null;

  // Search and filter for users
  userSearchQuery = '';
  userSortField = 'username';
  userSortOrder = 'asc';
  userFilterStatus = '';

  // Search and filter for officers
  officerSearchQuery = '';
  officerSortField = 'username';
  officerSortOrder = 'asc';
  officerFilterStatus = '';

  // Time progression
  clockStatus = signal<any>(null);
  isAdvancingTime = signal(false);

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.loadClockStatus();
  }

  async loadAnalyticsData(): Promise<void> {
    try {
      this.isLoading = true;

      // Load pending applications using the same endpoint as officer
      const pendingApps = await this.apiClient.getPendingApplications().toPromise();
      this.analytics.pendingApprovals = (pendingApps || []).length;

      // Load all applications for analytics
      const allApps = await this.apiClient.getAllApplications().toPromise();

      if (allApps && allApps.length > 0) {
        this.analytics.totalFDs = allApps.length;
        this.analytics.activeFDs = allApps.filter((app: any) => app.status === 'ACTIVE').length;
        this.analytics.maturedFDs = allApps.filter((app: any) => app.status === 'MATURED').length;
        this.analytics.rejectedFDs = allApps.filter((app: any) => app.approvalStatus === 'REJECTED').length;

        // Calculate totals
        this.analytics.totalDeposits = allApps.reduce((sum: number, app: any) => sum + (parseFloat(app.principalAmount) || 0), 0);

        // Calculate average tenure
        const totalTenure = allApps.reduce((sum: number, app: any) => sum + (app.tenureMonths || 0), 0);
        this.analytics.averageTenure = Math.round(totalTenure / allApps.length);

        // Calculate total interest (maturity amount - principal)
        this.analytics.totalInterestEarned = allApps.reduce((sum: number, app: any) => {
          const principal = parseFloat(app.principalAmount) || 0;
          const maturityAmount = parseFloat(app.maturityAmount) || principal;
          return sum + (maturityAmount - principal);
        }, 0);

        // Calculate approval rate
        const totalProcessed = this.analytics.activeFDs + this.analytics.rejectedFDs;
        this.analytics.approvalRate = totalProcessed > 0
          ? Math.round((this.analytics.activeFDs / totalProcessed) * 100)
          : 0;

        // Calculate average deposit amount
        this.analytics.avgDepositAmount = Math.round(this.analytics.totalDeposits / allApps.length);

        // Calculate unique customers
        const uniqueCustomers = new Set(allApps.map((app: any) => app.customerId));
        this.analytics.totalCustomers = uniqueCustomers.size;

        // Store all applications for filtering
        this.allApplications = allApps.map((app: any) => ({
          id: app.fdAccountNo,
          customer: app.applicantFullName || `${app.applicantFirstName} ${app.applicantLastName}` || 'Unknown',
          amount: parseFloat(app.principalAmount) || 0,
          status: app.approvalStatus || app.status,
          date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));

        // Set recent applications (last 10)
        this.recentApplications = this.allApplications.slice(0, 10);
      }

      // Load chart data
      try {
        const chartData = await this.apiClient.getPortfolioSummary().toPromise();
        if (chartData) {
          this.productWiseDistribution = chartData.byProduct || [];
        }
      } catch (e) {
        console.warn('Portfolio summary not available:', e);
        this.productWiseDistribution = [];
      }

    } catch (error: any) {
      console.error('Error loading analytics:', error);
      this.error = 'Failed to load analytics data';
    } finally {
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    this.animateCards();
  }

  private animateCards(): void {
    setTimeout(() => {
      const cards = this.elementRef.nativeElement.querySelectorAll('.analytics-card, .distribution-card');
      cards.forEach((card: Element, index: number) => {
        setTimeout(() => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 100);
  }

  formatCurrency(value: number): string {
    return '₹' + (value / 10000000).toFixed(2) + ' Cr';
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  // Download reports
  downloadFdSummaryPdf(): void {
    this.apiClient.downloadFdSummary('ACTIVE', 'pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'fd-summary-active.pdf');
    });
  }

  downloadFdSummaryExcel(): void {
    this.apiClient.downloadFdSummary('ACTIVE', 'xlsx').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'fd-summary-active.xlsx');
    });
  }

  downloadMaturityReportPdf(): void {
    this.apiClient.downloadMaturitySummary(30, 'pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'maturity-summary-30d.pdf');
    });
  }

  generatePythonReport(): void {
    this.apiClient.generatePythonReport().subscribe(result => {
      console.log('Python report generated:', result);
      alert('Python report generated successfully!');
    });
  }

  logout(): void {
    this.apiClient.clearToken();
    window.location.href = '/';
  }

  banUser(userId: string): void {
    if (confirm(`Are you sure you want to ban user ${userId}?`)) {
      // TODO: Call backend API to ban user
      alert(`User ${userId} banned successfully`);
    }
  }

  deactivateUser(userId: string): void {
    if (confirm(`Are you sure you want to deactivate user ${userId}?`)) {
      // TODO: Call backend API to deactivate user
      alert(`User ${userId} deactivated successfully`);
    }
  }

  debarOfficer(officerId: string): void {
    if (confirm(`Are you sure you want to debar officer ${officerId}?`)) {
      // TODO: Call backend API to debar officer
      alert(`Officer ${officerId} debarred successfully`);
    }
  }

  // Get filtered and sorted applications
  get filteredApplications(): any[] {
    let filtered = [...this.allApplications];

    // Search filter
    if (this.appSearchQuery) {
      const query = this.appSearchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.customer.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.appFilterStatus) {
      filtered = filtered.filter(app => app.status === this.appFilterStatus);
    }

    // Amount range filter
    if (this.appFilterMinAmount !== null) {
      filtered = filtered.filter(app => app.amount >= this.appFilterMinAmount!);
    }
    if (this.appFilterMaxAmount !== null) {
      filtered = filtered.filter(app => app.amount <= this.appFilterMaxAmount!);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.appSortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'customer':
          comparison = a.customer.localeCompare(b.customer);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return this.appSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Get filtered and sorted users
  get filteredUsers(): any[] {
    let filtered = [...this.users];

    // Search filter
    if (this.userSearchQuery) {
      const query = this.userSearchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.userFilterStatus) {
      filtered = filtered.filter(user => user.status === this.userFilterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.userSortField) {
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return this.userSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Get filtered and sorted officers
  get filteredOfficers(): any[] {
    let filtered = [...this.officers];

    // Search filter
    if (this.officerSearchQuery) {
      const query = this.officerSearchQuery.toLowerCase();
      filtered = filtered.filter(officer =>
        officer.username.toLowerCase().includes(query) ||
        officer.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.officerFilterStatus) {
      filtered = filtered.filter(officer => officer.status === this.officerFilterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.officerSortField) {
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return this.officerSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Reset application filters
  resetAppFilters(): void {
    this.appSearchQuery = '';
    this.appSortField = 'date';
    this.appSortOrder = 'desc';
    this.appFilterStatus = '';
    this.appFilterMinAmount = null;
    this.appFilterMaxAmount = null;
  }

  // Reset user filters
  resetUserFilters(): void {
    this.userSearchQuery = '';
    this.userSortField = 'username';
    this.userSortOrder = 'asc';
    this.userFilterStatus = '';
  }

  // Reset officer filters
  resetOfficerFilters(): void {
    this.officerSearchQuery = '';
    this.officerSortField = 'username';
    this.officerSortOrder = 'asc';
    this.officerFilterStatus = '';
  }

  // Time progression methods
  loadClockStatus(): void {
    this.apiClient.getClockStatus().subscribe({
      next: (status) => {
        this.clockStatus.set(status);
      },
      error: (error) => {
        console.error('Error loading clock status:', error);
      }
    });
  }

  advanceTimeByMonth(): void {
    this.isAdvancingTime.set(true);
    this.apiClient.advanceTime(30).subscribe({
      next: (response) => {
        this.loadClockStatus();
        this.loadAnalyticsData();
        alert('Time advanced by 1 month successfully!');
      },
      error: (error) => {
        console.error('Error advancing time:', error);
        alert('Failed to advance time. Check console for details.');
      },
      complete: () => {
        this.isAdvancingTime.set(false);
      }
    });
  }
}
