import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-officer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-panel.component.html',
  styleUrls: ['./officer-panel.component.scss']
})
export class OfficerPanelComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);

  pendingApplications = [
    { id: 'FD001234', customer: 'Rajesh Kumar', amount: 500000, tenure: 24, product: 'Standard FD', date: '2025-01-15' },
    { id: 'FD001235', customer: 'Priya Sharma', amount: 750000, tenure: 36, product: 'Senior Citizen FD', date: '2025-01-15' },
    { id: 'FD001236', customer: 'Amit Verma', amount: 1000000, tenure: 12, product: 'Tax Saver FD', date: '2025-01-14' },
    { id: 'FD001239', customer: 'Sneha Gupta', amount: 400000, tenure: 18, product: 'Flexible FD', date: '2025-01-16' },
    { id: 'FD001240', customer: 'Rahul Mehta', amount: 600000, tenure: 24, product: 'Standard FD', date: '2025-01-16' }
  ];

  selectedApplication: any = null;
  rejectionReason = '';

  ngAfterViewInit(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.application-card');
    // Simple CSS animation fallback
    cards.forEach((card: Element, index: number) => {
      setTimeout(() => {
        (card as HTMLElement).style.opacity = '1';
        (card as HTMLElement).style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  selectApplication(app: any): void {
    this.selectedApplication = app;
    this.rejectionReason = '';
  }

  approveApplication(): void {
    // Call backend API to approve
    console.log('Approving application:', this.selectedApplication.id);
    this.selectedApplication = null;
  }

  rejectApplication(): void {
    if (!this.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    // Call backend API to reject
    console.log('Rejecting application:', this.selectedApplication.id, 'Reason:', this.rejectionReason);
    this.selectedApplication = null;
  }

  cancelSelection(): void {
    this.selectedApplication = null;
    this.rejectionReason = '';
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString();
  }
}
