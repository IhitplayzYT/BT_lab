import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, signal, computed, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { AnimationService } from '../../services/animation.service';
import { ValidationService } from '../../services/validation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { StarBackgroundComponent } from '../star-background/star-background.component';

@Component({
  selector: 'app-fd-calculator',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, NavbarComponent, FooterComponent, StarBackgroundComponent],
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

  // Form inputs
  principal = signal(100000);
  termMonths = signal(12);
  productCode = signal('FD_STD_SHORT');
  interestType = signal('COMPOUND');
  interestRate = signal(7.0); // User-selected interest rate within product range

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
  
  // Validation errors
  principalError = '';
  termMonthsError = '';
  interestRateError = '';

  // Computed values
  readonly formattedPrincipal = computed(() => this.principal().toLocaleString('en-IN'));
  readonly formattedMaturity = computed(() => {
    const result = this.calculationResult();
    return result ? result.maturityAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0';
  });
  readonly formattedInterest = computed(() => {
    const result = this.calculationResult();
    return result ? result.interestEarned?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0';
  });
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
        this.onProductChange();
      }
    } catch (error) {
      console.error('Failed to load products:', error);
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
      // Update product-specific limits - handle both camelCase and snake_case
      const rateLimit = selectedProduct.rateLimit || selectedProduct.rate_limit;
      const termLimit = selectedProduct.termLimit || selectedProduct.term_limit;

      this.minInterestRate.set(rateLimit?.min || 5.0);
      this.maxInterestRate.set(rateLimit?.max || 10.0);
      this.minPrincipal.set(selectedProduct.minDeposit || 1000);
      this.maxPrincipal.set(selectedProduct.maxDeposit || 100000000);
      this.minTerm.set(termLimit?.min || 3);
      this.maxTerm.set(termLimit?.max || 120);

      // Set interest rate to the max rate of the selected product
      this.interestRate.set(rateLimit?.max || 7.0);

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
      console.warn('Product not found for code:', this.productCode());
    }
  }

  validatePrincipal(): void {
    if (!this.validationService.isValidPositiveNumber(this.principal())) {
      this.principalError = 'Principal amount must be a positive number';
    } else if (this.principal() < this.minPrincipal()) {
      this.principalError = `Minimum amount is ₹${this.minPrincipal().toLocaleString()}`;
    } else if (this.principal() > this.maxPrincipal()) {
      this.principalError = `Maximum amount is ₹${this.maxPrincipal().toLocaleString()}`;
    } else {
      this.principalError = '';
    }
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
        const result = await this.apiClient.calculateMaturity({
          productCode: this.productCode(),
          principal: this.principal(),
          termMonths: this.termMonths(),
          interestType: this.interestType()
        }).toPromise();
        this.calculationResult.set(result);
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

  private calculateClientSide(): void {
    const principal = this.principal();
    const termMonths = this.termMonths();
    const termYears = termMonths / 12;
    const interestType = this.interestType();
    const interestRate = this.interestRate(); // Use user-selected interest rate

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

    interestEarned = maturityAmount - principal;

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + termMonths);

    this.calculationResult.set({
      principal,
      termMonths,
      interestRate,
      interestType,
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
