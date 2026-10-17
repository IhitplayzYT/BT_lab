import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  private apiClient = inject(ApiClientService);
  private authService = inject(AuthService);

  products = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showCreateForm = signal(false);
  showEditForm = signal(false);
  editingProduct = signal<any>(null);

  // Form data
  productForm = {
    productCode: '',
    productName: '',
    productType: 'FD',
    currency: 'INR',
    effectiveDate: '',
    endDate: '',
    minTerm: 3,
    maxTerm: 36,
    minRate: 5.5,
    maxRate: 7.5,
    minDeposit: 5000,
    maxDeposit: 10000000,
    minAge: 18,
    interestType: 'COMPOUND',
    compoundingFrequency: 'QUARTERLY',
    status: 'ACTIVE'
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  canManageProducts(): boolean {
    return this.authService.isAdmin() || this.authService.isBankOfficer();
  }

  canCreateProduct(): boolean {
    return this.authService.isAdmin();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiClient.searchProducts('FD', undefined, undefined, undefined, 0, 50, 'productId').subscribe({
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

  showCreate(): void {
    this.resetForm();
    this.showCreateForm.set(true);
    this.showEditForm.set(false);
  }

  showEdit(product: any): void {
    this.editingProduct.set(product);
    this.productForm = {
      productCode: product.productCode,
      productName: product.productName,
      productType: product.productType,
      currency: product.currency,
      effectiveDate: product.effectiveDate || '',
      endDate: product.endDate || '',
      minTerm: product.termLimit?.min || 3,
      maxTerm: product.termLimit?.max || 36,
      minRate: product.rateLimit?.min || 5.5,
      maxRate: product.rateLimit?.max || 7.5,
      minDeposit: product.minDeposit || 5000,
      maxDeposit: product.maxDeposit || 10000000,
      minAge: product.minAge || 18,
      interestType: product.interestType || 'COMPOUND',
      compoundingFrequency: product.charges?.interestCreditFrequency || 'QUARTERLY',
      status: product.status || 'ACTIVE'
    };
    this.showEditForm.set(true);
    this.showCreateForm.set(false);
  }

  hideForms(): void {
    this.showCreateForm.set(false);
    this.showEditForm.set(false);
    this.editingProduct.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.productForm = {
      productCode: '',
      productName: '',
      productType: 'FD',
      currency: 'INR',
      effectiveDate: '',
      endDate: '',
      minTerm: 3,
      maxTerm: 36,
      minRate: 5.5,
      maxRate: 7.5,
      minDeposit: 5000,
      maxDeposit: 10000000,
      minAge: 18,
      interestType: 'COMPOUND',
      compoundingFrequency: 'QUARTERLY',
      status: 'ACTIVE'
    };
  }

  createProduct(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const productData = {
      productCode: this.productForm.productCode,
      productName: this.productForm.productName,
      productType: this.productForm.productType,
      currency: this.productForm.currency,
      effectiveDate: this.productForm.effectiveDate || new Date().toISOString().split('T')[0],
      endDate: this.productForm.endDate || null,
      termLimit: {
        min: this.productForm.minTerm,
        max: this.productForm.maxTerm
      },
      rateLimit: {
        min: this.productForm.minRate,
        max: this.productForm.maxRate
      },
      minDeposit: this.productForm.minDeposit,
      maxDeposit: this.productForm.maxDeposit,
      minAge: this.productForm.minAge,
      interestType: this.productForm.interestType,
      charges: {
        interestCreditFrequency: this.productForm.compoundingFrequency,
        taxDeduction: true,
        withdrawalFees: 1.0
      },
      allowedRoles: ['OWNER', 'CO-OWNER', 'NOMINEE'],
      rateVariations: [
        { customerCategory: 'SENIOR_CITIZEN', rateModifier: 1.0 },
        { customerCategory: 'EMPLOYEE', rateModifier: 0.5 }
      ],
      status: this.productForm.status
    };

    this.apiClient.createProduct(productData).subscribe({
      next: () => {
        this.loadProducts();
        this.hideForms();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.error.set(err.error?.message || 'Failed to create product');
        this.isLoading.set(false);
      }
    });
  }

  updateProduct(): void {
    if (!this.editingProduct()) return;
    
    this.isLoading.set(true);
    this.error.set(null);

    const productData = {
      productName: this.productForm.productName,
      productType: this.productForm.productType,
      currency: this.productForm.currency,
      effectiveDate: this.productForm.effectiveDate || new Date().toISOString().split('T')[0],
      endDate: this.productForm.endDate || null,
      termLimit: {
        min: this.productForm.minTerm,
        max: this.productForm.maxTerm
      },
      rateLimit: {
        min: this.productForm.minRate,
        max: this.productForm.maxRate
      },
      minDeposit: this.productForm.minDeposit,
      maxDeposit: this.productForm.maxDeposit,
      minAge: this.productForm.minAge,
      interestType: this.productForm.interestType,
      charges: {
        interestCreditFrequency: this.productForm.compoundingFrequency,
        taxDeduction: true,
        withdrawalFees: 1.0
      },
      allowedRoles: ['OWNER', 'CO-OWNER', 'NOMINEE'],
      rateVariations: [
        { customerCategory: 'SENIOR_CITIZEN', rateModifier: 1.0 },
        { customerCategory: 'EMPLOYEE', rateModifier: 0.5 }
      ],
      status: this.productForm.status
    };

    this.apiClient.updateProduct(this.editingProduct().productCode, productData).subscribe({
      next: () => {
        this.loadProducts();
        this.hideForms();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.error.set(err.error?.message || 'Failed to update product');
        this.isLoading.set(false);
      }
    });
  }

  retireProduct(productCode: string): void {
    if (!confirm('Are you sure you want to retire this product?')) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.apiClient.retireProduct(productCode).subscribe({
      next: () => {
        this.loadProducts();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error retiring product:', err);
        this.error.set(err.error?.message || 'Failed to retire product');
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'DRAFT': return 'status-draft';
      case 'SUSPENDED': return 'status-suspended';
      case 'RETIRED': return 'status-retired';
      default: return 'status-unknown';
    }
  }
}
