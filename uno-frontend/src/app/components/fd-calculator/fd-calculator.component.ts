import { Component, inject, signal, computed, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { AnimationService } from '../../services/animation.service';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-fd-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fd-calculator.component.html',
  styleUrls: ['./fd-calculator.component.scss']
})
export class FdCalculatorComponent implements AfterViewInit {
  private apiClient = inject(ApiClientService);
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);
  private validationService = inject(ValidationService);

  // Form inputs
  principal = signal(100000);
  termMonths = signal(12);
  interestType = signal('COMPOUND');
  productCode = signal('FD001');

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
    return result ? result.interestRate : 0;
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
    } else if (this.termMonths() < 1) {
      this.termMonthsError = 'Minimum tenure is 1 month';
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
      const result = await this.apiClient.calculateMaturity({
        productCode: this.productCode(),
        principal: this.principal(),
        termMonths: this.termMonths(),
        interestType: this.interestType()
      }).toPromise();

      this.calculationResult.set(result);
      
      // Animate the result
      this.animateResult();
    } catch (error: any) {
      this.error.set(error.error?.message || 'Failed to calculate. Please try again.');
    } finally {
      this.isCalculating.set(false);
    }
  }

  private animateResult(): void {
    const resultElement = this.elementRef.nativeElement.querySelector('.calculator-result');
    if (resultElement) {
      this.animationService.clipPathReveal(resultElement, 'up');
    }
  }

}
