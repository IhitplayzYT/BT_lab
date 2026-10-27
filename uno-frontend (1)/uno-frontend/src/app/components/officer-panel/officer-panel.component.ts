import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, ElementRef, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductManagementComponent } from '../product-management/product-management.component';
import { ApiClientService } from '../../services/api-client.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { RelationNetsComponent } from '../relation-nets/relation-nets.component';
import { ApplyFdComponent } from '../apply-fd/apply-fd.component';

@Component({
  selector: 'app-officer-panel',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, ProductManagementComponent, LanguageSelectorComponent, RelationNetsComponent, ApplyFdComponent],
  templateUrl: './officer-panel.component.html',
  styleUrls: ['./officer-panel.component.scss']
})
export class OfficerPanelComponent implements AfterViewInit, OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private apiClient = inject(ApiClientService);
  private cdr = inject(ChangeDetectorRef);

  showProductManagement = false;
  customerLookupId = '';
  customerLookupLoading = false;
  customerLookupError = '';
  selectedApplicationCustomer: any = null;
  staffUsers: any[] = [];
  staffUsersLoading = false;
  staffUsersError = '';
  staffUserSearch = '';

  set activeTab(value: string) {
    this._activeTab = value;
    if (value === 'journal') void this.loadJournal();
    if (value === 'ledger') {
      if (this.selectedLedgerAccount) void this.loadAccountLedger(this.selectedLedgerAccount.fdAccountNo);
      else void this.refreshVisibleLedgerAccounts();
    }
    setTimeout(() => this.animateCards(), 50);
  }

  get activeTab(): string {
    return this._activeTab;
  }

  private _activeTab = 'applications';

  pendingApplications: any[] = [];
  selectedApplication: any = null;
  rejectionReason = '';

  pendingBundles: any[] = [];
  pendingBundlesError = '';
  selectedBundle: any = null;
  bundleRejectionReason = '';

  analytics = {
    pendingFDs: 0,
    pendingBundles: 0,
    todayApproved: 0,
    todayRejected: 0,
    totalPendingAmount: 0,
    avgPendingAmount: 0
  };

  isLoading = true;
  error = '';
  dataLoaded = false;

  // Dark mode
  isDarkMode = false;

  // Search and filter for applications
  appSearchQuery = '';
  appSortField = 'date';
  appSortOrder = 'desc';
  appFilterProduct = '';
  appFilterMinAmount: number | null = null;
  appFilterMaxAmount: number | null = null;

  // Search and filter for bundles
  bundleSearchQuery = '';
  bundleSortField = 'date';
  bundleSortOrder = 'desc';
  bundleFilterMinAmount: number | null = null;
  bundleFilterMaxAmount: number | null = null;

  // Time progression
  clockStatus = signal<any>(null);
  isAdvancingTime = signal(false);

  // Journal data
  journalTransactions: any[] = [];
  journalSummary: any = {
    totalTransactions: 0,
    totalDeposits: 0,
    totalInterest: 0,
    totalInterestAccruals: 0,
    totalMaturityPayouts: 0,
    totalPrematureWithdrawals: 0
  };
  journalFilterType = '';
  journalPage = 0;
  journalPageSize = 100;
  journalLoading = false;
  journalError = '';

  // Ledger data
  ledgerAccounts: any[] = [];
  ledgerAccountsLoading = false;
  ledgerAccountsError = '';
  selectedLedgerAccount: any = null;
  ledgerTransactions: any[] = [];
  ledgerSearchName = '';
  ledgerSearchId = '';
  ledgerPage = 0;
  ledgerPageSize = 50;
  ledgerHistoryLoading = false;
  ledgerHistoryError = '';
  private accountingRefreshHandle?: ReturnType<typeof setInterval>;
  private ledgerHistoryRequestId = 0;

  ngOnInit(): void {
    // Reload token from localStorage to ensure it's available
    this.apiClient.loadToken();
    this.loadThemePreference();
    this.loadPendingApplications();
    this.loadPendingBundles();
    this.loadStaffUsers();
    this.loadClockStatus();
    this.accountingRefreshHandle = setInterval(() => {
      if (document.hidden) return;
      if (this.activeTab === 'journal') void this.loadJournal();
      if (this.activeTab === 'ledger' && !this.ledgerHistoryLoading) {
        if (this.selectedLedgerAccount) void this.loadAccountLedger(this.selectedLedgerAccount.fdAccountNo);
        else if (!this.ledgerAccountsLoading) void this.refreshVisibleLedgerAccounts();
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.accountingRefreshHandle) clearInterval(this.accountingRefreshHandle);
  }

  goToPendingFds(): void {
    this.activeTab = 'fds';
    setTimeout(() => this.elementRef.nativeElement.querySelector('.pending-fd-approvals')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  goToPendingBundles(): void {
    this.activeTab = 'bundles';
    setTimeout(() => this.elementRef.nativeElement.querySelector('.bundles-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  async findCustomerForApplication(): Promise<void> {
    const customerId = this.customerLookupId.trim();
    if (!customerId || this.customerLookupLoading) {
      this.customerLookupError = 'Enter a user ID to continue';
      return;
    }
    const user = this.staffUsers.find(item => String(item.id) === customerId);
    if (user) this.selectUserForApplication(user);
    else this.customerLookupError = 'User not found. Search the user directory and try again.';
  }

  async loadStaffUsers(): Promise<void> {
    this.staffUsersLoading = true;
    this.staffUsersError = '';
    try {
      this.apiClient.loadToken();
      const response = await this.apiClient.getStaffUsers().toPromise();
      this.staffUsers = (response?.users || []).map((user: any) => ({
        ...user,
        roles: Array.isArray(user.roles) ? user.roles : String(user.roles || '').split(',').filter(Boolean)
      }));
    } catch (error: any) {
      this.staffUsersError = error?.error?.message || 'Could not load the user directory.';
    } finally {
      this.staffUsersLoading = false;
    }
  }

  get filteredStaffUsers(): any[] {
    const query = this.staffUserSearch.trim().toLowerCase();
    const users = query ? this.staffUsers.filter(user =>
      String(user.id).includes(query) || user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) || user.roles.some((role: string) => role.toLowerCase().includes(query))
    ) : [...this.staffUsers];
    return users.sort((a, b) => Number(a.id) - Number(b.id));
  }

  selectUserForApplication(user: any): void {
    if (!user.enabled) {
      this.customerLookupError = 'Applications cannot be created for disabled users.';
      return;
    }
    this.selectedApplicationCustomer = { ...user, customerId: String(user.id), fullName: user.username };
    this.customerLookupId = String(user.id);
    this.customerLookupError = '';
    this.activeTab = 'create-fd';
  }

  onOfficerApplicationSubmitted(): void {
    void this.loadPendingApplications();
  }

  async loadPendingApplications(): Promise<void> {
    try {
      this.isLoading = true;
      // Ensure token is loaded before making requests
      this.apiClient.loadToken();
      const data = await this.apiClient.getPendingApplications().toPromise();
      // Transform data to match expected format
      this.pendingApplications = (data || []).map((app: any) => ({
        id: app.fdAccountNo,
        userId: app.userId,
        customer: app.applicantFullName || `${app.applicantFirstName} ${app.applicantLastName}` || 'Unknown',
        amount: parseFloat(app.principalAmount) || 0,
        tenure: app.tenureMonths || 0,
        product: app.productCode || 'Standard FD',
        date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        // Store full applicant details for review
        applicantDetails: {
          firstName: app.applicantFirstName,
          lastName: app.applicantLastName,
          age: app.applicantAge,
          gender: app.applicantGender,
          occupation: app.applicantOccupation,
          annualIncome: parseFloat(app.applicantAnnualIncome) || 0,
          email: app.applicantEmail,
          phone: app.applicantPhone,
          maritalStatus: app.applicantMaritalStatus,
          nationality: app.applicantNationality
        }
      }));

      // Update analytics
      this.analytics.pendingFDs = this.pendingApplications.length;
      this.analytics.totalPendingAmount = this.pendingApplications.reduce((sum: number, app: any) => sum + app.amount, 0);
      this.analytics.avgPendingAmount = this.pendingApplications.length > 0
        ? Math.round(this.analytics.totalPendingAmount / this.pendingApplications.length)
        : 0;
    } catch (error: any) {
      console.error('Error loading pending applications:', error);
      this.error = 'Failed to load applications';
    } finally {
      this.isLoading = false;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    }
  }

  async loadPendingBundles(): Promise<void> {
    try {
      this.pendingBundlesError = '';
      // Ensure token is available before request
      this.apiClient.loadToken();
      const data = await this.apiClient.getPendingBundles().toPromise();
      // Transform data to match expected format
      this.pendingBundles = (data || []).filter((bundle: any) => {
        const items = Array.isArray(bundle.fdItems) ? bundle.fdItems : [];
        return items.length > 0 && items.every((item: any) =>
          String(item.approvalStatus || item.status || '').toUpperCase() === 'PENDING_APPROVAL'
        );
      }).map((bundle: any) => ({
        id: bundle.bundleId,
        userId: bundle.userId,
        customer: bundle.customerDetails?.fullName || bundle.customerId || 'Unknown',
        name: bundle.bundleName || 'Package',
        description: bundle.bundleDescription || '',
        totalAmount: bundle.totalAmount || 0,
        estimatedReturn: bundle.estimatedReturn || 0,
        status: bundle.approvalStatus || 'PENDING',
        date: bundle.createdAt ? new Date(bundle.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fdItems: Array.isArray(bundle.fdItems) ? bundle.fdItems : [],
        fdCount: Array.isArray(bundle.fdItems) ? bundle.fdItems.length : 0,
        // Store customer details for review
        customerDetails: bundle.customerDetails ? {
          ...bundle.customerDetails,
          annualIncome: parseFloat(bundle.customerDetails.annualIncome) || 0
        } : null
      }));

      // Update analytics
      this.analytics.pendingBundles = this.pendingBundles.length;
    } catch (error: any) {
      console.error('Error loading pending bundles:', error);
      this.pendingBundlesError = error.error?.message || 'Failed to load pending bundles. Refresh and try again.';
      this.pendingBundles = [];
    }
  }

  ngAfterViewInit(): void {
    this.animateCards();
  }

  private animateCards(): void {
    setTimeout(() => {
      const cards = this.elementRef.nativeElement.querySelectorAll('.application-card, .analytics-card, .bundle-card');
      cards.forEach((card: Element, index: number) => {
        setTimeout(() => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 100);
  }

  selectApplication(app: any): void {
    this.selectedApplication = app;
    this.rejectionReason = '';
  }

  approveApplication(): void {
    if (!this.selectedApplication) return;
    // Call backend API to approve
    this.apiClient.approveOrRejectFD(this.selectedApplication.id, 'APPROVE').subscribe({
      next: (response) => {
        console.log('Approving application:', this.selectedApplication.id);
        alert(`Application ${this.selectedApplication.id} approved successfully!`);
        this.selectedApplication = null;
        this.loadPendingApplications(); // Refresh list
        this.loadPendingBundles(); // Remove bundles with newly completed members
      },
      error: (err) => {
        console.error('Error approving application:', err);
        alert('Failed to approve application');
      }
    });
  }

  rejectApplication(): void {
    if (!this.selectedApplication) return;
    if (!this.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    // Call backend API to reject
    this.apiClient.approveOrRejectFD(this.selectedApplication.id, 'REJECT', this.rejectionReason).subscribe({
      next: (response) => {
        console.log('Rejecting application:', this.selectedApplication.id, 'Reason:', this.rejectionReason);
        alert(`Application ${this.selectedApplication.id} rejected successfully!`);
        this.selectedApplication = null;
        this.rejectionReason = '';
        this.loadPendingApplications(); // Refresh list
        this.loadPendingBundles(); // Remove bundles with newly completed members
      },
      error: (err) => {
        console.error('Error rejecting application:', err);
        alert('Failed to reject application');
      }
    });
  }

  cancelSelection(): void {
    this.selectedApplication = null;
    this.rejectionReason = '';
  }

  selectBundle(bundle: any): void {
    this.selectedBundle = bundle;
    this.bundleRejectionReason = '';
  }

  approveBundle(): void {
    if (!this.selectedBundle) return;
    this.apiClient.approveOrRejectBundle(this.selectedBundle.id, 'APPROVE').subscribe({
      next: (response) => {
        console.log('Bundle approved:', this.selectedBundle.id);
        alert(`Bundle ${this.selectedBundle.name} approved successfully!`);
        this.selectedBundle = null;
        this.loadPendingBundles(); // Refresh list
      },
      error: (err) => {
        console.error('Error approving bundle:', err);
        alert('Failed to approve bundle');
      }
    });
  }

  rejectBundle(): void {
    if (!this.selectedBundle) return;
    if (!this.bundleRejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    this.apiClient.approveOrRejectBundle(this.selectedBundle.id, 'REJECT', this.bundleRejectionReason).subscribe({
      next: (response) => {
        console.log('Bundle rejected:', this.selectedBundle.id);
        alert(`Bundle ${this.selectedBundle.name} rejected successfully!`);
        this.selectedBundle = null;
        this.bundleRejectionReason = '';
        this.loadPendingBundles(); // Refresh list
      },
      error: (err) => {
        console.error('Error rejecting bundle:', err);
        alert('Failed to reject bundle');
      }
    });
  }

  cancelBundleSelection(): void {
    this.selectedBundle = null;
    this.bundleRejectionReason = '';
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString();
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

  downloadFdSummaryByStatus(status: string, format: string): void {
    this.apiClient.downloadFdSummary(status, format).subscribe(blob => {
      this.apiClient.downloadFile(blob, `fd-summary-${status.toLowerCase()}.${format}`);
      alert('Report downloaded successfully!');
    }, error => {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    });
  }

  downloadMaturityReportPdf(): void {
    this.apiClient.downloadMaturitySummary(30, 'pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'maturity-summary-30d.pdf');
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

  downloadPortfolioExcel(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'xlsx').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'all-portfolios.xlsx');
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

  generatePythonReport(): void {
    this.apiClient.generatePythonReport().subscribe(result => {
      console.log('Python report generated:', result);
      alert('Python report generated successfully!');
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

  // Get filtered and sorted applications
  get filteredApplications(): any[] {
    let filtered = [...this.pendingApplications];

    // Search filter
    if (this.appSearchQuery) {
      const query = this.appSearchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.customer.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query) ||
        app.product.toLowerCase().includes(query)
      );
    }

    // Product filter
    if (this.appFilterProduct) {
      filtered = filtered.filter(app => app.product === this.appFilterProduct);
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
        case 'tenure':
          comparison = a.tenure - b.tenure;
          break;
        default:
          comparison = 0;
      }
      return this.appSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Get filtered and sorted bundles
  get filteredBundles(): any[] {
    let filtered = [...this.pendingBundles];

    // Search filter
    if (this.bundleSearchQuery) {
      const query = this.bundleSearchQuery.toLowerCase();
      filtered = filtered.filter(bundle =>
        bundle.customer.toLowerCase().includes(query) ||
        bundle.id.toLowerCase().includes(query) ||
        bundle.name.toLowerCase().includes(query)
      );
    }

    // Amount range filter
    if (this.bundleFilterMinAmount !== null) {
      filtered = filtered.filter(bundle => bundle.totalAmount >= this.bundleFilterMinAmount!);
    }
    if (this.bundleFilterMaxAmount !== null) {
      filtered = filtered.filter(bundle => bundle.totalAmount <= this.bundleFilterMaxAmount!);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.bundleSortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'customer':
          comparison = a.customer.localeCompare(b.customer);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = 0;
      }
      return this.bundleSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Get unique products for filter dropdown
  get uniqueProducts(): string[] {
    const products = new Set(this.pendingApplications.map(app => app.product));
    return Array.from(products).sort();
  }

  // Reset application filters
  resetAppFilters(): void {
    this.appSearchQuery = '';
    this.appSortField = 'date';
    this.appSortOrder = 'desc';
    this.appFilterProduct = '';
    this.appFilterMinAmount = null;
    this.appFilterMaxAmount = null;
  }

  // Reset bundle filters
  resetBundleFilters(): void {
    this.bundleSearchQuery = '';
    this.bundleSortField = 'date';
    this.bundleSortOrder = 'desc';
    this.bundleFilterMinAmount = null;
    this.bundleFilterMaxAmount = null;
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
        this.loadPendingApplications();
        this.loadPendingBundles();
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

  // Journal methods
  async loadJournal(): Promise<void> {
    if (this.journalLoading) return;
    this.journalLoading = true;
    this.journalError = '';
    try {
      this.apiClient.loadToken();
      if (this.journalFilterType) {
        const data: any = await this.apiClient.getJournalByType(this.journalFilterType, this.journalPage, this.journalPageSize).toPromise();
        this.journalTransactions = Array.isArray(data) ? data : (data?.content || data?.transactions || []);
      } else {
        const data: any = await this.apiClient.getJournalAll(this.journalPage, this.journalPageSize).toPromise();
        this.journalTransactions = Array.isArray(data) ? data : (data?.content || data?.transactions || []);
      }
      await this.loadJournalSummary();
    } catch (error: any) {
      console.error('Error loading journal:', error);
      this.journalError = 'Could not load journal transactions. Please retry.';
    } finally {
      this.journalLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadJournalSummary(): Promise<void> {
    try {
      this.apiClient.loadToken();
      const data = await this.apiClient.getJournalSummary().toPromise();
      this.journalSummary = data || this.journalSummary;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error loading journal summary:', error);
      this.cdr.detectChanges();
    }
  }

  // Ledger methods
  async searchLedger(): Promise<void> {
    if (this.ledgerAccountsLoading) return;
    this.ledgerAccountsLoading = true;
    this.ledgerAccountsError = '';
    try {
      this.apiClient.loadToken();
      if (this.ledgerSearchName) {
        const data = await this.apiClient.searchLedgerByName(this.ledgerSearchName, this.ledgerPage, this.ledgerPageSize).toPromise();
        this.ledgerAccounts = data || [];
      } else if (this.ledgerSearchId) {
        const data = await this.apiClient.searchLedgerById(this.ledgerSearchId, this.ledgerPage, this.ledgerPageSize).toPromise();
        this.ledgerAccounts = data || [];
      } else {
        alert('Please enter a name or customer ID to search');
      }
    } catch (error: any) {
      console.error('Error searching ledger:', error);
      this.ledgerAccounts = [];
      this.ledgerAccountsError = 'Could not load FD ledgers. Please retry.';
    } finally {
      this.ledgerAccountsLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadAllLedgerAccounts(): Promise<void> {
    if (this.ledgerAccountsLoading) return;
    this.ledgerAccountsLoading = true;
    this.ledgerAccountsError = '';
    try {
      this.apiClient.loadToken();
      const data = await this.apiClient.getAllLedgerAccounts(this.ledgerPage, this.ledgerPageSize).toPromise();
      this.ledgerAccounts = data || [];
    } catch (error: any) {
      console.error('Error loading all ledger accounts:', error);
      this.ledgerAccounts = [];
      this.ledgerAccountsError = 'Could not load FD ledgers. Please retry.';
    } finally {
      this.ledgerAccountsLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async refreshVisibleLedgerAccounts(): Promise<void> {
    if (this.ledgerSearchName || this.ledgerSearchId) await this.searchLedger();
    else await this.loadAllLedgerAccounts();
  }

  async selectLedgerAccount(account: any): Promise<void> {
    this.selectedLedgerAccount = account;
    this.ledgerTransactions = [];
    this.ledgerHistoryError = '';
    const accountNo = account?.fdAccountNo || account?.fd_account_no || account?.accountNumber;
    if (!accountNo) {
      this.ledgerHistoryError = 'The selected account does not include an FD account number.';
      this.ledgerTransactions = [];
      this.ledgerHistoryLoading = false;
      return;
    }
    this.selectedLedgerAccount.fdAccountNo = accountNo;
    await this.loadAccountLedger(accountNo);
  }

  async loadAccountLedger(fdAccountNo: string): Promise<void> {
    if (!fdAccountNo) return;
    const requestId = ++this.ledgerHistoryRequestId;
    this.ledgerHistoryLoading = true;
    this.ledgerHistoryError = '';
    try {
      this.apiClient.loadToken();
      const response: any = await this.apiClient.getAccountLedger(fdAccountNo).toPromise();
      if (requestId === this.ledgerHistoryRequestId) {
        this.ledgerTransactions = Array.isArray(response) ? response : (response?.content || response?.transactions || []);
      }
    } catch (error: any) {
      console.error('Error loading account ledger:', error);
      if (requestId === this.ledgerHistoryRequestId) {
        this.ledgerHistoryError = 'Could not load transaction history for this FD account.';
      }
    } finally {
      if (requestId === this.ledgerHistoryRequestId) this.ledgerHistoryLoading = false;
      if (requestId === this.ledgerHistoryRequestId) this.cdr.detectChanges();
    }
  }

  closeLedgerDetail(): void {
    this.ledgerHistoryRequestId++;
    this.ledgerHistoryLoading = false;
    this.selectedLedgerAccount = null;
    this.ledgerTransactions = [];
  }

  // Date formatting helpers
  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }
}
