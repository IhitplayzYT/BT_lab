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

@Component({
  selector: 'app-fd-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
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
  interestType = signal('COMPOUND');
  productCode = signal('FD_STD_SHORT');

  // Calculation result
  calculationResult = signal<any>(null);
  isCalculating = signal(false);
  error = signal('');

  // Products list
  products = signal<any[]>([]);
  
  // Validation errors
  principalError = '';
  termMonthsError = '';

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
  readonly interestRate = computed(() => {
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
    this.loadProducts();
    this.initializeAnimations();
  }

  private initializeAnimations(): void {
    const container = this.elementRef.nativeElement.querySelector('.calculator-container');
    this.animationService.fadeInOnScroll(container);
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await this.apiClient.getActiveProducts('FD').toPromise();
      this.products.set(products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  validatePrincipal(): void {
    if (!this.validationService.isValidPositiveNumber(this.principal())) {
      this.principalError = 'Principal amount must be a positive number';
    } else if (this.principal() < 1000) {
      this.principalError = 'Minimum amount is ₹1,000';
    } else if (this.principal() > 100000000) {
      this.principalError = 'Maximum amount is ₹10 crore';
    } else {
      this.principalError = '';
    }
  }

  validateTermMonths(): void {
    if (!this.validationService.isValidNumber(this.termMonths())) {
      this.termMonthsError = 'Please enter a valid tenure';
    } else if (this.termMonths() < 6) {
      this.termMonthsError = 'Minimum tenure is 6 months';
    } else if (this.termMonths() > 120) {
      this.termMonthsError = 'Maximum tenure is 120 months (10 years)';
    } else {
      this.termMonthsError = '';
    }
  }

  async calculate(): Promise<void> {
    this.validatePrincipal();
    this.validateTermMonths();

    if (this.principalError || this.termMonthsError) {
      this.error.set('Please fix the errors above');
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
    const interestRate = 8.0; // Default rate for demo
    const interestType = this.interestType();

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

}
