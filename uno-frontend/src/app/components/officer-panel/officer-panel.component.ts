import { Component, inject, AfterViewInit, ElementRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductManagementComponent } from '../product-management/product-management.component';
import { ApiClientService } from '../../services/api-client.service';

@Component({
  selector: 'app-officer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductManagementComponent],
  templateUrl: './officer-panel.component.html',
  styleUrls: ['./officer-panel.component.scss']
})
export class OfficerPanelComponent implements AfterViewInit, OnInit {
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

  private _activeTab = 'applications';

  pendingApplications: any[] = [];
  selectedApplication: any = null;
  rejectionReason = '';

  pendingBundles: any[] = [];
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

  ngOnInit(): void {
    this.loadPendingApplications();
    this.loadPendingBundles();
    this.loadClockStatus();
  }

  async loadPendingApplications(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await this.apiClient.getPendingApplications().toPromise();
      // Transform data to match expected format
      this.pendingApplications = (data || []).map((app: any) => ({
        id: app.fdAccountNo,
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
    }
  }

  async loadPendingBundles(): Promise<void> {
    try {
      const data = await this.apiClient.getPendingBundles().toPromise();
      // Transform data to match expected format
      this.pendingBundles = (data || []).map((bundle: any) => ({
        id: bundle.bundleId,
        customer: bundle.customerDetails?.fullName || bundle.customerId || 'Unknown',
        name: bundle.bundleName || 'Package',
        description: bundle.bundleDescription || '',
        totalAmount: bundle.totalAmount || 0,
        estimatedReturn: bundle.estimatedReturn || 0,
        status: bundle.approvalStatus || 'PENDING',
        date: bundle.createdAt ? new Date(bundle.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fdCount: bundle.fdItems ? bundle.fdItems.length : 0,
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
      // Keep empty array as fallback
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
  downloadMaturityReportPdf(): void {
    this.apiClient.downloadMaturitySummary(30, 'pdf').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'maturity-summary-30d.pdf');
    });
  }

  downloadPortfolioExcel(): void {
    this.apiClient.downloadCustomerPortfolio(undefined, 'xlsx').subscribe(blob => {
      this.apiClient.downloadFile(blob, 'portfolio.xlsx');
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
}
