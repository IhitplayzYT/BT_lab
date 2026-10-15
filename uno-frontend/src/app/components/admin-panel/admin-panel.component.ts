import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);

  analytics = {
    totalFDs: 1250,
    totalDeposits: 450000000,
    pendingApprovals: 15,
    activeFDs: 1100,
    maturedFDs: 135,
    rejectedFDs: 15,
    averageTenure: 24,
    totalInterestEarned: 28000000
  };

  recentApplications = [
    { id: 'FD001234', customer: 'Rajesh Kumar', amount: 500000, status: 'PENDING', date: '2025-01-15' },
    { id: 'FD001235', customer: 'Priya Sharma', amount: 750000, status: 'PENDING', date: '2025-01-15' },
    { id: 'FD001236', customer: 'Amit Verma', amount: 1000000, status: 'PENDING', date: '2025-01-14' },
    { id: 'FD001237', customer: 'Ananya Patel', amount: 300000, status: 'APPROVED', date: '2025-01-14' },
    { id: 'FD001238', customer: 'Vikram Singh', amount: 600000, status: 'REJECTED', date: '2025-01-13' }
  ];

  productWiseDistribution = [
    { product: 'Standard FD', count: 600, percentage: 48 },
    { product: 'Senior Citizen FD', count: 350, percentage: 28 },
    { product: 'Tax Saver FD', count: 200, percentage: 16 },
    { product: 'Flexible FD', count: 100, percentage: 8 }
  ];

  ngAfterViewInit(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.analytics-card');
    // Simple CSS animation fallback
    cards.forEach((card: Element, index: number) => {
      setTimeout(() => {
        (card as HTMLElement).style.opacity = '1';
        (card as HTMLElement).style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  formatCurrency(value: number): string {
    return '₹' + (value / 10000000).toFixed(2) + ' Cr';
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }
}
