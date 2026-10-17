import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiClientService } from '../../services/api-client.service';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiClient = inject(ApiClientService);
  private router = inject(Router);
  private currencyService = inject(CurrencyService);

  readonly user = this.authService.user;
  readonly isLoggedIn = this.authService.isLoggedIn;

  isDarkMode = false;

  fdAccounts = signal<any[]>([]);
  products = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  userRole = signal('');

  activeTab = signal('portfolio');

  // Time progression
  clockStatus = signal<any>(null);
  isAdvancingTime = signal(false);
  
  // Active applications data
  activeApplications = signal<any[]>([]);
  
  // User's preferred currency for display
  preferredCurrency = signal('INR');
  
  // Recommended FD packages - will be dynamically built from loaded products
  recommendedPackages = signal<any[]>([]);
  
  // Settings form data
  settingsData = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    panNumber: '',
    age: '',
    gender: '',
    occupation: '',
    annualIncome: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    nationality: 'Indian',
    maritalStatus: '',
    accountNumber: '',
    ifscCode: '',
    nomineeName: '',
    nomineeRelation: '',
    defaultCurrency: 'INR'
  };

  supportedCurrencies = this.currencyService.getSupportedCurrencies();
  
  // Masking states
  showAccountNumber = false;
  showIfscCode = false;
  showPanNumber = false;

  ngOnInit(): void {
    this.loadThemePreference();

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
    this.loadSettings();
    this.loadClockStatus();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      const products = await this.apiClient.getActiveProducts('FD').toPromise();
      this.products.set(products || []);

      // Build recommended packages dynamically from valid products
      this.buildRecommendedPackages(products || []);

      // Load customer's FD applications from backend
      const applications = await this.apiClient.getMyApplications().toPromise();
      // Filter out rejected applications - only show ACTIVE, PENDING, or MATURED
      const activeApps = (applications || []).filter(app =>
        app.approvalStatus !== 'REJECTED' && app.status !== 'REJECTED'
      );
      this.fdAccounts.set(activeApps);
      this.activeApplications.set(activeApps);

      // Load chart data for visualization
      const chartData = await this.apiClient.getPortfolioSummary().toPromise();
      console.log('Chart data loaded:', chartData);

    } catch (error: any) {
      console.error('Dashboard data load error:', error);
      this.products.set([]);
      this.fdAccounts.set([]);
      this.activeApplications.set([]);
    } finally {
      this.isLoading.set(false);
    }
  };

  private buildRecommendedPackages(products: any[]): void {
    if (!products || products.length === 0) {
      this.recommendedPackages.set([]);
      return;
    }

    // Get the first valid product code as default
    const defaultProduct = products[0];
    const defaultProductCode = defaultProduct.productCode;

    // Build packages using valid product codes and tenures within valid range (6-24 months)
    const packages = [
      {
        id: 1,
        name: 'Starter Pack',
        description: 'Perfect for beginners - 3 FDs with varying tenures',
        products: [
          { productCode: defaultProductCode, amount: 25000, tenure: 6 },
          { productCode: defaultProductCode, amount: 25000, tenure: 12 },
          { productCode: defaultProductCode, amount: 50000, tenure: 24 }
        ],
        totalAmount: 100000,
        estimatedReturn: 115000,
        badge: 'Popular'
      },
      {
        id: 2,
        name: 'Senior Citizen Bundle',
        description: 'Special rates for senior citizens with tax benefits',
        products: [
          { productCode: defaultProductCode, amount: 50000, tenure: 12 },
          { productCode: defaultProductCode, amount: 150000, tenure: 24 }
        ],
        totalAmount: 200000,
        estimatedReturn: 245000,
        badge: 'Best Value'
      },
      {
        id: 3,
        name: 'High Growth Portfolio',
        description: 'Maximize returns with longer tenures',
        products: [
          { productCode: defaultProductCode, amount: 100000, tenure: 18 },
          { productCode: defaultProductCode, amount: 100000, tenure: 24 },
          { productCode: defaultProductCode, amount: 100000, tenure: 24 }
        ],
        totalAmount: 300000,
        estimatedReturn: 390000,
        badge: 'High Returns'
      }
    ];

    this.recommendedPackages.set(packages);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  navigateToCalculator(): void {
    this.router.navigate(['/calculator']);
  }

  navigateToApplyFD(): void {
    this.router.navigate(['/apply-fd']);
  }

  quickPurchase(pkg: any): void {
    // Store the package data in localStorage for pre-filling
    localStorage.setItem('quick_purchase_package', JSON.stringify(pkg));
    this.router.navigate(['/apply-fd']);
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // Settings methods
  saveSettings(): void {
    const defaultDetails = {
      firstName: this.settingsData.firstName,
      middleName: this.settingsData.middleName,
      lastName: this.settingsData.lastName,
      email: this.settingsData.email,
      phone: this.settingsData.phone,
      panNumber: this.settingsData.panNumber,
      age: this.settingsData.age,
      gender: this.settingsData.gender,
      occupation: this.settingsData.occupation,
      annualIncome: this.settingsData.annualIncome,
      address: this.settingsData.address,
      city: this.settingsData.city,
      state: this.settingsData.state,
      pincode: this.settingsData.pincode,
      nationality: this.settingsData.nationality,
      maritalStatus: this.settingsData.maritalStatus,
      accountNumber: this.settingsData.accountNumber,
      ifscCode: this.settingsData.ifscCode,
      nomineeName: this.settingsData.nomineeName,
      nomineeRelation: this.settingsData.nomineeRelation,
      defaultCurrency: this.settingsData.defaultCurrency
    };
    localStorage.setItem('default_fd_details', JSON.stringify(defaultDetails));
    alert('Settings saved successfully!');
  }

  loadSettings(): void {
    const saved = localStorage.getItem('default_fd_details');
    if (saved) {
      try {
        const details = JSON.parse(saved);
        this.settingsData = {
          firstName: details.firstName || '',
          middleName: details.middleName || '',
          lastName: details.lastName || '',
          email: details.email || '',
          phone: details.phone || '',
          panNumber: details.panNumber || '',
          age: details.age || '',
          gender: details.gender || '',
          occupation: details.occupation || '',
          annualIncome: details.annualIncome || '',
          address: details.address || '',
          city: details.city || '',
          state: details.state || '',
          pincode: details.pincode || '',
          nationality: details.nationality || 'Indian',
          maritalStatus: details.maritalStatus || '',
          accountNumber: details.accountNumber || '',
          ifscCode: details.ifscCode || '',
          nomineeName: details.nomineeName || '',
          nomineeRelation: details.nomineeRelation || '',
          defaultCurrency: details.defaultCurrency || 'INR'
        };
        this.preferredCurrency.set(details.defaultCurrency || 'INR');
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }

  // Helper method to convert INR amount to preferred currency for display
  convertForDisplay(amountINR: number): number {
    return this.currencyService.convertFromINR(amountINR, this.preferredCurrency());
  }

  formatCurrency(amount: number): string {
    const converted = this.convertForDisplay(amount);
    const symbol = this.currencyService.getCurrencySymbol(this.preferredCurrency());
    return `${symbol}${converted.toLocaleString()}`;
  }

  maskValue(value: string, show: boolean): string {
    if (!value) return '';
    if (show) return value;
    if (value.length <= 4) return '****';
    return value.substring(0, 2) + '****' + value.substring(value.length - 2);
  }

  toggleMask(field: string): void {
    if (field === 'accountNumber') {
      this.showAccountNumber = !this.showAccountNumber;
    } else if (field === 'ifscCode') {
      this.showIfscCode = !this.showIfscCode;
    } else if (field === 'panNumber') {
      this.showPanNumber = !this.showPanNumber;
    }
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
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

  // Help content
  helpContent = {
    terms: [
      'Minimum deposit: ₹10,000',
      'Maximum deposit: ₹1 crore',
      'Tenure: 6 months to 10 years',
      'Interest rates vary by product type and tenure',
      'Premature withdrawal may attract penalties',
      'Tax Saver FD has a 5-year lock-in period'
    ],
    eligibility: [
      'Must be a resident Indian citizen',
      'Valid PAN card required',
      'Minimum age: 18 years',
      'Senior citizens (60+) get additional benefits',
      'Valid bank account for credit/debit operations'
    ],
    requirements: [
      'PAN card (mandatory)',
      'Aadhaar card (optional but recommended)',
      'Passport size photograph',
      'Bank account details for credit of maturity amount',
      'Nominee details (optional but recommended)',
      'KYC documents may be required for high-value deposits'
    ],
    contact: {
      phone: '1800-123-4567',
      email: 'support@unobank.com',
      address: 'UNO Bank Headquarters, Banking Sector, Mumbai - 400001',
      workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM IST'
    }
  };

  // Contract actions
  viewContractDetails(account: any): void {
    console.log('viewContractDetails called with:', account);
    alert(`Viewing details for FD Account: ${account.fdAccountNo}\n\nPrincipal: ${this.formatCurrency(account.principalAmount)}\nMaturity Amount: ${this.formatCurrency(account.maturityAmount)}\nInterest Rate: ${account.interestRate}%\nTenure: ${account.tenureMonths} months\nMaturity Date: ${account.maturityDate}`);
  }

  prematureClose(account: any): void {
    console.log('prematureClose called with:', account);
    if (confirm(`Are you sure you want to prematurely close FD Account ${account.fdAccountNo}?\n\nNote: Premature withdrawal may attract penalties.`)) {
      console.log('User confirmed, calling withdrawFD API for:', account.fdAccountNo);
      this.apiClient.withdrawFD(account.fdAccountNo, 'Premature closure requested by customer').subscribe({
        next: (response) => {
          console.log('Withdrawal successful, response:', response);
          alert(`FD Account ${account.fdAccountNo} has been successfully closed.`);
          // Reload the dashboard data to reflect the closure
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Premature closure error:', error);
          alert(`Failed to close FD Account: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      });
    } else {
      console.log('User cancelled premature close');
    }
  }

  // Portfolio summary calculations
  get totalInvestment(): number {
    return this.fdAccounts().reduce((sum, acc) => sum + (parseFloat(acc.principalAmount) || 0), 0);
  }

  get totalInterestEarned(): number {
    return this.fdAccounts().reduce((sum, acc) => {
      const principal = parseFloat(acc.principalAmount) || 0;
      const maturity = parseFloat(acc.maturityAmount) || principal;
      return sum + (maturity - principal);
    }, 0);
  }

  get activeContractsCount(): number {
    return this.fdAccounts().filter(acc => acc.status === 'ACTIVE').length;
  }

  // Clock/Time progression methods
  loadClockStatus(): void {
    this.apiClient.getClockStatus().subscribe({
      next: (status) => {
        this.clockStatus.set(status);
      },
      error: (error) => {
        console.error('Failed to load clock status:', error);
        // Clock status might not be accessible to customers, that's okay
      }
    });
  }

  advanceTimeByMonth(): void {
    if (confirm('Advance time by 1 month? This will trigger interest accrual and maturity checks.')) {
      this.isAdvancingTime.set(true);
      this.apiClient.advanceTime(30).subscribe({
        next: (response) => {
          console.log('Time advanced:', response);
          this.clockStatus.set(response);
          alert('Time advanced by 1 month successfully!');
          // Reload dashboard data to see updated FD states
          this.loadDashboardData();
          this.isAdvancingTime.set(false);
        },
        error: (error) => {
          console.error('Time advance error:', error);
          alert(`Failed to advance time: ${error.error?.message || error.message || 'Unknown error'}`);
          this.isAdvancingTime.set(false);
        }
      });
    }
  }

  resetTime(): void {
    if (confirm('Reset time to current date?')) {
      this.apiClient.resetTime().subscribe({
        next: (response) => {
          console.log('Time reset:', response);
          this.clockStatus.set(response);
          alert('Time reset successfully!');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Time reset error:', error);
          alert(`Failed to reset time: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      });
    }
  }

  // Export functionality
  exportToPDF(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'fd_portfolio.pdf');
      alert('PDF exported successfully!');
    }, error => {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    });
  }

  exportToCSV(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'csv').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'fd_portfolio.csv');
      alert('CSV exported successfully!');
    }, error => {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    });
  }

  exportEarningsReport(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'xlsx').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'fd_earnings_report.xlsx');
      alert('Earnings report exported successfully!');
    }, error => {
      console.error('Earnings report export error:', error);
      alert('Failed to export earnings report. Please try again.');
    });
  }
}
