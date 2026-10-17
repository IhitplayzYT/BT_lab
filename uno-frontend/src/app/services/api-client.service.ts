import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
      console.log('ApiClientService: Token loaded from localStorage:', !!this.token);
    }
  }

  getToken(): string | null {
    return this.token;
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
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
      console.log('Authorization header set with token:', this.token.substring(0, 20) + '...');
    } else {
      console.warn('No token available for request');
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

  // Product endpoints (banking-product-backend)
  getActiveProducts(type?: string): Observable<any[]> {
    const params = type ? `?type=${type}` : '';
    return this.request(`:8080/api/v1/products/active${params}`);
  }

  getProductByCode(productCode: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}`);
  }

  validateProduct(productCode: string, termMonths?: number, amount?: number, age?: number): Observable<any> {
    let params = '';
    const queryParams = [];
    if (termMonths) queryParams.push(`termMonths=${termMonths}`);
    if (amount) queryParams.push(`amount=${amount}`);
    if (age) queryParams.push(`age=${age}`);
    if (queryParams.length > 0) params = '?' + queryParams.join('&');
    return this.request(`:8080/api/v1/products/${productCode}/validate${params}`);
  }

  calculateRate(productCode: string, termMonths: number, customerCategory: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}/rate`, {
      method: 'POST',
      body: { termMonths, customerCategory }
    });
  }

  // Product management endpoints (ADMIN/BANK_OFFICER only)
  createProduct(productData: any): Observable<any> {
    return this.request(':8080/api/v1/products', {
      method: 'POST',
      body: productData
    });
  }

  updateProduct(productCode: string, productData: any): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}`, {
      method: 'PUT',
      body: productData
    });
  }

  retireProduct(productCode: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}`, {
      method: 'DELETE'
    });
  }

  searchProducts(productType?: string, startDate?: string, endDate?: string, status?: string, page: number = 0, size: number = 50, sortBy: string = 'productId'): Observable<any[]> {
    const queryParams = [];
    if (productType) queryParams.push(`productType=${productType}`);
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    if (status) queryParams.push(`status=${status}`);
    queryParams.push(`page=${page}`);
    queryParams.push(`size=${size}`);
    queryParams.push(`sortBy=${sortBy}`);
    const params = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
    return this.request(`:8080/api/v1/products/search${params}`);
  }

  getProductDefaults(productCode: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}/defaults`);
  }

  // Calculator endpoints
  calculateMaturity(data: any): Observable<any> {
    return this.request(':8080/api/fd/calculate', {
      method: 'POST',
      body: data
    });
  }

  calculateAdvancedMaturity(data: any): Observable<any> {
    return this.request(':8080/api/fd/calculate/advanced', {
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

  applyForFD(data: any): Observable<any> {
    return this.request(':8086/api/fd/account/apply', {
      method: 'POST',
      body: data
    });
  }

  getMyApplications(): Observable<any[]> {
    return this.request(':8086/api/fd/account/my-applications').pipe(
      map((response: any) => {
        // Transform snake_case to camelCase
        return this.snakeToCamel(Array.isArray(response) ? response : []);
      }),
      catchError(error => {
        console.error('Error fetching applications:', error);
        return throwError(() => error);
      })
    );
  }

  // Helper function to convert snake_case to camelCase
  private snakeToCamel(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.snakeToCamel(item));
    if (typeof obj !== 'object') return obj;

    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        newObj[camelKey] = this.snakeToCamel(obj[key]);
      }
    }
    return newObj;
  }

  getAllApplications(): Observable<any[]> {
    return this.request(':8086/api/fd/account/all-applications');
  }

  applyForBundle(data: any): Observable<any> {
    return this.request(':8086/api/fd/account/bundle/apply', {
      method: 'POST',
      body: data
    });
  }

  approveOrRejectBundle(bundleId: string, action: string, rejectionReason?: string): Observable<any> {
    return this.request(`:8086/api/fd/account/bundle/${bundleId}/approve`, {
      method: 'POST',
      body: { action, rejectionReason }
    });
  }

  getPendingBundles(): Observable<any[]> {
    return this.request(':8086/api/fd/account/bundle/pending');
  }

  getMyBundles(): Observable<any[]> {
    return this.request(':8086/api/fd/account/bundle/my-bundles');
  }

  getPendingApplications(): Observable<any[]> {
    return this.request(':8086/api/fd/account/pending');
  }

  approveOrRejectFD(fdAccountNo: string, action: string, rejectionReason?: string): Observable<any> {
    return this.request(':8086/api/fd/account/approve', {
      method: 'POST',
      body: { fdAccountNo, action, rejectionReason }
    });
  }

  getAccount(fdAccountNo: string): Observable<any> {
    return this.request(`:8086/api/fd/account/${fdAccountNo}`);
  }

  // Withdrawal endpoints
  getWithdrawalInquiry(fdAccountNo: string): Observable<any> {
    return this.request(`:8086/api/fd/account/${fdAccountNo}/withdrawal-inquiry`);
  }

  withdrawFD(fdAccountNo: string, reason?: string): Observable<any> {
    return this.request(`:8086/api/fd/account/${fdAccountNo}/withdrawal`, {
      method: 'POST',
      body: reason ? { reason } : {}
    });
  }

  // Clock/Time progression endpoints (Admin only)
  advanceTime(days: number): Observable<any> {
    return this.request(':8086/api/fd/clock/advance', {
      method: 'POST',
      body: { days }
    });
  }

  resetTime(): Observable<any> {
    return this.request(':8086/api/fd/clock/reset', {
      method: 'POST'
    });
  }

  getClockStatus(): Observable<any> {
    return this.request(':8086/api/fd/clock');
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

  // Report endpoints
  getFdSummary(status: string = 'ACTIVE', format: string = 'json'): Observable<any> {
    return this.request(`:8086/api/report/fd-summary?status=${status}&format=${format}`);
  }

  getCustomerPortfolio(customerId?: string, format: string = 'json'): Observable<any> {
    const params = customerId ? `?customerId=${customerId}&format=${format}` : `?format=${format}`;
    return this.request(`:8086/api/report/customer-portfolio${params}`);
  }

  getMaturitySummary(days: number = 30, format: string = 'json'): Observable<any> {
    return this.request(`:8086/api/report/maturity-summary?days=${days}&format=${format}`);
  }

  getInterestHistory(fdAccountNo: string, format: string = 'json'): Observable<any> {
    return this.request(`:8086/api/report/interest-history/${fdAccountNo}?format=${format}`);
  }

  runExtract(businessDate?: string): Observable<any> {
    const params = businessDate ? `?businessDate=${businessDate}` : '';
    return this.request(`:8086/api/report/extract/run${params}`, {
      method: 'POST'
    });
  }

  generatePythonReport(businessDate?: string): Observable<any> {
    const params = businessDate ? `?businessDate=${businessDate}` : '';
    return this.request(`:8086/api/report/python${params}`, {
      method: 'POST'
    });
  }

  // Download report as file
  downloadReport(endpoint: string, filename: string): Observable<Blob> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();
    return this.http.request('GET', url, {
      headers,
      responseType: 'blob'
    });
  }

  downloadFdSummary(status: string = 'ACTIVE', format: string = 'pdf'): Observable<Blob> {
    return this.downloadReport(`:8086/api/report/fd-summary?status=${status}&format=${format}`, `fd-summary-${status}.${format}`);
  }

  downloadCustomerPortfolio(customerId?: string, format: string = 'pdf'): Observable<Blob> {
    const params = customerId ? `?customerId=${customerId}&format=${format}` : `?format=${format}`;
    return this.downloadReport(`:8086/api/report/customer-portfolio${params}`, `customer-portfolio.${format}`);
  }

  downloadMaturitySummary(days: number = 30, format: string = 'pdf'): Observable<Blob> {
    return this.downloadReport(`:8086/api/report/maturity-summary?days=${days}&format=${format}`, `maturity-summary-${days}d.${format}`);
  }

  downloadInterestHistory(fdAccountNo: string, format: string = 'pdf'): Observable<Blob> {
    return this.downloadReport(`:8086/api/report/interest-history/${fdAccountNo}?format=${format}`, `interest-history-${fdAccountNo}.${format}`);
  }

  // Helper method to trigger browser download
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Chart endpoints
  getPortfolioSummary(): Observable<any> {
    return this.request(':8086/api/charts/portfolio-summary');
  }

  getFdSummaryByStatus(status: string): Observable<any> {
    return this.request(`:8086/api/charts/fd-summary/${status}`);
  }

  getMaturityTimeline(): Observable<any> {
    return this.request(':8086/api/charts/maturity-timeline');
  }

  getInterestHistoryChart(fdAccountNo: string): Observable<any> {
    return this.request(`:8086/api/charts/interest-history/${fdAccountNo}`);
  }

  getPortfolioDistribution(): Observable<any> {
    return this.request(':8086/api/charts/portfolio-distribution');
  }
}
