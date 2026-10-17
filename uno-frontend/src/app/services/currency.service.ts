import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Central conversion rates (base: INR)
  private conversionRates: { [key: string]: number } = {
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

  getSupportedCurrencies() {
    return this.supportedCurrencies;
  }

  getCurrencySymbol(currencyCode: string): string {
    return this.currencySymbols[currencyCode] || currencyCode;
  }

  convertToINR(amount: number, fromCurrency: string): number {
    const rate = this.conversionRates[fromCurrency];
    if (!rate) return amount;
    return amount / rate;
  }

  convertFromINR(amount: number, toCurrency: string): number {
    const rate = this.conversionRates[toCurrency];
    if (!rate) return amount;
    return amount * rate;
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    const amountInINR = this.convertToINR(amount, fromCurrency);
    return this.convertFromINR(amountInINR, toCurrency);
  }

  formatCurrency(amount: number, currencyCode: string = 'INR'): string {
    const symbol = this.getCurrencySymbol(currencyCode);
    const locale = this.getLocaleForCurrency(currencyCode);
    return `${symbol}${amount.toLocaleString(locale)}`;
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
