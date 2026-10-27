import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, signal, computed, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { AnimationService } from '../../services/animation.service';
import { ValidationService } from '../../services/validation.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-fd-calculator',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './fd-calculator.component.html',
  styleUrls: ['./fd-calculator.component.scss']
})
export class FdCalculatorComponent implements AfterViewInit {
  private apiClient = inject(ApiClientService);
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);
  private validationService = inject(ValidationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly currencyService = inject(CurrencyService);

  // Form inputs
  principal = signal(100000);
  termMonths = signal(12);
  productCode = signal('');
  interestType = signal('COMPOUND');
  interestRate = signal(7.0); // User-selected interest rate within product range
  customerCategory = signal('GENERAL');

  // Product-specific limits
  minInterestRate = signal(5.0);
  maxInterestRate = signal(10.0);
  minPrincipal = signal(1000);
  maxPrincipal = signal(100000000);
  minTerm = signal(3);
  maxTerm = signal(120);

  // Calculation result
  calculationResult = signal<any>(null);
  isCalculating = signal(false);
  error = signal('');

  // Products list
  products = signal<any[]>([]);
  readonly selectedProduct = computed(() => this.products().find(product => product.productCode === this.productCode()) || null);
  
  // Validation errors
  principalError = '';
  termMonthsError = '';
  interestRateError = '';
  productError = '';

  // Computed values
  readonly displayedPrincipal = computed(() => this.currencyService.convertFromINR(this.principal(), this.currencyService.preferredCurrency()));
  readonly displayedMinPrincipal = computed(() => this.currencyService.convertFromINR(this.minPrincipal(), this.currencyService.preferredCurrency()));
  readonly displayedMaxPrincipal = computed(() => this.currencyService.convertFromINR(this.maxPrincipal(), this.currencyService.preferredCurrency()));
  readonly formattedPrincipal = computed(() => this.currencyService.formatPreferredCurrency(this.principal()));
  readonly formattedMaturity = computed(() => {
    const result = this.calculationResult();
    return this.currencyService.formatPreferredCurrency(result?.maturityAmount || 0);
  });
  readonly formattedInterest = computed(() => {
    const result = this.calculationResult();
    return this.currencyService.formatPreferredCurrency(result?.grossInterest ?? result?.interestEarned ?? 0);
  });
  readonly formattedDeductions = computed(() => this.currencyService.formatPreferredCurrency(this.calculationResult()?.totalDeductions || 0));
  readonly formattedNetInterest = computed(() => this.currencyService.formatPreferredCurrency(this.calculationResult()?.netInterest ?? this.calculationResult()?.interestEarned ?? 0));
  readonly chargeBreakdown = computed(() => this.calculationResult()?.charges || []);
  readonly displayInterestRate = computed(() => {
    const result = this.calculationResult();
    return result ? result.effectiveRate : 0;
  });

  readonly grossInterest = computed(() => {
    const result = this.calculationResult();
    return result ? result.grossInterest?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0';
  });

  readonly netInterest = computed(() => {
    const result = this.calculationResult();
    return result ? result.netInterest?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0';
  });

  readonly totalDeductions = computed(() => {
    const result = this.calculationResult();
    return result ? result.totalDeductions?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0';
  });

  ngAfterViewInit(): void {
    this.loadProducts().then(() => {
      this.loadPreFilledData();
      this.initializeAnimations();
    });
  }

  private initializeAnimations(): void {
    const container = this.elementRef.nativeElement.querySelector('.calculator-container');
    this.animationService.fadeInOnScroll(container);
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await this.apiClient.getActiveProducts('FD').toPromise();

      // Filter out products whose end date has passed (additional client-side safety)
      const today = new Date();
      const validProducts = (products || []).filter(product => {
        if (!product.endDate) return true; // No end date means always valid
        const endDate = new Date(product.endDate);
        return today <= endDate;
      });

      this.products.set(validProducts);

      // Initialize limits based on the first product or current selection
      if (validProducts && validProducts.length > 0) {
        if (!validProducts.some(product => product.productCode === this.productCode())) {
          this.productCode.set(validProducts[0].productCode);
        }
        this.onProductChange();
        const savedProfile = localStorage.getItem(this.apiClient.getUserStorageKey('default_fd_details'));
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          if (profile.defaultCurrency) this.currencyService.setPreferredCurrency(profile.defaultCurrency);
          if (profile.customerCategory) this.customerCategory.set(profile.customerCategory);
          this.onProductChange();
        }
      } else {
        this.productError = 'No active FD products are available to calculate.';
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      this.productError = 'Could not load FD products. Please try again later.';
    }
  }

  private loadPreFilledData(): void {
    const savedData = localStorage.getItem('calculator_product_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log('Loading pre-filled calculator data:', data);

        // Set form values from pre-filled data
        if (data.productCode) this.productCode.set(data.productCode);
        if (data.principal) this.principal.set(data.principal);
        if (data.termMonths) this.termMonths.set(data.termMonths);
        if (data.interestType) this.interestType.set(data.interestType);
        if (data.interestRate) this.interestRate.set(data.interestRate);

        // Set product-specific limits from pre-filled data
        if (data.minDeposit) this.minPrincipal.set(data.minDeposit);
        if (data.maxDeposit) this.maxPrincipal.set(data.maxDeposit);
        if (data.minTerm) this.minTerm.set(data.minTerm);
        if (data.maxTerm) this.maxTerm.set(data.maxTerm);
        if (data.minRate) this.minInterestRate.set(data.minRate);
        if (data.maxRate) this.maxInterestRate.set(data.maxRate);

        console.log('Product-specific limits loaded from pre-filled data:', {
          minPrincipal: this.minPrincipal(),
          maxPrincipal: this.maxPrincipal(),
          minTerm: this.minTerm(),
          maxTerm: this.maxTerm(),
          minInterestRate: this.minInterestRate(),
          maxInterestRate: this.maxInterestRate()
        });

        // Clear the saved data after loading
        localStorage.removeItem('calculator_product_data');

        // Auto-calculate with pre-filled values after a delay to ensure UI is ready
        setTimeout(() => {
          console.log('Auto-calculating with pre-filled values...');
          this.calculate();
        }, 300);
      } catch (e) {
        console.error('Error loading pre-filled data:', e);
      }
    }
  }

  // Update interest rate and limits when product changes
  onProductChange(): void {
    const selectedProduct = this.products().find(p => p.productCode === this.productCode());
    console.log('Selected product:', selectedProduct);
    console.log('All products:', this.products());

    if (selectedProduct) {
      this.productError = '';
      this.error.set('');
      this.calculationResult.set(null);
      // Update product-specific limits - handle both camelCase and snake_case
      const rateLimit = selectedProduct.rateLimit || selectedProduct.rate_limit;
      const termLimit = selectedProduct.termLimit || selectedProduct.term_limit;

      this.minInterestRate.set(rateLimit?.min || 5.0);
      this.maxInterestRate.set(rateLimit?.max || 10.0);
      this.minPrincipal.set(selectedProduct.minDeposit || 1000);
      this.maxPrincipal.set(selectedProduct.maxDeposit || 100000000);
      this.minTerm.set(Number(termLimit?.min ?? 3));
      this.maxTerm.set(Number(termLimit?.max ?? 120));
      this.termMonths.set(Math.min(this.maxTerm(), Math.max(this.minTerm(), this.termMonths())));
      const categories = (selectedProduct.rateVariations || []).map((variation: any) => String(variation.customerCategory).toUpperCase().replace(/\s+/g, '_'));
      if (this.customerCategory() !== 'GENERAL' && !categories.includes(this.customerCategory())) this.customerCategory.set('GENERAL');

      // Set interest rate to the max rate of the selected product
      this.interestRate.set(rateLimit?.min ?? 7.0);

      console.log('Product limits updated:', {
        productCode: selectedProduct.productCode,
        rateLimit,
        termLimit,
        minInterestRate: this.minInterestRate(),
        maxInterestRate: this.maxInterestRate(),
        minPrincipal: this.minPrincipal(),
        maxPrincipal: this.maxPrincipal(),
        minTerm: this.minTerm(),
        maxTerm: this.maxTerm()
      });
    } else {
      this.productError = this.products().length
        ? 'Please select an FD product before calculating.'
        : 'No active FD products are available to calculate.';
      this.calculationResult.set(null);
      console.warn('Product not found for code:', this.productCode());
    }
  }

  validatePrincipal(): void {
    if (!this.validationService.isValidPositiveNumber(this.principal())) {
      this.principalError = 'Principal amount must be a positive number';
    } else if (this.principal() < this.minPrincipal()) {
      this.principalError = `Minimum amount is ${this.currencyService.formatPreferredCurrency(this.minPrincipal())}`;
    } else if (this.principal() > this.maxPrincipal()) {
      this.principalError = `Maximum amount is ${this.currencyService.formatPreferredCurrency(this.maxPrincipal())}`;
    } else {
      this.principalError = '';
    }
  }

  setDisplayedPrincipal(amount: number): void {
    this.principal.set(this.currencyService.convertToINR(amount, this.currencyService.preferredCurrency()));
  }

  validateTermMonths(): void {
    if (!this.validationService.isValidNumber(this.termMonths())) {
      this.termMonthsError = 'Please enter a valid tenure';
    } else if (this.termMonths() < this.minTerm()) {
      this.termMonthsError = `Minimum tenure is ${this.minTerm()} months`;
    } else if (this.termMonths() > this.maxTerm()) {
      this.termMonthsError = `Maximum tenure is ${this.maxTerm()} months`;
    } else {
      this.termMonthsError = '';
    }
  }

  validateInterestRate(): void {
    if (!this.validationService.isValidNumber(this.interestRate())) {
      this.interestRateError = 'Please enter a valid interest rate';
    } else if (this.interestRate() < this.minInterestRate()) {
      this.interestRateError = `Minimum rate is ${this.minInterestRate()}%`;
    } else if (this.interestRate() > this.maxInterestRate()) {
      this.interestRateError = `Maximum rate is ${this.maxInterestRate()}%`;
    } else {
      this.interestRateError = '';
    }
  }

  async calculate(): Promise<void> {
    console.log('Calculate called with:', {
      principal: this.principal(),
      termMonths: this.termMonths(),
      productCode: this.productCode(),
      interestRate: this.interestRate(),
      interestType: this.interestType()
    });

    if (!this.selectedProduct()) {
      this.productError = 'Please select an FD product before calculating.';
      this.calculationResult.set(null);
      this.error.set(this.productError);
      return;
    }
    this.productError = '';
    this.validatePrincipal();
    this.validateTermMonths();
    this.validateInterestRate();

    console.log('Validation errors:', {
      principalError: this.principalError,
      termMonthsError: this.termMonthsError,
      interestRateError: this.interestRateError
    });

    if (this.principalError || this.termMonthsError || this.interestRateError) {
      this.error.set('Please fix the errors above');
      console.log('Calculation blocked by validation errors');
      return;
    }

    this.isCalculating.set(true);
    this.error.set('');
    this.calculationResult.set(null);

    try {
      // Try to use the API if authenticated
      if (this.authService.isLoggedIn()) {
        const result = await this.apiClient.calculateAdvancedMaturity({
          principal: this.principal(),
          term: { value: this.termMonths(), unit: 'MONTHS' },
          baseRate: this.interestRate(),
          productCode: this.productCode(),
          categories: this.customerCategory() === 'GENERAL' ? [] : [this.customerCategory()],
          interestType: this.interestType(),
          currency: 'INR',
          compoundingFrequency: 4,
          includePrematureWithdrawal: false
        }).toPromise();
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + this.termMonths());
        const configuredResult = this.ensureConfiguredTaxDeduction(result, this.selectedProduct());
        this.calculationResult.set({
          ...configuredResult,
          principal: this.principal(),
          interestEarned: configuredResult.grossInterest,
          termMonths: this.termMonths(),
          maturityDate: maturityDate.toISOString().split('T')[0]
        });
      } else {
        // Fallback to client-side calculation for non-authenticated users
        this.calculateClientSide();
      }

      // Animate the result
      this.animateResult();
    } catch (error: any) {
      // If API fails, fallback to client-side calculation
      console.warn('API calculation failed, using client-side fallback:', error);
      this.calculateClientSide();
      this.animateResult();
    } finally {
      this.isCalculating.set(false);
    }
  }

  private ensureConfiguredTaxDeduction(result: any, product: any): any {
    if (!result || !product) return result;
    const explicitRate = Number(product.taxRate);
    const taxCharge = (Array.isArray(product.chargeDetails) ? product.chargeDetails : []).find((charge: any) =>
      String(charge.chargeType || '').trim().toUpperCase() === 'TAX'
    );
    const taxRate = explicitRate > 0 ? explicitRate : Number(taxCharge?.chargeValue) || 0;
    if (taxRate <= 0) return result;

    const charges = Array.isArray(result.charges) ? [...result.charges] : [];
    const alreadyHasTax = charges.some((charge: any) =>
      String(charge.chargeType || '').trim().toUpperCase() === 'TDS'
    );
    if (alreadyHasTax) return { ...result, charges };

    const grossInterest = Number(result.grossInterest ?? result.interestEarned) || 0;
    const taxAmount = Math.round(grossInterest * taxRate) / 100;
    if (taxAmount <= 0) return { ...result, charges };

    const totalDeductions = (Number(result.totalDeductions) || 0) + taxAmount;
    const netInterest = (Number(result.netInterest ?? grossInterest) || 0) - taxAmount;
    const maturityAmount = (Number(result.maturityAmount) || this.principal() + grossInterest) - taxAmount;
    charges.push({
      chargeType: 'TDS',
      chargeCategory: 'TAX',
      description: 'Tax Deducted at Source',
      chargeAmount: taxAmount,
      chargeUnit: 'PERCENTAGE',
      chargeRate: taxRate,
      isDeductible: true
    });
    return { ...result, charges, totalDeductions, netInterest, maturityAmount };
  }

  private calculateClientSide(): void {
    const principal = this.principal();
    const termMonths = this.termMonths();
    const termYears = termMonths / 12;
    const interestType = this.interestType();
    const product = this.products().find(item => item.productCode === this.productCode());
    const variation = (product?.rateVariations || []).find((item: any) => String(item.customerCategory).toUpperCase().replace(/\s+/g, '_') === this.customerCategory());
    const interestRate = Math.min(this.maxInterestRate(), Math.max(this.minInterestRate(), this.interestRate() + Number(variation?.rateModifier || 0)));

    let maturityAmount: number;
    let interestEarned: number;

    if (interestType === 'COMPOUND') {
      // Compound interest formula: A = P(1 + r/n)^(nt)
      // Assuming monthly compounding (n = 12)
      const n = 12;
      maturityAmount = principal * Math.pow((1 + (interestRate / 100) / n), n * termYears);
    } else {
      // Simple interest formula: A = P(1 + rt)
      maturityAmount = principal * (1 + (interestRate / 100) * termYears);
    }

    const grossInterest = maturityAmount - principal;
    const charges: any[] = [];
    const chargeDetails = product?.chargeDetails || [];
    const findCharge = (types: string[]) => chargeDetails.find((charge: any) =>
      types.includes(String(charge.chargeType || '').trim().toUpperCase().replace(/\s+/g, '_'))
    );
    const chargeAmount = (types: string[], amountBase: number): number => {
      const charge = findCharge(types);
      if (!charge) return 0;
      const value = Number(charge.chargeValue || 0);
      return String(charge.chargeUnit || '').toLowerCase() === 'percentage'
        ? amountBase * value / 100
        : value;
    };
    const addCharge = (chargeType: string, description: string, amount: number): void => {
      if (amount > 0) charges.push({ chargeType, description, chargeAmount: Math.round(amount * 100) / 100 });
    };

    const taxCharge = findCharge(['TAX']);
    const explicitTaxRate = Number(product?.taxRate);
    const taxRate = explicitTaxRate > 0 ? explicitTaxRate : Number(taxCharge?.chargeValue ?? 0);
    const taxDeduction = grossInterest * taxRate / 100;
    addCharge('TDS', 'Tax Deducted at Source', taxDeduction);

    const processingFee = chargeAmount(
      ['PROCESSING_FEE', 'TRANSACTION_FEE', 'DEPOSIT_FEE', 'ACCOUNT_OPENING_FEE', 'APPLICATION_FEE'], principal);
    const serviceCharge = findCharge(['SERVICE_FEE']);
    const serviceFee = serviceCharge
      ? chargeAmount(['SERVICE_FEE'], principal)
      : Number(product?.serviceFeeRate || 0) > 0
        ? principal * Number(product.serviceFeeRate) / 100
        : Number(product?.serviceFeeFlat || 0);
    const documentationFee = findCharge(['DOCUMENTATION_FEE'])
      ? chargeAmount(['DOCUMENTATION_FEE'], principal)
      : Number(product?.documentationFee || 0);
    addCharge('PROCESSING_FEE', 'Configured processing fee', processingFee);
    addCharge('SERVICE_FEE', 'Configured service fee', serviceFee);
    addCharge('DOCUMENTATION_FEE', 'Configured documentation fee', documentationFee);

    const gstAmount = (processingFee + serviceFee + documentationFee) * Number(product?.gstRate || 0) / 100;
    addCharge('GST', 'GST on configured service charges', gstAmount);
    const totalDeductions = charges.reduce((sum, charge) => sum + charge.chargeAmount, 0);
    const netInterest = grossInterest - totalDeductions;
    interestEarned = grossInterest;
    maturityAmount = principal + netInterest;

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + termMonths);

    this.calculationResult.set({
      principal,
      termMonths,
      interestRate,
      effectiveRate: interestRate,
      interestType,
      grossInterest: Math.round(grossInterest * 100) / 100,
      netInterest: Math.round(netInterest * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      charges,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      maturityDate: maturityDate.toISOString().split('T')[0],
      calculatedAt: new Date().toISOString()
    });
  }

  private animateResult(): void {
    const resultElement = this.elementRef.nativeElement.querySelector('.calculator-result');
    if (resultElement) {
      this.animationService.clipPathReveal(resultElement, 'up');
    }
  }

  // Calculate bar width for principal to prevent clipping
  getPrincipalBarWidth(): number {
    const result = this.calculationResult();
    if (!result || !result.maturityAmount) return 50;
    const percentage = (this.principal() / result.maturityAmount) * 100;
    return Math.min(Math.max(percentage, 10), 90); // Clamp between 10% and 90%
  }

  // Calculate bar width for interest to prevent clipping
  getInterestBarWidth(): number {
    const result = this.calculationResult();
    if (!result || !result.maturityAmount) return 50;
    const percentage = (result.interestEarned / result.maturityAmount) * 100;
    return Math.min(Math.max(percentage, 10), 90); // Clamp between 10% and 90%
  }

}
