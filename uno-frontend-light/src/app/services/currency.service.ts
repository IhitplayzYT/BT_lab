import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Fallback conversion rates (base: INR) - used if API fails
  private fallbackRates: { [key: string]: number } = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AUD: 0.018,
    CAD: 0.016,
    SGD: 0.016,
    JPY: 1.78,
    AED: 0.044,
    SAR: 0.045
  };

  // Live conversion rates (base: INR)
  private conversionRates = signal<{ [key: string]: number }>(this.fallbackRates);
  private lastUpdated = signal<Date | null>(null);
  private apiError = signal<string | null>(null);
  readonly preferredCurrency = signal('INR');

  // Currency symbols
  private currencySymbols: { [key: string]: string } = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    JPY: '¥',
    AED: 'د.إ',
    SAR: '﷼'
  };

  // Supported currencies
  private supportedCurrencies = [
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', name: 'Saudi Riyal' }
  ];

  private readonly API_URL = 'https://api.frankfurter.dev/v1/latest?base=INR';

  constructor(private http: HttpClient) {
    // Delay initial fetch to ensure app is fully loaded
    timer(1000).subscribe(() => this.fetchLiveRates());
    // Refresh rates every hour
    timer(3600000, 3600000).subscribe(() => this.fetchLiveRates());
  }

  getSupportedCurrencies() {
    return this.supportedCurrencies;
  }

  setPreferredCurrency(currencyCode: string): void {
    if (this.supportedCurrencies.some(currency => currency.code === currencyCode)) {
      this.preferredCurrency.set(currencyCode);
    }
  }

  formatPreferredCurrency(amountInINR: number): string {
    const amount = Number.isFinite(Number(amountInINR)) ? Number(amountInINR) : 0;
    const currencyCode = this.preferredCurrency();
    return this.formatCurrency(this.convertFromINR(amount, currencyCode), currencyCode);
  }

  formatPreferredCurrencyRaw(amountInINR: number): string {
    const amount = Number.isFinite(Number(amountInINR)) ? Number(amountInINR) : 0;
    const currencyCode = this.preferredCurrency();
    return this.formatCurrencyRaw(this.convertFromINR(amount, currencyCode), currencyCode);
  }

  getCurrencySymbol(currencyCode: string): string {
    return this.currencySymbols[currencyCode] || currencyCode;
  }

  getConversionRates() {
    return this.conversionRates();
  }

  getLastUpdated() {
    return this.lastUpdated();
  }

  getApiError() {
    return this.apiError();
  }

  private fetchLiveRates(): void {
    this.http.get<any>(this.API_URL).pipe(
        map(response => {
          const rates: { [key: string]: number } = {};
          // Convert from API (base INR) to our format
          // Frankfurter API returns: { amount: 1.0, base: "INR", date: "2024-01-01", rates: { "USD": 0.012, ... } }
          for (const currency of this.supportedCurrencies) {
            if (response.rates && response.rates[currency.code]) {
              rates[currency.code] = response.rates[currency.code];
            } else {
              // Use fallback rate if currency not available in API
              rates[currency.code] = this.fallbackRates[currency.code];
            }
          }
          this.conversionRates.set(rates);
          this.lastUpdated.set(new Date());
          this.apiError.set(null);
          return rates;
        }),
        catchError(error => {
          console.error('Failed to fetch live rates, using fallback:', error);
          this.apiError.set('Using fallback rates - API unavailable');
          this.conversionRates.set(this.fallbackRates);
          return of(this.fallbackRates);
        })
      )
      .subscribe();
  }

  convertToINR(amount: number, fromCurrency: string): number {
    const rate = this.conversionRates()[fromCurrency];
    if (!rate || isNaN(rate) || rate === 0) return amount;
    const result = amount / rate;
    return isNaN(result) ? amount : result;
  }

  convertFromINR(amount: number, toCurrency: string): number {
    const rate = this.conversionRates()[toCurrency];
    if (!rate || isNaN(rate) || rate === 0) return amount;
    const result = amount * rate;
    return isNaN(result) ? amount : result;
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    const amountInINR = this.convertToINR(amount, fromCurrency);
    return this.convertFromINR(amountInINR, toCurrency);
  }

  formatCurrency(amount: number, currencyCode: string = 'INR'): string {
    const symbol = this.getCurrencySymbol(currencyCode);
    const locale = this.getLocaleForCurrency(currencyCode);
    const decimals = this.getDecimalPlaces(currencyCode);
    // Ensure trailing zeros are preserved and proper decimal formatting
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    });
    return `${symbol}${formatted}`;
  }

  formatCurrencyRaw(amount: number, currencyCode: string = 'INR'): string {
    // Format without symbol, for use in calculations or comparisons
    const locale = this.getLocaleForCurrency(currencyCode);
    const decimals = this.getDecimalPlaces(currencyCode);
    return amount.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    });
  }

  parseCurrency(value: string): number {
    // Parse a formatted currency string back to a number
    return parseFloat(value.replace(/[^0-9.-]/g, ''));
  }

  private getDecimalPlaces(currencyCode: string): number {
    // Most currencies use 2 decimal places, JPY uses 0
    const decimalMap: { [key: string]: number } = {
      INR: 2,
      USD: 2,
      EUR: 2,
      GBP: 2,
      AUD: 2,
      CAD: 2,
      SGD: 2,
      JPY: 0,  // Japanese Yen has no decimal places
      AED: 2,
      SAR: 2
    };
    return decimalMap[currencyCode] || 2;
  }

  private getLocaleForCurrency(currencyCode: string): string {
    const localeMap: { [key: string]: string } = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      AUD: 'en-AU',
      CAD: 'en-CA',
      SGD: 'en-SG',
      JPY: 'ja-JP',
      AED: 'ar-AE',
      SAR: 'ar-SA'
    };
    return localeMap[currencyCode] || 'en-IN';
  }
}
