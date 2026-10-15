import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
  isAnnual = signal(true);

  plans = [
    {
      name: 'Starter',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Basic FD Calculator',
        'Up to 3 FD Accounts',
        'Email Support',
        'Basic Reports'
      ],
      popular: false
    },
    {
      name: 'Premium',
      monthlyPrice: 199,
      annualPrice: 1999,
      features: [
        'Advanced FD Calculator',
        'Unlimited FD Accounts',
        'Priority Support',
        'Detailed Analytics',
        'Tax Reports',
        'Investment Tips'
      ],
      popular: true
    },
    {
      name: 'Business',
      monthlyPrice: 499,
      annualPrice: 4999,
      features: [
        'All Premium Features',
        'Multi-user Access',
        'API Integration',
        'Custom Reports',
        'Dedicated Manager',
        'Bulk Operations'
      ],
      popular: false
    }
  ];

  getPrice(plan: any): number {
    return this.isAnnual() ? plan.annualPrice : plan.monthlyPrice;
  }

  getPeriod(): string {
    return this.isAnnual() ? '/year' : '/month';
  }
}
