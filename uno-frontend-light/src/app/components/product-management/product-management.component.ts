import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  private apiClient = inject(ApiClientService);
  private authService = inject(AuthService);

  products = signal<any[]>([]);
  searchQuery = '';
  typeFilter = 'ALL';
  durationMin: number | null = null;
  durationMax: number | null = null;
  sortBy = 'name-asc';
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
    taxRate: 10,
    processingFee: 0,
    processingFeeUnit: 'flat',
    serviceFeeRate: 0,
    serviceFeeFlat: 0,
    documentationFee: 0,
    gstRate: 18,
    prematurePenaltyRate: 1,
    allowedRoles: ['OWNER', 'CO-OWNER', 'NOMINEE'],
    rateVariations: [
      { customerCategory: 'SENIOR_CITIZEN', rateModifier: 1.0 },
      { customerCategory: 'EMPLOYEE', rateModifier: 0.5 },
      { customerCategory: 'STUDENT', rateModifier: 0.5 }
    ],
    status: 'ACTIVE'
  };

  // Validation errors
  formErrors: { [key: string]: string } = {};

  ngOnInit(): void {
    this.loadProducts();
  }

  canManageProducts(): boolean {
    return this.authService.isAdmin() || this.authService.isBankOfficer();
  }

  canCreateProduct(): boolean {
    return this.authService.isAdmin() || this.authService.isBankOfficer();
  }

  canDeleteProduct(): boolean {
    return this.authService.isAdmin();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiClient.searchProducts(undefined, undefined, undefined, undefined, 0, 200, 'productId').subscribe({
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

  get productTypes(): string[] {
    return [...new Set(this.products().map(product => String(product.productType || '').toUpperCase()).filter(Boolean))].sort();
  }

  get filteredProducts(): any[] {
    const query = this.searchQuery.trim().toLowerCase();
    let results = this.products().filter(product => {
      const matchesQuery = !query || [product.productName, product.productCode, product.productType, product.currency]
        .some(value => String(value || '').toLowerCase().includes(query));
      const matchesType = this.typeFilter === 'ALL' || String(product.productType || '').toUpperCase() === this.typeFilter;
      const minTerm = Number(product.termLimit?.min ?? 0);
      const maxTerm = Number(product.termLimit?.max ?? Number.POSITIVE_INFINITY);
      const matchesDuration = (this.durationMin === null || maxTerm >= this.durationMin) &&
        (this.durationMax === null || minTerm <= this.durationMax);
      return matchesQuery && matchesType && matchesDuration;
    });

    const [field, direction] = this.sortBy.split('-');
    const value = (product: any): string | number => {
      switch (field) {
        case 'type': return String(product.productType || '').toLowerCase();
        case 'duration': return Number(product.termLimit?.min ?? 0);
        case 'rate': return Number(product.rateLimit?.min ?? 0);
        case 'status': return String(product.status || '').toLowerCase();
        default: return String(product.productName || '').toLowerCase();
      }
    };
    results = [...results].sort((a, b) => {
      const av = value(a), bv = value(b);
      const compared = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return direction === 'desc' ? -compared : compared;
    });
    return results;
  }

  showCreate(): void {
    // Load saved form data from localStorage if exists
    const savedFormData = localStorage.getItem('productFormData');
    if (savedFormData) {
      try {
        const saved = JSON.parse(savedFormData);
        this.productForm = {
          ...this.productForm,
          ...saved,
          allowedRoles: saved.allowedRoles || ['OWNER', 'CO-OWNER', 'NOMINEE'],
          rateVariations: saved.rateVariations || [
            { customerCategory: 'SENIOR_CITIZEN', rateModifier: 1.0 },
            { customerCategory: 'EMPLOYEE', rateModifier: 0.5 },
            { customerCategory: 'STUDENT', rateModifier: 0.5 }
          ]
        };
      } catch (e) {
        console.error('Error loading saved form data:', e);
        this.resetForm();
      }
    } else {
      this.resetForm();
    }
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
      compoundingFrequency: product.compoundingFrequency || product.charges?.interestCreditFrequency || 'QUARTERLY',
      taxRate: Number(product.taxRate ?? this.getProductCharge(product, 'TAX')?.chargeValue ?? 10),
      processingFee: Number(this.getProductCharge(product, 'PROCESSING_FEE')?.chargeValue ?? 0),
      processingFeeUnit: this.getProductCharge(product, 'PROCESSING_FEE')?.chargeUnit || 'flat',
      serviceFeeRate: Number(product.serviceFeeRate ?? 0),
      serviceFeeFlat: Number(product.serviceFeeFlat ?? 0),
      documentationFee: Number(product.documentationFee ?? 0),
      gstRate: Number(product.gstRate ?? 18),
      prematurePenaltyRate: Number(product.prematurePenaltyRate ?? this.getProductCharge(product, 'PREMATURE_WITHDRAWAL')?.chargeValue ?? 1),
      allowedRoles: product.allowedRoles?.length ? [...product.allowedRoles] : ['OWNER'],
      rateVariations: product.rateVariations?.map((variation: any) => ({ ...variation })) || [],
      status: product.status || 'ACTIVE'
    };
    this.showEditForm.set(true);
    this.showCreateForm.set(false);
  }

  hideForms(): void {
    // Save form data if in create mode
    if (this.showCreateForm()) {
      this.saveFormData();
    }
    this.showCreateForm.set(false);
    this.showEditForm.set(false);
    this.editingProduct.set(null);
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
      taxRate: 10,
      processingFee: 0,
      processingFeeUnit: 'flat',
      serviceFeeRate: 0,
      serviceFeeFlat: 0,
      documentationFee: 0,
      gstRate: 18,
      prematurePenaltyRate: 1,
      allowedRoles: ['OWNER', 'CO-OWNER', 'NOMINEE'],
      rateVariations: [
        { customerCategory: 'SENIOR_CITIZEN', rateModifier: 1.0 },
        { customerCategory: 'EMPLOYEE', rateModifier: 0.5 },
        { customerCategory: 'STUDENT', rateModifier: 0.5 }
      ],
      status: 'ACTIVE'
    };
    // Clear saved form data from localStorage
    localStorage.removeItem('productFormData');
  }

  clearForm(): void {
    this.resetForm();
  }

  saveFormData(): void {
    localStorage.setItem('productFormData', JSON.stringify(this.productForm));
  }

  // Validation methods
  validateProductForm(): boolean {
    this.formErrors = {};

    // Product code validation (only required when creating, not editing)
    if (!this.showEditForm()) {
      if (!this.productForm.productCode || this.productForm.productCode.trim() === '') {
        this.formErrors['productCode'] = 'Product code is required';
      } else if (this.productForm.productCode.length < 3) {
        this.formErrors['productCode'] = 'Product code must be at least 3 characters';
      }
    }

    // Product name validation
    if (!this.productForm.productName || this.productForm.productName.trim() === '') {
      this.formErrors['productName'] = 'Product name is required';
    }

    // Term validation
    if (this.productForm.minTerm < 1) {
      this.formErrors['minTerm'] = 'Minimum term must be at least 1 month';
    }
    if (this.productForm.maxTerm < this.productForm.minTerm) {
      this.formErrors['maxTerm'] = 'Maximum term must be greater than minimum term';
    }

    // Rate validation
    if (this.productForm.minRate < 0) {
      this.formErrors['minRate'] = 'Minimum rate cannot be negative';
    }
    if (this.productForm.maxRate < this.productForm.minRate) {
      this.formErrors['maxRate'] = 'Maximum rate must be greater than minimum rate';
    }
    if (!this.productForm.allowedRoles.includes('OWNER')) {
      this.formErrors['allowedRoles'] = 'Owner must be an allowed account holder';
    }
    const categories = this.productForm.rateVariations.map(v => v.customerCategory.trim().toUpperCase());
    if (categories.some(category => !category) || new Set(categories).size !== categories.length) {
      this.formErrors['rateVariations'] = 'Each customer category must be filled and unique';
    }

    // Deposit validation
    if (this.productForm.minDeposit < 0) {
      this.formErrors['minDeposit'] = 'Minimum deposit cannot be negative';
    }
    if (this.productForm.maxDeposit < this.productForm.minDeposit) {
      this.formErrors['maxDeposit'] = 'Maximum deposit must be greater than minimum deposit';
    }

    for (const field of ['taxRate', 'processingFee', 'serviceFeeRate', 'serviceFeeFlat', 'documentationFee', 'gstRate', 'prematurePenaltyRate']) {
      const value = Number((this.productForm as any)[field]);
      if (!Number.isFinite(value) || value < 0) this.formErrors[field] = 'Value must be zero or greater';
    }

    // Age validation
    if (this.productForm.minAge < 18) {
      this.formErrors['minAge'] = 'Minimum age must be at least 18';
    }

    // Date validation
    if (this.productForm.effectiveDate && this.productForm.endDate) {
      const effective = new Date(this.productForm.effectiveDate);
      const end = new Date(this.productForm.endDate);
      if (end <= effective) {
        this.formErrors['endDate'] = 'End date must be after effective date';
      }
    }

    return Object.keys(this.formErrors).length === 0;
  }

  createProduct(): void {
    // Validate form before submission
    if (!this.validateProductForm()) {
      this.error.set('Please fix the validation errors before creating the product');
      return;
    }

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
      compoundingFrequency: this.productForm.compoundingFrequency,
      taxRate: Number(this.productForm.taxRate),
      serviceFeeRate: Number(this.productForm.serviceFeeRate),
      serviceFeeFlat: Number(this.productForm.serviceFeeFlat),
      documentationFee: Number(this.productForm.documentationFee),
      gstRate: Number(this.productForm.gstRate),
      prematurePenaltyRate: Number(this.productForm.prematurePenaltyRate),
      chargeDetails: this.buildChargeDetails(),
      allowedRoles: [...this.productForm.allowedRoles],
      rateVariations: this.productForm.rateVariations.map(v => ({ customerCategory: v.customerCategory.trim().toUpperCase(), rateModifier: Number(v.rateModifier) })),
      status: this.productForm.status
    };

    this.apiClient.createProduct(productData).subscribe({
      next: () => {
        this.loadProducts();
        this.hideForms();
        this.resetForm(); // Clear form and saved data after successful creation
        this.formErrors = {}; // Clear validation errors
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
      compoundingFrequency: this.productForm.compoundingFrequency,
      taxRate: Number(this.productForm.taxRate),
      serviceFeeRate: Number(this.productForm.serviceFeeRate),
      serviceFeeFlat: Number(this.productForm.serviceFeeFlat),
      documentationFee: Number(this.productForm.documentationFee),
      gstRate: Number(this.productForm.gstRate),
      prematurePenaltyRate: Number(this.productForm.prematurePenaltyRate),
      chargeDetails: this.buildChargeDetails(),
      allowedRoles: [...this.productForm.allowedRoles],
      rateVariations: this.productForm.rateVariations.map(v => ({ customerCategory: v.customerCategory.trim().toUpperCase(), rateModifier: Number(v.rateModifier) })),
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

  reintroduceProduct(productCode: string): void {
    if (!confirm('Are you sure you want to reintroduce this product?')) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Find the product in the current list to get its full data
    const product = this.products().find(p => p.productCode === productCode);
    if (!product) {
      this.error.set('Product not found');
      this.isLoading.set(false);
      return;
    }

    // Update only the status, keeping all other fields
    const productData = {
      productCode: product.productCode,
      productName: product.productName,
      productType: product.productType,
      currency: product.currency,
      effectiveDate: product.effectiveDate,
      endDate: product.endDate,
      termLimit: product.termLimit,
      rateLimit: product.rateLimit,
      minDeposit: product.minDeposit,
      maxDeposit: product.maxDeposit,
      minAge: product.minAge,
      interestType: product.interestType,
      charges: product.charges,
      allowedRoles: product.allowedRoles,
      rateVariations: product.rateVariations,
      status: 'ACTIVE'
    };

    this.apiClient.updateProduct(productCode, productData).subscribe({
      next: () => {
        this.loadProducts();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error reintroducing product:', err);
        this.error.set(err.error?.message || 'Failed to reintroduce product');
        this.isLoading.set(false);
      }
    });
  }

  permanentlyDeleteProduct(productCode: string): void {
    if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.apiClient.permanentlyDeleteProduct(productCode).subscribe({
      next: () => {
        this.loadProducts();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error permanently deleting product:', err);
        this.error.set(err.error?.message || 'Failed to permanently delete product');
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString();
  }

  private getProductCharge(product: any, type: string): any | undefined {
    return product.chargeDetails?.find((charge: any) => String(charge.chargeType || '').toUpperCase() === type);
  }

  private buildChargeDetails(): any[] {
    const charges = [
      { chargeType: 'TAX', chargeValue: Number(this.productForm.taxRate), chargeUnit: 'percentage', feeType: 'PERIODIC' },
      { chargeType: 'PREMATURE_WITHDRAWAL', chargeValue: Number(this.productForm.prematurePenaltyRate), chargeUnit: 'percentage', feeType: 'EVENT_BASED' }
    ];
    if (Number(this.productForm.processingFee) > 0) {
      charges.push({ chargeType: 'PROCESSING_FEE', chargeValue: Number(this.productForm.processingFee), chargeUnit: this.productForm.processingFeeUnit, feeType: 'ONE_TIME' });
    }
    return charges;
  }

  formatRateVariations(variations: any[] | null | undefined): string {
    return variations?.length
      ? variations.map(v => `${v.customerCategory} +${v.rateModifier}%`).join(', ')
      : 'None';
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

  toggleAllowedRole(role: string, checked: boolean): void {
    if (role === 'OWNER') return;
    const roles = new Set(this.productForm.allowedRoles);
    checked ? roles.add(role) : roles.delete(role);
    this.productForm.allowedRoles = ['OWNER', ...Array.from(roles).filter(value => value !== 'OWNER')];
  }

  isRoleAllowed(role: string): boolean {
    return this.productForm.allowedRoles.includes(role);
  }

  addRateVariation(): void {
    this.productForm.rateVariations.push({ customerCategory: '', rateModifier: 0 });
  }

  removeRateVariation(index: number): void {
    this.productForm.rateVariations.splice(index, 1);
  }
}
