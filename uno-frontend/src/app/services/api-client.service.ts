import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private token: string | null = null;
  private readonly API_BASE_URL = 'http://localhost';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  setToken(token: string): void {
    this.token = token;
    if (this.isBrowser) {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private loadToken(): void {
    if (this.isBrowser) {
      this.token = localStorage.getItem('access_token');
    }
  }

  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  setRefreshToken(refreshToken: string): void {
    if (this.isBrowser) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    return headers;
  }

  private request<T>(endpoint: string, options: any = {}): Observable<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    return this.http.request<T>(options.method || 'GET', url, {
      ...options,
      headers,
      body: options.body,
      observe: 'body',
      responseType: 'json'
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.clearToken();
        }
        return throwError(() => error);
      })
    ) as Observable<T>;
  }

  // Auth endpoints
  login(username: string, password: string): Observable<any> {
    return this.request(':8090/api/auth/login', {
      method: 'POST',
      body: { username, password }
    });
  }

  signup(username: string, password: string, email: string): Observable<any> {
    return this.request(':8090/api/auth/signup', {
      method: 'POST',
      body: { username, password, email }
    });
  }

  signupWithRole(username: string, password: string, email: string, role: string): Observable<any> {
    return this.request(':8090/api/auth/signup', {
      method: 'POST',
      body: { username, password, email, role }
    });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.request(':8090/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    });
  }

  logout(refreshToken: string): Observable<any> {
    return this.request(':8090/api/auth/logout', {
      method: 'POST',
      body: { refreshToken }
    });
  }

  // Product endpoints
  getActiveProducts(type?: string): Observable<any[]> {
    const params = type ? `?type=${type}` : '';
    return this.request(`:8080/api/v1/products/active${params}`);
  }

  getProductByCode(productCode: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}`);
  }

  validateProduct(productCode: string, termMonths?: number, amount?: number, age?: number): Observable<any> {
    let params = new HttpParams();
    if (termMonths) params = params.set('termMonths', termMonths);
    if (amount) params = params.set('amount', amount);
    if (age) params = params.set('age', age);
    return this.request(`:8080/api/v1/products/${productCode}/validate`, { params });
  }

  calculateRate(productCode: string, termMonths: number, customerCategory: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}/rate`, {
      method: 'POST',
      body: { termMonths, customerCategory }
    });
  }

  // Calculator endpoints
  calculateMaturity(data: any): Observable<any> {
    return this.request(':8084/api/v1/fd/calculations', {
      method: 'POST',
      body: data
    });
  }

  compareCalculations(principal: number, options: any[]): Observable<any> {
    return this.request(':8084/api/v1/fd/calculations/compare', {
      method: 'POST',
      body: { principal, options }
    });
  }

  getCalculation(calculationId: string): Observable<any> {
    return this.request(`:8084/api/v1/fd/calculations/${calculationId}`);
  }

  exportCalculation(calculationId: string, format: string = 'csv'): Observable<any> {
    return this.request(`:8084/api/v1/fd/calculations/${calculationId}/export?format=${format}`);
  }

  previewProduct(productCode: string): Observable<any> {
    return this.request(`:8084/api/v1/fd/products/${productCode}/preview`);
  }

  customCalculation(data: any): Observable<any> {
    return this.request(':8084/api/v1/fd/calculations/custom', {
      method: 'POST',
      body: data
    });
  }

  // Account endpoints
  createAccount(data: any): Observable<any> {
    return this.request(':8086/api/fd/account/create', {
      method: 'POST',
      body: data
    });
  }

  getAccount(fdAccountNo: string): Observable<any> {
    return this.request(`:8086/api/fd/account/${fdAccountNo}`);
  }

  createAccountWithTransaction(data: any): Observable<any> {
    return this.request(':8086/api/fd/account/create-with-txn', {
      method: 'POST',
      body: data
    });
  }

  getTransactionHistory(fdAccountNo: string): Observable<any[]> {
    return this.request(`:8086/api/fd/account/${fdAccountNo}/transactions`);
  }

  interestQuote(data: any): Observable<any> {
    return this.request(':8086/api/fd/interest/quote', {
      method: 'POST',
      body: data
    });
  }

  // Integration endpoints (via Account Service)
  getActiveProductsIntegration(type?: string): Observable<any[]> {
    const params = type ? `?type=${type}` : '';
    return this.request(`:8086/api/v1/integration/products/active${params}`);
  }

  calculateMaturityIntegration(productCode: string, principal: number, termMonths: number, interestType: string): Observable<any> {
    return this.request(`:8086/api/v1/integration/calculator/calculate?productCode=${productCode}&principal=${principal}&termMonths=${termMonths}&interestType=${interestType}`);
  }
}
