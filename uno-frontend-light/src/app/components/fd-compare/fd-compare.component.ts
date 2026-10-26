import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, signal, computed, AfterViewInit, ElementRef, OnDestroy, effect, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { ValidationService } from '../../services/validation.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-fd-compare',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './fd-compare.component.html',
  styleUrls: ['./fd-compare.component.scss']
})
export class FdCompareComponent implements AfterViewInit, OnDestroy {
  private apiClient = inject(ApiClientService);
  private validationService = inject(ValidationService);
  private authService = inject(AuthService);
  readonly currencyService = inject(CurrencyService);
  private platformId = inject(PLATFORM_ID);
  readonly supportedCurrencies = this.currencyService.getSupportedCurrencies();

  // Product 1 inputs
  principal1 = signal(100000);
  termMonths1 = signal(12);
  interestType1 = signal('COMPOUND');
  productCode1 = signal('FD_STD_SHORT');
  customerCategory1 = signal('GENERAL');
  interestRate1 = signal(7.0);

  // Product 2 inputs
  principal2 = signal(100000);
  termMonths2 = signal(24);
  interestType2 = signal('COMPOUND');
  productCode2 = signal('FD_STD_LONG');
  customerCategory2 = signal('GENERAL');
  interestRate2 = signal(7.5);

  // Product-specific limits for product 1
  minInterestRate1 = signal(5.0);
  maxInterestRate1 = signal(10.0);
  minPrincipal1 = signal(1000);
  maxPrincipal1 = signal(100000000);
  minTerm1 = signal(3);
  maxTerm1 = signal(120);

  // Product-specific limits for product 2
  minInterestRate2 = signal(5.0);
  maxInterestRate2 = signal(10.0);
  minPrincipal2 = signal(1000);
  maxPrincipal2 = signal(100000000);
  minTerm2 = signal(3);
  maxTerm2 = signal(120);

  // Calculation results
  calculationResult1 = signal<any>(null);
  calculationResult2 = signal<any>(null);
  isCalculating = signal(false);
  error = signal('');

  // Products list
  products = signal<any[]>([]);

  // Validation errors
  principalError1 = '';
  termMonthsError1 = '';
  interestRateError1 = '';
  principalError2 = '';
  termMonthsError2 = '';
  interestRateError2 = '';

  // Chart instance
  private chart: Chart | null = null;
  private chartCanvas: HTMLCanvasElement | null = null;

  @ViewChild('growthChart')
  set growthChart(canvas: ElementRef<HTMLCanvasElement> | undefined) {
    this.chartCanvas = canvas?.nativeElement ?? null;
    if (this.chartCanvas) this.updateChart();
  }

  // Debounce timer
  private debounceTimer: any = null;

  // Live calculation effect
  private liveCalculation = effect(() => {
    // Watch all input signals
    this.principal1();
    this.termMonths1();
    this.interestType1();
    this.productCode1();
    this.customerCategory1();
    this.interestRate1();
    this.principal2();
    this.termMonths2();
    this.interestType2();
    this.productCode2();
    this.customerCategory2();
    this.interestRate2();
    this.selectedCurrency();

    // Debounce calculation to avoid excessive updates
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      if (this.products().length > 0) {
        this.calculate();
      }
    }, 300);
  });

  // Currency settings
  selectedCurrency = signal(this.currencyService.preferredCurrency());

  // Currency conversion helper
  private convertCurrency(amount: number): number {
    return this.currencyService.convertFromINR(amount, this.selectedCurrency());
  }

  private formatCurrency(amount: number): string {
    const currency = this.selectedCurrency();
    const converted = this.convertCurrency(amount);
    return this.currencyService.formatCurrency(converted, currency);
  }

  // Computed values for product 1
  readonly formattedPrincipal1 = computed(() => this.formatCurrency(this.principal1()));
  readonly formattedMaturity1 = computed(() => {
    const result = this.calculationResult1();
    return result ? this.formatCurrency(result.maturityAmount) : this.formatCurrency(0);
  });
  readonly formattedInterest1 = computed(() => {
    const result = this.calculationResult1();
    return result ? this.formatCurrency(result.interestEarned) : this.formatCurrency(0);
  });

  // Computed values for product 2
  readonly formattedPrincipal2 = computed(() => this.formatCurrency(this.principal2()));
  readonly formattedMaturity2 = computed(() => {
    const result = this.calculationResult2();
    return result ? this.formatCurrency(result.maturityAmount) : this.formatCurrency(0);
  });
  readonly formattedInterest2 = computed(() => {
    const result = this.calculationResult2();
    return result ? this.formatCurrency(result.interestEarned) : this.formatCurrency(0);
  });

  ngAfterViewInit(): void {
    this.loadProducts().then(() => {
      this.onProductChange1();
      this.onProductChange2();
      const savedProfile = localStorage.getItem(this.apiClient.getUserStorageKey('default_fd_details'));
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const category = profile.customerCategory;
        if (profile.defaultCurrency) {
          this.currencyService.setPreferredCurrency(profile.defaultCurrency);
          this.selectedCurrency.set(profile.defaultCurrency);
        }
        if (category) {
          this.customerCategory1.set(category);
          this.customerCategory2.set(category);
          this.normalizeProductCategory(1, this.products().find(product => product.productCode === this.productCode1()));
          this.normalizeProductCategory(2, this.products().find(product => product.productCode === this.productCode2()));
        }
      }
      this.calculate();
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await this.apiClient.getActiveProducts('FD').toPromise();

      const today = new Date();
      const validProducts = (products || []).filter(product => {
        if (!product.endDate) return true;
        const endDate = new Date(product.endDate);
        return today <= endDate;
      });

      this.products.set(validProducts);

      if (validProducts && validProducts.length > 0) {
        if (validProducts.length >= 1) {
          this.productCode1.set(validProducts[0].productCode);
        }
        if (validProducts.length >= 2) {
          this.productCode2.set(validProducts[1].productCode);
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  onProductChange1(): void {
    const selectedProduct = this.products().find(p => p.productCode === this.productCode1());
    if (selectedProduct) {
      const rateLimit = selectedProduct.rateLimit || selectedProduct.rate_limit;
      const termLimit = selectedProduct.termLimit || selectedProduct.term_limit;

      this.minInterestRate1.set(rateLimit?.min || 5.0);
      this.maxInterestRate1.set(rateLimit?.max || 10.0);
      this.minPrincipal1.set(selectedProduct.minDeposit || 1000);
      this.maxPrincipal1.set(selectedProduct.maxDeposit || 100000000);
      const minTerm = Number(termLimit?.min ?? 3);
      const maxTerm = Number(termLimit?.max ?? 120);
      this.minTerm1.set(minTerm);
      this.maxTerm1.set(maxTerm);
      this.termMonths1.set(this.normalizeTenure(this.termMonths1(), minTerm, maxTerm));
      this.interestRate1.set(rateLimit?.min ?? 7.0);
      this.normalizeProductCategory(1, selectedProduct);
    }
  }

  onProductChange2(): void {
    const selectedProduct = this.products().find(p => p.productCode === this.productCode2());
    if (selectedProduct) {
      const rateLimit = selectedProduct.rateLimit || selectedProduct.rate_limit;
      const termLimit = selectedProduct.termLimit || selectedProduct.term_limit;

      this.minInterestRate2.set(rateLimit?.min || 5.0);
      this.maxInterestRate2.set(rateLimit?.max || 10.0);
      this.minPrincipal2.set(selectedProduct.minDeposit || 1000);
      this.maxPrincipal2.set(selectedProduct.maxDeposit || 100000000);
      const minTerm = Number(termLimit?.min ?? 3);
      const maxTerm = Number(termLimit?.max ?? 120);
      this.minTerm2.set(minTerm);
      this.maxTerm2.set(maxTerm);
      this.termMonths2.set(this.normalizeTenure(this.termMonths2(), minTerm, maxTerm));
      this.interestRate2.set(rateLimit?.min ?? 7.0);
      this.normalizeProductCategory(2, selectedProduct);
    }
  }

  private normalizeTenure(tenure: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Number(tenure) || min));
  }

  private normalizeProductCategory(productNum: 1 | 2, product: any): void {
    if (!product) return;
    const current = productNum === 1 ? this.customerCategory1() : this.customerCategory2();
    const categories = (product.rateVariations || []).map((variation: any) => String(variation.customerCategory).toUpperCase().replace(/\s+/g, '_'));
    if (current !== 'GENERAL' && !categories.includes(current)) {
      productNum === 1 ? this.customerCategory1.set('GENERAL') : this.customerCategory2.set('GENERAL');
    }
  }

  rateVariationsFor(productCode: string): any[] {
    return this.products().find(product => product.productCode === productCode)?.rateVariations || [];
  }

  validatePrincipal1(): void {
    if (!this.validationService.isValidPositiveNumber(this.principal1())) {
      this.principalError1 = 'Principal amount must be a positive number';
    } else if (this.principal1() < this.minPrincipal1()) {
      this.principalError1 = `Minimum amount is ₹${this.minPrincipal1().toLocaleString()}`;
    } else if (this.principal1() > this.maxPrincipal1()) {
      this.principalError1 = `Maximum amount is ₹${this.maxPrincipal1().toLocaleString()}`;
    } else {
      this.principalError1 = '';
    }
  }

  validateTermMonths1(): void {
    if (!this.validationService.isValidNumber(this.termMonths1())) {
      this.termMonthsError1 = 'Please enter a valid tenure';
    } else if (this.termMonths1() < this.minTerm1()) {
      this.termMonthsError1 = `Minimum tenure is ${this.minTerm1()} months`;
    } else if (this.termMonths1() > this.maxTerm1()) {
      this.termMonthsError1 = `Maximum tenure is ${this.maxTerm1()} months`;
    } else {
      this.termMonthsError1 = '';
    }
  }

  validateInterestRate1(): void {
    if (!this.validationService.isValidNumber(this.interestRate1())) {
      this.interestRateError1 = 'Please enter a valid interest rate';
    } else if (this.interestRate1() < this.minInterestRate1()) {
      this.interestRateError1 = `Minimum rate is ${this.minInterestRate1()}%`;
    } else if (this.interestRate1() > this.maxInterestRate1()) {
      this.interestRateError1 = `Maximum rate is ${this.maxInterestRate1()}%`;
    } else {
      this.interestRateError1 = '';
    }
  }

  validatePrincipal2(): void {
    if (!this.validationService.isValidPositiveNumber(this.principal2())) {
      this.principalError2 = 'Principal amount must be a positive number';
    } else if (this.principal2() < this.minPrincipal2()) {
      this.principalError2 = `Minimum amount is ₹${this.minPrincipal2().toLocaleString()}`;
    } else if (this.principal2() > this.maxPrincipal2()) {
      this.principalError2 = `Maximum amount is ₹${this.maxPrincipal2().toLocaleString()}`;
    } else {
      this.principalError2 = '';
    }
  }

  validateTermMonths2(): void {
    if (!this.validationService.isValidNumber(this.termMonths2())) {
      this.termMonthsError2 = 'Please enter a valid tenure';
    } else if (this.termMonths2() < this.minTerm2()) {
      this.termMonthsError2 = `Minimum tenure is ${this.minTerm2()} months`;
    } else if (this.termMonths2() > this.maxTerm2()) {
      this.termMonthsError2 = `Maximum tenure is ${this.maxTerm2()} months`;
    } else {
      this.termMonthsError2 = '';
    }
  }

  validateInterestRate2(): void {
    if (!this.validationService.isValidNumber(this.interestRate2())) {
      this.interestRateError2 = 'Please enter a valid interest rate';
    } else if (this.interestRate2() < this.minInterestRate2()) {
      this.interestRateError2 = `Minimum rate is ${this.minInterestRate2()}%`;
    } else if (this.interestRate2() > this.maxInterestRate2()) {
      this.interestRateError2 = `Maximum rate is ${this.maxInterestRate2()}%`;
    } else {
      this.interestRateError2 = '';
    }
  }

  async calculate(): Promise<void> {
    this.validatePrincipal1();
    this.validateTermMonths1();
    this.validateInterestRate1();
    this.validatePrincipal2();
    this.validateTermMonths2();
    this.validateInterestRate2();

    if (this.principalError1 || this.termMonthsError1 || this.interestRateError1 ||
        this.principalError2 || this.termMonthsError2 || this.interestRateError2) {
      this.error.set('Please fix the errors above');
      return;
    }

    this.isCalculating.set(true);
    this.error.set('');

    try {
      // Calculate for product 1
      this.calculateClientSide(1);
      // Calculate for product 2
      this.calculateClientSide(2);

      // Update chart
      this.updateChart();
    } finally {
      this.isCalculating.set(false);
    }
  }

  private calculateClientSide(productNum: number): void {
    const principal = productNum === 1 ? this.principal1() : this.principal2();
    const termMonths = productNum === 1 ? this.termMonths1() : this.termMonths2();
    const termYears = termMonths / 12;
    const interestType = productNum === 1 ? this.interestType1() : this.interestType2();
    const baseRate = productNum === 1 ? this.interestRate1() : this.interestRate2();
    const productCode = productNum === 1 ? this.productCode1() : this.productCode2();
    const category = productNum === 1 ? this.customerCategory1() : this.customerCategory2();
    const product = this.products().find(item => item.productCode === productCode);
    const variation = (product?.rateVariations || []).find((item: any) => String(item.customerCategory).toUpperCase().replace(/\s+/g, '_') === category);
    const minRate = productNum === 1 ? this.minInterestRate1() : this.minInterestRate2();
    const maxRate = productNum === 1 ? this.maxInterestRate1() : this.maxInterestRate2();
    const interestRate = Math.min(maxRate, Math.max(minRate, baseRate + Number(variation?.rateModifier || 0)));

    let maturityAmount: number;
    let interestEarned: number;

    if (interestType === 'COMPOUND') {
      const n = 12;
      maturityAmount = principal * Math.pow((1 + (interestRate / 100) / n), n * termYears);
    } else {
      maturityAmount = principal * (1 + (interestRate / 100) * termYears);
    }

    interestEarned = maturityAmount - principal;

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + termMonths);

    const result = {
      principal,
      termMonths,
      interestRate,
      interestType,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      maturityDate: maturityDate.toISOString().split('T')[0],
      calculatedAt: new Date().toISOString()
    };

    if (productNum === 1) {
      this.calculationResult1.set(result);
    } else {
      this.calculationResult2.set(result);
    }
  }

  private updateChart(): void {
    const canvas = this.chartCanvas;
    if (!canvas || !isPlatformBrowser(this.platformId)) return;

    const result1 = this.calculationResult1();
    const result2 = this.calculationResult2();

    if (!result1 || !result2) return;

    // Generate growth data points
    const maxMonths = Math.max(this.termMonths1(), this.termMonths2());
    const dataPoints1 = this.generateGrowthData(result1, maxMonths);
    const dataPoints2 = this.generateGrowthData(result2, maxMonths);

    // Convert data points to selected currency
    const currency = this.selectedCurrency();
    const currencyService = this.currencyService;
    const convertedDataPoints1 = dataPoints1.map(val => currencyService.convertFromINR(val, currency));
    const convertedDataPoints2 = dataPoints2.map(val => currencyService.convertFromINR(val, currency));

    const labels = Array.from({ length: maxMonths + 1 }, (_, i) => `Month ${i}`);

    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Product 1',
            data: convertedDataPoints1,
            borderColor: '#f6b945',
            backgroundColor: 'rgba(246, 185, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
          },
          {
            label: 'Product 2',
            data: convertedDataPoints2,
            borderColor: '#2be0cc',
            backgroundColor: 'rgba(43, 224, 204, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#f6b945',
            bodyColor: '#ffffff',
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                if (value === null || value === undefined) return '';
                return `${context.dataset.label}: ${currencyService.formatCurrency(value, currency)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              maxTicksLimit: 12
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              callback: function(value) {
                return currencyService.formatCurrency(Number(value), currency);
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(canvas, config);
  }

  private generateGrowthData(result: any, maxMonths: number): number[] {
    const data: number[] = [];
    const principal = result.principal;
    const termMonths = result.termMonths;
    const interestRate = result.interestRate;
    const interestType = result.interestType;

    for (let month = 0; month <= maxMonths; month++) {
      if (month <= termMonths) {
        const termYears = month / 12;
        let amount: number;

        if (interestType === 'COMPOUND') {
          const n = 12;
          amount = principal * Math.pow((1 + (interestRate / 100) / n), n * termYears);
        } else {
          amount = principal * (1 + (interestRate / 100) * termYears);
        }

        data.push(Math.round(amount * 100) / 100);
      } else {
        // After maturity, keep the value constant
        data.push(data[termMonths]);
      }
    }

    return data;
  }

  getDifference(): number {
    const result1 = this.calculationResult1();
    const result2 = this.calculationResult2();
    if (!result1 || !result2) return 0;
    return result2.maturityAmount - result1.maturityAmount;
  }

  getFormattedDifference(): string {
    return this.formatCurrency(this.getDifference());
  }

  getBetterProduct(): string {
    const diff = this.getDifference();
    if (diff > 0) return 'Product 2';
    if (diff < 0) return 'Product 1';
    return 'Equal';
  }

  getPrincipalDifference(): number {
    return this.principal2() - this.principal1();
  }

  getFormattedPrincipalDifference(): string {
    return this.formatCurrency(this.getPrincipalDifference());
  }

  getROI1(): number {
    const result = this.calculationResult1();
    if (!result) return 0;
    return ((result.maturityAmount - result.principal) / result.principal) * 100;
  }

  getROI2(): number {
    const result = this.calculationResult2();
    if (!result) return 0;
    return ((result.maturityAmount - result.principal) / result.principal) * 100;
  }

  getFormattedROI1(): string {
    return this.getROI1().toFixed(2);
  }

  getFormattedROI2(): string {
    return this.getROI2().toFixed(2);
  }

  getAnnualizedReturn1(): number {
    const result = this.calculationResult1();
    if (!result) return 0;
    const years = result.termMonths / 12;
    if (years === 0) return 0;
    const roi = this.getROI1();
    return (Math.pow(1 + roi / 100, 1 / years) - 1) * 100;
  }

  getAnnualizedReturn2(): number {
    const result = this.calculationResult2();
    if (!result) return 0;
    const years = result.termMonths / 12;
    if (years === 0) return 0;
    const roi = this.getROI2();
    return (Math.pow(1 + roi / 100, 1 / years) - 1) * 100;
  }

  getFormattedAnnualizedReturn1(): string {
    return this.getAnnualizedReturn1().toFixed(2);
  }

  getFormattedAnnualizedReturn2(): string {
    return this.getAnnualizedReturn2().toFixed(2);
  }

  getROIDifference(): number {
    return this.getROI2() - this.getROI1();
  }

  getBetterProductByROI(): string {
    const diff = this.getROIDifference();
    if (diff > 0) return 'Product 2';
    if (diff < 0) return 'Product 1';
    return 'Equal';
  }

  getCombinedReturns(): number {
    const result1 = this.calculationResult1();
    const result2 = this.calculationResult2();
    if (!result1 || !result2) return 0;
    return (result1.maturityAmount - result1.principal) + (result2.maturityAmount - result2.principal);
  }

  getFormattedCombinedReturns(): string {
    return this.formatCurrency(this.getCombinedReturns());
  }

  getFormattedTotalInvestment(): string {
    return this.formatCurrency(this.principal1() + this.principal2());
  }

  onCurrencyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCurrency.set(select.value);
    this.updateChart();
  }
}
