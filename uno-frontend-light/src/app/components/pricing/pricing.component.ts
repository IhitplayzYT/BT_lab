import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  private apiClient = inject(ApiClientService);
  private router = inject(Router);
  
  isAnnual = signal(true);
  products = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiClient.getActiveProducts('FD').subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error.set('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  selectProduct(productCode: string): void {
    this.router.navigate(['/apply-fd'], { queryParams: { productCode } });
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString();
  }

  formatRate(value: number): string {
    return value.toFixed(2) + '%';
  }

  getRateRange(product: any): string {
    if (product.rateLimit) {
      return `${this.formatRate(product.rateLimit.min)} - ${this.formatRate(product.rateLimit.max)}`;
    }
    return 'N/A';
  }

  getTermRange(product: any): string {
    if (product.termLimit) {
      return `${product.termLimit.min} - ${product.termLimit.max} months`;
    }
    return 'N/A';
  }
}
