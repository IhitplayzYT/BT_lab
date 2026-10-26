import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, ElementRef, OnInit, AfterViewInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { ProductManagementComponent } from '../product-management/product-management.component';
import { AdvancedChartsComponent } from '../advanced-charts/advanced-charts.component';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { RelationNetsComponent } from '../relation-nets/relation-nets.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, ProductManagementComponent, AdvancedChartsComponent, LanguageSelectorComponent, RelationNetsComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements AfterViewInit, OnInit {
  private elementRef = inject(ElementRef);
  private apiClient = inject(ApiClientService);
  private cdr = inject(ChangeDetectorRef);

  showProductManagement = false;

  set activeTab(value: string) {
    this._activeTab = value;
    if (value === 'logs') void this.loadOperationLogs();
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
  visualizationAccounts: any[] = [];
  visualizationMonthly: any[] = [];
  visualizationAmounts: any[] = [];
  visualizationTenures: any[] = [];

  users: any[] = [];
  officers: any[] = [];

  operationLogs: any[] = [];
  operationLogsTotal = 0;
  operationLogsPage = 0;
  operationLogsPageSize = 50;
  operationLogsLoading = false;
  operationLogsError = '';
  operationLogFilters = { operationType: '', actor: '', target: '', from: '', to: '', sortBy: 'time', sort: 'DESC' };
  readonly operationLogTypes = [
    'USER_CREATED', 'USER_DELETED', 'USER_ROLE_UPDATED', 'USER_DEACTIVATED', 'USER_REACTIVATED',
    'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_RETIRED', 'PRODUCT_REACTIVATED', 'PRODUCT_DELETED',
    'FD_ACCOUNT_CREATED', 'FD_APPLICATION_APPROVED', 'FD_APPLICATION_REJECTED',
    'FD_APPLICATION_SUBMITTED', 'FD_BUNDLE_SUBMITTED', 'FD_BUNDLE_APPROVED', 'FD_BUNDLE_REJECTED', 'FD_PREMATURE_WITHDRAWAL',
    'INTEREST_SETTINGS_UPDATED', 'BUSINESS_TIME_ADVANCED', 'BUSINESS_TIME_RESET',
    'INTEREST_BATCH_PROCESSED', 'MATURITY_BATCH_COMPLETED', 'REPORT_EXTRACT_RUN', 'REPORT_GENERATED'
  ];

  isLoading = true;
  error = '';
  dataLoaded = false;

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

  // Create user form
  newUserForm = {
    username: '',
    password: '',
    email: '',
    roles: ['CUSTOMER']
  };
  selectedRole = 'CUSTOMER';
  showCreateUserModal = false;

  // Search and filter for officers
  officerSearchQuery = '';
  officerSortField = 'username';
  officerSortOrder = 'asc';
  officerFilterStatus = '';

  // Time progression
  clockStatus = signal<any>(null);
  isAdvancingTime = signal(false);

  // Dark mode
  isDarkMode = false;

  ngOnInit(): void {
    // Reload token from localStorage to ensure it's available
    this.apiClient.loadToken();
    this.loadThemePreference();
    // Load data with proper sequencing
    this.loadAnalyticsData().then(() => {
      this.loadClockStatus();
      this.loadUsers();
    });
  }

  async loadAnalyticsData(): Promise<void> {
    try {
      this.isLoading = true;

      // Ensure token is loaded before making requests
      this.apiClient.loadToken();

      // Load pending applications using the same endpoint as officer
      console.log('Loading pending applications...');
      const pendingApps = await this.apiClient.getPendingApplications().toPromise();
      console.log('Pending applications:', pendingApps);
      this.analytics.pendingApprovals = (pendingApps || []).length;

      // Ensure token is still available before next request
      this.apiClient.loadToken();

      // Load all applications for analytics
      console.log('Loading all applications...');
      const allApps = await this.apiClient.getAllApplications().toPromise();
      console.log('All applications:', allApps);
      console.log('Number of applications:', allApps?.length || 0);
      this.visualizationAccounts = allApps || [];
      this.prepareVisualizationData(this.visualizationAccounts);

      if (allApps && allApps.length > 0) {
        this.analytics.totalFDs = allApps.length;
        
        // Log status distribution for debugging
        const statusCounts = allApps.reduce((acc: any, app: any) => {
          const status = app.status || app.approvalStatus || 'UNKNOWN';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log('Status distribution:', statusCounts);

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
        
        console.log('Analytics calculated:', this.analytics);
      } else {
        console.warn('No applications found - all metrics will be 0');
      }

    } catch (error: any) {
      console.error('Error loading analytics:', error);
      this.error = 'Failed to load analytics data';
    } finally {
      this.isLoading = false;
      this.dataLoaded = true;
      this.cdr.detectChanges();
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

  downloadFdSummaryByStatus(status: string, format: string): void {
    this.apiClient.downloadFdSummary(status, format).subscribe(blob => {
      this.apiClient.downloadFile(blob, `fd-summary-${status.toLowerCase()}.${format}`);
      alert('Report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadMaturityReport(days: number, format: string): void {
    this.apiClient.downloadMaturitySummary(days, format).subscribe(blob => {
      this.apiClient.downloadFile(blob, `maturity-summary-${days}d.${format}`);
      alert('Report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadCustomerPortfolioPdf(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'all-portfolios.pdf');
      alert('Portfolio report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadCustomerPortfolioExcel(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'xlsx').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'all-portfolios.xlsx');
      alert('Portfolio report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadCustomerPortfolioCsv(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'csv').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'all-portfolios.csv');
      alert('Portfolio report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadInterestReport(): void {
    this.apiClient.downloadInterestReport('pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'interest-report.pdf');
      alert('Interest report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadTransactionReport(): void {
    this.apiClient.downloadTransactionReport('xlsx').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'transaction-report.xlsx');
      alert('Transaction report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  logout(): void {
    this.apiClient.clearToken();
    window.location.href = '/';
  }

  // Load users from backend
  async loadUsers(): Promise<void> {
    try {
      console.log('Loading users...');
      const response = await this.apiClient.getAllUsers().toPromise();
      console.log('Users response:', response);
      this.users = (response?.users || []).map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles ? user.roles.split(',') : [],
        enabled: user.enabled,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }));
      console.log('Processed users:', this.users);

      // Also load officers (users with BANK_OFFICER role)
      this.officers = this.users.filter(user =>
        user.roles.includes('BANK_OFFICER')
      ).map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.enabled ? 'ACTIVE' : 'INACTIVE',
        enabled: user.enabled,
        roles: user.roles
      }));
      console.log('Processed officers:', this.officers);

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async loadOperationLogs(): Promise<void> {
    this.operationLogsLoading = true;
    this.operationLogsError = '';
    try {
      this.apiClient.loadToken();
      const result = await this.apiClient.getOperationLogs({
        ...this.operationLogFilters,
        page: this.operationLogsPage,
        size: this.operationLogsPageSize
      }).toPromise();
      this.operationLogs = result?.logs || [];
      this.operationLogsTotal = result?.totalElements || 0;
    } catch (error) {
      console.error('Error loading operation logs:', error);
      this.operationLogsError = 'Could not load operation logs. Please refresh and try again.';
      this.operationLogs = [];
      this.operationLogsTotal = 0;
    } finally {
      this.operationLogsLoading = false;
      this.cdr.detectChanges();
    }
  }

  applyOperationLogFilters(): void {
    this.operationLogsPage = 0;
    void this.loadOperationLogs();
  }

  clearOperationLogFilters(): void {
    this.operationLogFilters = { operationType: '', actor: '', target: '', from: '', to: '', sortBy: 'time', sort: 'DESC' };
    this.operationLogsPage = 0;
    void this.loadOperationLogs();
  }

  changeOperationLogsPage(direction: -1 | 1): void {
    const nextPage = this.operationLogsPage + direction;
    if (nextPage < 0 || nextPage * this.operationLogsPageSize >= this.operationLogsTotal) return;
    this.operationLogsPage = nextPage;
    void this.loadOperationLogs();
  }

  banUser(username: string): void {
    if (confirm(`Are you sure you want to ban user ${username}?`)) {
      this.apiClient.banUser(username).subscribe({
        next: () => {
          alert(`User ${username} banned successfully`);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error banning user:', error);
          alert(`Failed to ban user: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  unbanUser(username: string): void {
    if (confirm(`Are you sure you want to unban user ${username}?`)) {
      this.apiClient.unbanUser(username).subscribe({
        next: () => {
          alert(`User ${username} unbanned successfully`);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error unbanning user:', error);
          alert(`Failed to unban user: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  deactivateUser(username: string): void {
    if (confirm(`Are you sure you want to deactivate user ${username}?`)) {
      this.apiClient.banUser(username).subscribe({
        next: () => {
          alert(`User ${username} deactivated successfully`);
          void this.loadUsers();
        },
        error: (error) => {
          console.error('Error deactivating user:', error);
          alert(`Failed to deactivate user: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  debarOfficer(username: string): void {
    if (confirm(`Are you sure you want to debar officer ${username}?`)) {
      const officer = this.officers.find(item => item.username === username);
      if (!officer) return;
      const remainingRoles = officer.roles.filter((role: string) => role !== 'BANK_OFFICER');
      this.apiClient.updateUserRoles(username, remainingRoles).subscribe({
        next: () => {
          alert(`Officer access removed for ${username}`);
          void this.loadUsers();
        },
        error: (error) => {
          console.error('Error debarring officer:', error);
          alert(`Failed to debar officer: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  reactivateOfficer(username: string): void {
    if (confirm(`Are you sure you want to reactivate officer ${username}?`)) {
      this.apiClient.unbanUser(username).subscribe({
        next: () => {
          alert(`Officer ${username} reactivated successfully`);
          void this.loadUsers();
        },
        error: (error) => {
          console.error('Error reactivating officer:', error);
          alert(`Failed to reactivate officer: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  updateUserRole(username: string, newRole: string): void {
    const user = this.users.find(u => u.username === username);
    if (!user) return;

    const roles = [newRole];
    this.apiClient.updateUserRoles(username, roles).subscribe({
      next: () => {
        alert(`User ${username} role updated to ${newRole}`);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        alert(`Failed to update role: ${error.error?.message || error.message}`);
      }
    });
  }

  deleteUser(username: string): void {
    if (confirm(`Are you sure you want to PERMANENTLY delete user ${username}? This action cannot be undone.`)) {
      this.apiClient.deleteUser(username).subscribe({
        next: () => {
          alert(`User ${username} deleted successfully`);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert(`Failed to delete user: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  showCreateUser(): void {
    this.showCreateUserModal = true;
    this.newUserForm = {
      username: '',
      password: '',
      email: '',
      roles: ['CUSTOMER']
    };
    this.selectedRole = 'CUSTOMER';
  }

  hideCreateUser(): void {
    this.showCreateUserModal = false;
  }

  createUser(): void {
    if (!this.newUserForm.username || !this.newUserForm.password || !this.newUserForm.email) {
      alert('Please fill in all fields');
      return;
    }

    this.apiClient.createUser(
      this.newUserForm.username,
      this.newUserForm.password,
      this.newUserForm.email,
      [this.selectedRole]
    ).subscribe({
      next: () => {
        alert('User created successfully');
        this.hideCreateUser();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert(`Failed to create user: ${error.error?.message || error.message}`);
      }
    });
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
    if (this.userFilterStatus !== '') {
      const isEnabled = this.userFilterStatus === 'true';
      filtered = filtered.filter(user => user.enabled === isEnabled);
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
        case 'enabled':
          comparison = (a.enabled === b.enabled) ? 0 : (a.enabled ? -1 : 1);
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

  // Theme methods
  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'light') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  // Visualization helper methods
  getCountForStatus(status: string): number {
    switch (status) {
      case 'Active': return this.analytics.activeFDs;
      case 'Matured': return this.analytics.maturedFDs;
      case 'Rejected': return this.analytics.rejectedFDs;
      case 'Pending': return this.analytics.pendingApprovals;
      default: return 0;
    }
  }

  getPercentageForStatus(status: string): number {
    const total = this.analytics.totalFDs;
    if (total === 0) return 0;
    return Math.round((this.getCountForStatus(status) / total) * 100);
  }

  getBarPercentage(value: number, items: { count: number }[]): number {
    const max = Math.max(0, ...items.map(item => item.count));
    return max ? Math.round(value / max * 100) : 0;
  }

  private prepareVisualizationData(apps: any[]): void {
    const now = new Date();
    this.visualizationMonthly = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const count = apps.filter(app => {
        const created = app.createdAt ? new Date(app.createdAt) : null;
        return created && created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
      }).length;
      return { label: date.toLocaleString('en', { month: 'short' }), count };
    });
    const amountRanges = [
      { label: '<10K', matches: (n: number) => n < 10000 },
      { label: '10K–50K', matches: (n: number) => n >= 10000 && n < 50000 },
      { label: '50K–1L', matches: (n: number) => n >= 50000 && n < 100000 },
      { label: '1L–5L', matches: (n: number) => n >= 100000 && n < 500000 },
      { label: '>5L', matches: (n: number) => n >= 500000 }
    ];
    this.visualizationAmounts = amountRanges.map(range => ({ label: range.label, count: apps.filter(app => range.matches(Number(app.principalAmount) || 0)).length }));
    const tenureRanges = [
      { label: '6M', matches: (n: number) => n > 0 && n <= 6 },
      { label: '12M', matches: (n: number) => n > 6 && n <= 12 },
      { label: '18M', matches: (n: number) => n > 12 && n <= 18 },
      { label: '24M', matches: (n: number) => n > 18 && n <= 24 },
      { label: '36M', matches: (n: number) => n > 24 && n <= 36 },
      { label: '>36M', matches: (n: number) => n > 36 }
    ];
    this.visualizationTenures = tenureRanges.map(range => ({ label: range.label, count: apps.filter(app => range.matches(Number(app.tenureMonths) || 0)).length }));
    const total = apps.length;
    const products = new Map<string, { count: number; totalAmount: number }>();
    apps.forEach(app => {
      const product = app.productCode || 'Unknown';
      const current = products.get(product) || { count: 0, totalAmount: 0 };
      current.count++;
      current.totalAmount += Number(app.principalAmount) || 0;
      products.set(product, current);
    });
    this.productWiseDistribution = [...products.entries()].map(([product, value]) => ({
      product, ...value, percentage: total ? Math.round(value.count / total * 100) : 0
    }));
  }
}
