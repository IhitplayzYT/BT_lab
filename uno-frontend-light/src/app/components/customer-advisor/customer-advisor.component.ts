import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiClientService } from '../../services/api-client.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-customer-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-advisor.component.html',
  styleUrl: './customer-advisor.component.scss',
})
export class CustomerAdvisorComponent implements OnInit {
  @Input() portfolio: any[] = [];
  @Input() products: any[] = [];

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiClient = inject(ApiClientService);
  readonly currencyService = inject(CurrencyService);
  private readonly endpoint = 'http://127.0.0.1:8091';

  readonly available = signal(false);
  readonly checking = signal(true);
  readonly asking = signal(false);
  readonly recommendation = signal('');
  readonly error = signal('');

  goal = 'growth';
  amount: number | null = null;
  horizonMonths = 12;
  liquidityPreference = 'no_preference';
  requirements = '';

  ngOnInit(): void {
    this.checkAvailability();
  }

  checkAvailability(): void {
    this.checking.set(true);
    this.error.set('');
    if (!this.auth.hasRole('CUSTOMER')) {
      this.checking.set(false);
      return;
    }
    this.http.get(`${this.endpoint}/health`).pipe(timeout(5000)).subscribe({
      next: () => { this.available.set(true); this.checking.set(false); },
      error: () => { this.available.set(false); this.checking.set(false); },
    });
  }

  requestAdvice(): void {
    if (!this.auth.hasRole('CUSTOMER') || !this.available() || this.asking() || this.amount === null || this.amount < 0) return;
    const token = this.apiClient.getToken();
    if (!token) {
      this.error.set('Your sign-in session has expired. Please sign in again before requesting advice.');
      return;
    }
    this.asking.set(true);
    this.error.set('');
    this.recommendation.set('');

    const payload = {
      goal: this.goal,
      amount: this.currencyService.convertToINR(Number(this.amount), this.currencyService.preferredCurrency()),
      horizon_months: Number(this.horizonMonths),
      liquidity_preference: this.liquidityPreference,
      requirements: this.requirements.trim(),
      products: this.products.slice(0, 40).map(product => ({
        code: String(product.productCode || '').slice(0, 40),
        name: String(product.productName || '').slice(0, 100),
        currency: String(product.currency || 'INR').slice(0, 8),
        min_deposit: this.numberOr(product.minDeposit, 0),
        max_deposit: product.maxDeposit == null ? null : this.numberOr(product.maxDeposit, 0),
        min_months: this.numberOr(product.termLimit?.min, 1),
        max_months: this.numberOr(product.termLimit?.max, 1200),
        min_rate: this.numberOr(product.rateLimit?.min, 0),
        max_rate: this.numberOr(product.rateLimit?.max, 0),
        min_age: product.minAge == null ? null : this.numberOr(product.minAge, 0),
        interest_type: String(product.interestType || '').slice(0, 40),
      })),
      portfolio: this.portfolio.slice(0, 100).map(holding => ({
        product_code: String(holding.productCode || '').slice(0, 40),
        currency: String(holding.currency || 'INR').slice(0, 8),
        principal_amount: this.numberOr(holding.principalAmount, 0),
        tenure_months: holding.tenureMonths == null ? null : this.numberOr(holding.tenureMonths, 0),
        interest_rate: holding.interestRate == null ? null : this.numberOr(holding.interestRate, 0),
        status: String(holding.status || '').slice(0, 40),
        maturity_date: holding.maturityDate ? String(holding.maturityDate).slice(0, 20) : null,
      })),
    };

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post<{ reply: string }>(`${this.endpoint}/api/assistant/advisor`, payload, { headers }).pipe(timeout(55000)).subscribe({
      next: result => { this.recommendation.set(result.reply); this.asking.set(false); },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 401
          ? 'Your sign-in session has expired. Please sign in again before requesting advice.'
          : error.status === 403
            ? 'This advisor is available to customer accounts only.'
            : error.status === 422
              ? 'Some portfolio or product details could not be read. Refresh the dashboard and try again.'
              : error.status === 503 || error.status === 0
                ? 'The advisor service is temporarily unavailable. Your portfolio and goal were not saved; please try again later.'
                : 'I could not prepare a recommendation from the current details. Please review the inputs and try again.');
        if (error.status === 503 || error.status === 0) this.available.set(false);
        this.asking.set(false);
      },
    });
  }

  getMaxInvestmentAmount(): number {
    return this.currencyService.convertFromINR(100000000000, this.currencyService.preferredCurrency());
  }

  private numberOr(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
