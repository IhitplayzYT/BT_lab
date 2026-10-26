import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiClientService } from '../../services/api-client.service';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';
import { HttpClient } from '@angular/common/http';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { HelpBotComponent } from '../help-bot/help-bot.component';
import { CustomerAssistantComponent } from '../customer-assistant/customer-assistant.component';
import { CustomerAdvisorComponent } from '../customer-advisor/customer-advisor.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, DatePipe, LanguageSelectorComponent, HelpBotComponent, CustomerAssistantComponent, CustomerAdvisorComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiClient = inject(ApiClientService);
  private router = inject(Router);
  readonly currencyService = inject(CurrencyService);

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
    customerCategory: 'GENERAL',
    accountHolderRoles: ['OWNER'] as string[],
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
    nominees: [] as Array<{name: string, relation: string}>,
    defaultCurrency: 'INR',
    profilePicture: ''
  };

  supportedCurrencies = this.currencyService.getSupportedCurrencies();
  
  // Masking states
  showAccountNumber = false;
  showIfscCode = false;
  showPanNumber = false;

  // Notifications
  showNotificationsPanel = signal(false);
  notifications = signal<any[]>([
    {
      id: 1,
      type: 'accrual',
      title: 'Interest Accrued',
      message: '₹1,250 interest has been accrued to your FD account BR0010001235',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'status',
      title: 'Application Approved',
      message: 'Your FD application BR0010001236 has been approved',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      type: 'maturity',
      title: 'Maturity Reminder',
      message: 'Your FD BR0010001234 will mature in 30 days',
      time: '3 days ago',
      read: true
    }
  ]);

  ngOnInit(): void {
    // Reload token from localStorage to ensure it's available
    this.apiClient.loadToken();
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
      console.log('Raw applications from API:', applications);
      console.log('Sample application structure:', applications?.[0]);
      // Filter out only rejected applications - show all others including closed/matured
      const activeApps = (applications || []).filter(app => {
        console.log(`Checking app ${app.fdAccountNo}: status=${app.status}, approvalStatus=${app.approvalStatus}`);
        return app.approvalStatus !== 'REJECTED' &&
               app.status !== 'REJECTED' &&
               app.approvalStatus !== 'WITHDRAWN' &&
               app.status !== 'WITHDRAWN';
      });
      // Sort: ACTIVE and PENDING first, then closed/matured at the bottom
      const sortedApps = activeApps.sort((a, b) => {
        const aActive = a.status === 'ACTIVE' || a.status === 'PENDING';
        const bActive = b.status === 'ACTIVE' || b.status === 'PENDING';
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return 0;
      });
      console.log('Filtered and sorted apps:', sortedApps);
      // Pending requests already have a dedicated Applications tab. Keep them out of
      // Contracts so an unapproved FD is not shown as an extra contract.
      this.fdAccounts.set(sortedApps.filter(app =>
        app.status !== 'PENDING' && app.approvalStatus !== 'PENDING_APPROVAL'
      ));
      // Applications tab should only show PENDING applications
      const pendingApps = activeApps.filter(app =>
        app.status === 'PENDING' || app.approvalStatus === 'PENDING_APPROVAL'
      );
      console.log('Pending applications:', pendingApps);
      this.activeApplications.set(pendingApps);

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
    localStorage.setItem(this.apiClient.getUserStorageKey('quick_purchase_package'), JSON.stringify(pkg));
    this.router.navigate(['/apply-fd']);
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // Nominee management methods
  addNominee(): void {
    this.settingsData.nominees.push({ name: '', relation: '' });
  }

  removeNominee(index: number): void {
    if (this.settingsData.nominees.length > 0) {
      this.settingsData.nominees.splice(index, 1);
    }
  }

  // Profile picture methods
  onProfilePictureUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.settingsData.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerProfilePictureUpload(): void {
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  removeProfilePicture(): void {
    this.settingsData.profilePicture = '';
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
      customerCategory: this.settingsData.customerCategory,
      accountHolderRoles: this.settingsData.accountHolderRoles,
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
      nominees: this.settingsData.nominees,
      defaultCurrency: this.settingsData.defaultCurrency,
      profilePicture: this.settingsData.profilePicture
    };
    localStorage.setItem(this.apiClient.getUserStorageKey('default_fd_details'), JSON.stringify(defaultDetails));
    this.apiClient.updateCustomerCategory(this.settingsData.customerCategory).subscribe({
      error: error => console.warn('Could not sync customer category to the FD profile:', error)
    });
    alert('Settings saved successfully!');
  }

  toggleDefaultHolderRole(role: string, checked: boolean): void {
    if (role === 'OWNER') return;
    const roles = new Set(this.settingsData.accountHolderRoles || ['OWNER']);
    checked ? roles.add(role) : roles.delete(role);
    this.settingsData.accountHolderRoles = ['OWNER', ...Array.from(roles).filter(value => value !== 'OWNER')];
  }

  hasDefaultHolderRole(role: string): boolean {
    return (this.settingsData.accountHolderRoles || ['OWNER']).includes(role);
  }

  loadSettings(): void {
    // Discard the old shared record; it cannot safely be attributed to a user.
    localStorage.removeItem('default_fd_details');
    const saved = localStorage.getItem(this.apiClient.getUserStorageKey('default_fd_details'));
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
          customerCategory: details.customerCategory || 'GENERAL',
          accountHolderRoles: details.accountHolderRoles || ['OWNER'],
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
          nominees: details.nominees || [],
          defaultCurrency: details.defaultCurrency || 'INR',
          profilePicture: details.profilePicture || ''
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
    return this.currencyService.formatCurrency(converted, this.preferredCurrency());
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

  viewCharges(account: any): void {
    console.log('viewCharges called with:', account);
    this.apiClient.getWithdrawalInquiry(account.fdAccountNo).subscribe({
      next: (inquiry) => {
        console.log('Withdrawal inquiry for charges:', inquiry);
        const message = `Premature Closure Charges for FD Account ${account.fdAccountNo}:\n\n` +
          `Principal Amount: ${this.formatCurrency(inquiry.originalPrincipal)}\n` +
          `Interest Accrued to Date: ${this.formatCurrency(inquiry.interestAccruedToDate)}\n` +
          `Penalty Charges: ${this.formatCurrency(inquiry.penaltyAmount)}\n` +
          `Final Payout Amount: ${this.formatCurrency(inquiry.finalPayoutAmount)}\n\n` +
          `Note: These charges are calculated based on current date and product terms.`;
        alert(message);
      },
      error: (error) => {
        console.error('Failed to get withdrawal inquiry:', error);
        alert(`Failed to fetch charges: ${error.error?.message || error.message || 'Unknown error'}`);
      }
    });
  }

  // Store withdrawal inquiry data for display
  withdrawalInquiryData = signal<any>(null);
  selectedAccountForClosure = signal<any>(null);

  prematureClose(account: any): void {
    console.log('prematureClose called with:', account);
    this.selectedAccountForClosure.set(account);
    this.withdrawalInquiryData.set(null);

    // First get the inquiry to show charges before confirming
    this.apiClient.getWithdrawalInquiry(account.fdAccountNo).subscribe({
      next: (inquiry) => {
        console.log('Withdrawal inquiry:', inquiry);
        this.withdrawalInquiryData.set(inquiry);
        const message = `Premature Closure Details for FD Account ${account.fdAccountNo}:\n\n` +
          `Principal: ${this.formatCurrency(inquiry.originalPrincipal)}\n` +
          `Interest Accrued: ${this.formatCurrency(inquiry.interestAccruedToDate)}\n` +
          `Penalty Charges: ${this.formatCurrency(inquiry.penaltyAmount)}\n` +
          `Final Payout: ${this.formatCurrency(inquiry.finalPayoutAmount)}\n\n` +
          `Are you sure you want to proceed with premature closure?`;

        if (confirm(message)) {
          this.confirmWithdrawal(account);
        } else {
          console.log('User cancelled premature close');
          this.withdrawalInquiryData.set(null);
          this.selectedAccountForClosure.set(null);
        }
      },
      error: (error) => {
        console.error('Failed to get withdrawal inquiry:', error);
        // Fallback to simple confirmation if inquiry fails
        if (confirm(`Are you sure you want to prematurely close FD Account ${account.fdAccountNo}?\n\nNote: Premature withdrawal may attract penalties.\n\nError: ${error.error?.message || error.message || 'Could not fetch charges'}`)) {
          this.confirmWithdrawal(account);
        } else {
          console.log('User cancelled premature close');
        }
      }
    });
  }

  confirmWithdrawal(account: any): void {
    console.log('User confirmed, calling withdrawFD API for:', account.fdAccountNo);
    this.apiClient.withdrawFD(account.fdAccountNo, 'Premature closure requested by customer').subscribe({
      next: (response) => {
        console.log('Withdrawal successful, response:', response);
        // Use inquiry data if available, otherwise calculate from response
        let payout = this.withdrawalInquiryData()?.finalPayoutAmount;
        if (!payout || isNaN(payout)) {
          // Fallback: calculate from principal + accrued interest
          const principal = parseFloat(account.principalAmount) || 0;
          const accrued = parseFloat(account.accruedInterest) || 0;
          payout = principal + accrued;
        }
        alert(`FD Account ${account.fdAccountNo} has been successfully closed.\n\nFinal Payout: ${this.formatCurrency(payout)}`);
        // Reload the dashboard data to reflect the closure
        this.loadDashboardData();
        this.withdrawalInquiryData.set(null);
        this.selectedAccountForClosure.set(null);
      },
      error: (error) => {
        console.error('Premature closure error:', error);
        alert(`Failed to close FD Account: ${error.error?.message || error.message || 'Unknown error'}`);
        this.withdrawalInquiryData.set(null);
        this.selectedAccountForClosure.set(null);
      }
    });
  }

  withdrawApplication(app: any): void {
    if (confirm(`Are you sure you want to withdraw application ${app.fdAccountNo}?`)) {
      this.apiClient.withdrawApplication(app.fdAccountNo).subscribe({
        next: () => {
          alert('Application withdrawn successfully.');
          // Reload dashboard data to reflect the withdrawal
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Failed to withdraw application:', error);
          alert(`Failed to withdraw application: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      });
    }
  }

  // Portfolio summary calculations
  get totalInvestment(): number {
    return this.fdAccounts().reduce((sum, acc) => sum + (parseFloat(acc.principalAmount) || 0), 0);
  }

  get totalInterestEarned(): number {
    console.log('Calculating total interest earned for accounts:', this.fdAccounts());
    return this.fdAccounts().reduce((sum, acc) => {
      const principal = parseFloat(acc.principalAmount) || 0;
      // Try multiple possible field names for accrued interest
      const accrued = parseFloat(acc.accruedInterest) || parseFloat(acc.accrued_interest) || 0;
      console.log(`Account ${acc.fdAccountNo}: principal=${principal}, accrued=${accrued}, accruedInterest field=${acc.accruedInterest}, accrued_interest field=${acc.accrued_interest}, maturityAmount=${acc.maturityAmount}`);
      if (accrued > 0) {
        return sum + accrued;
      }
      const maturity = parseFloat(acc.maturityAmount) || principal;
      return sum + (maturity - principal);
    }, 0);
  }

  get totalOpportunityCost(): number {
    // Opportunity cost = Expected interest at maturity - (Accrued interest - Penalty)
    // This represents the lost interest if all contracts were prematurely closed now
    return this.fdAccounts().reduce((sum, acc) => {
      const principal = parseFloat(acc.principalAmount) || 0;
      const maturity = parseFloat(acc.maturityAmount) || principal;
      const accrued = parseFloat(acc.accruedInterest) || parseFloat(acc.accrued_interest) || 0;
      const rate = parseFloat(acc.interestRate) || 0;

      // Expected interest at maturity
      const expectedInterest = maturity - principal;

      // Penalty if closed now (1% of accrued interest)
      const penalty = accrued * 0.01;

      // Net interest if closed now
      const netInterestIfClosed = accrued - penalty;

      // Opportunity cost = expected - net if closed
      const opportunityCost = expectedInterest - netInterestIfClosed;

      return sum + (opportunityCost > 0 ? opportunityCost : 0);
    }, 0);
  }

  get activeContractsCount(): number {
    return this.fdAccounts().filter(acc => acc.status === 'ACTIVE').length;
  }

  // Get sorted contracts: ACTIVE first, PENDING second, MATURED last
  get sortedContracts(): any[] {
    return [...this.fdAccounts()].sort((a, b) => {
      const statusOrder: { [key: string]: number } = { 'ACTIVE': 0, 'PENDING': 1, 'MATURED': 2 };
      const orderA = statusOrder[a.status as string] ?? 99;
      const orderB = statusOrder[b.status as string] ?? 99;
      return orderA - orderB;
    });
  }

  // Calculate remaining months until maturity using business date if available
  getRemainingMonths(account: any): number {
    if (!account.maturityDate) return 0;
    const maturityDate = new Date(account.maturityDate);
    // Use business date from clock if available, otherwise use real date
    const businessDate = this.clockStatus()?.businessDate;
    const today = businessDate ? new Date(businessDate) : new Date();
    const diffTime = maturityDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const remainingMonths = Math.ceil(diffDays / 30);
    return remainingMonths > 0 ? remainingMonths : 0;
  }

  // Get premature closure charges for an account
  getAccountCharges(account: any): string {
    // Estimate charges based on accrued interest (typically 1% penalty)
    const accrued = parseFloat(account.accruedInterest) || 0;
    if (accrued === 0) return '₹0.00';
    // Standard penalty is 1% of accrued interest
    const penalty = accrued * 0.01;
    return this.formatCurrency(penalty);
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
          // Reload dashboard data to see updated FD states
          this.loadDashboardData().then(() => {
            console.log('Dashboard data reloaded after time advance');
            console.log('Updated FD accounts:', this.fdAccounts());
            console.log('Total interest earned:', this.totalInterestEarned);
            alert('Time advanced by 1 month successfully!');
            this.isAdvancingTime.set(false);
          });
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

  // Calculate returns for a specific FD account using product-specific parameters
  calculateReturnsForAccount(account: any): void {
    console.log('Calculating returns for account:', account);

    // Find the product associated with this FD account
    const product = this.products().find(p => p.productCode === account.productCode);
    console.log('Product for account:', product);

    if (!product) {
      alert(`Product ${account.productCode} not found. Cannot calculate returns.`);
      return;
    }

    // Use product-specific parameters
    const principal = parseFloat(account.principalAmount) || 0;
    const interestRate = parseFloat(account.interestRate) || product.rateLimit?.max || 7.0;
    const tenureMonths = account.tenureMonths || product.termLimit?.min || 12;

    // Calculate maturity amount using compound interest formula
    const ratePerPeriod = interestRate / 100 / 12; // Monthly rate
    const maturityAmount = principal * Math.pow(1 + ratePerPeriod, tenureMonths);
    const interestEarned = maturityAmount - principal;

    // Get product limits for validation
    const minDeposit = product.minDeposit || 5000;
    const maxDeposit = product.maxDeposit || 10000000;
    const minTerm = product.termLimit?.min || 3;
    const maxTerm = product.termLimit?.max || 120;
    const minRate = product.rateLimit?.min || 5.5;
    const maxRate = product.rateLimit?.max || 7.5;

    const message = `Returns Calculation for FD Account: ${account.fdAccountNo}\n\n` +
      `Product: ${product.productName} (${product.productCode})\n\n` +
      `Investment Details:\n` +
      `- Principal Amount: ${this.formatCurrency(principal)}\n` +
      `- Interest Rate: ${interestRate}% (Product range: ${minRate}% - ${maxRate}%)\n` +
      `- Tenure: ${tenureMonths} months (Product range: ${minTerm} - ${maxTerm} months)\n` +
      `- Deposit Range: ${this.formatCurrency(minDeposit)} - ${this.formatCurrency(maxDeposit)}\n\n` +
      `Returns:\n` +
      `- Maturity Amount: ${this.formatCurrency(maturityAmount)}\n` +
      `- Interest Earned: ${this.formatCurrency(interestEarned)}\n` +
      `- Effective Yield: ${((interestEarned / principal) * 100).toFixed(2)}%\n\n` +
      `Note: Calculations based on product-specific parameters and compound interest.`;

    alert(message);
  }

  // Navigate to calculator with product-specific data pre-filled
  calculateReturnsForProduct(product: any): void {
    console.log('Calculating returns for product:', product);

    // Store product data in localStorage for the calculator to use
    const calculatorData = {
      productCode: product.productCode,
      productName: product.productName,
      principal: product.minDeposit || 100000,
      termMonths: product.termLimit?.min || 12,
      interestRate: product.rateLimit?.max || 7.0,
      interestType: 'COMPOUND',
      minDeposit: product.minDeposit || 5000,
      maxDeposit: product.maxDeposit || 10000000,
      minTerm: product.termLimit?.min || 3,
      maxTerm: product.termLimit?.max || 120,
      minRate: product.rateLimit?.min || 5.5,
      maxRate: product.rateLimit?.max || 7.5
    };

    localStorage.setItem('calculator_product_data', JSON.stringify(calculatorData));

    // Navigate to calculator page
    this.router.navigate(['/calculator']);
  }

  // Notification methods
  toggleNotifications(): void {
    this.showNotificationsPanel.set(!this.showNotificationsPanel());
  }

  showNotifications(): boolean {
    return this.showNotificationsPanel();
  }

  unreadNotificationsCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  markAllAsRead(): void {
    this.notifications.update(notifs =>
      notifs.map(n => ({ ...n, read: true }))
    );
  }

  // Currency methods
  refreshCurrencyRates(): void {
    // The CurrencyService auto-refreshes, but this can trigger a manual refresh
    // by creating a new instance or calling a public method if we add one
    window.location.reload();
  }
}
