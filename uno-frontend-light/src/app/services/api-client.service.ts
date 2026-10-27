import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
      // Save to both localStorage and sessionStorage for redundancy
      localStorage.setItem('access_token', token);
      sessionStorage.setItem('access_token', token);
      console.log('ApiClientService: Token saved to localStorage and sessionStorage');
    }
  }

  clearToken(): void {
    this.token = null;
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Legacy shared profile data has no trustworthy owner; never carry it across sessions.
      localStorage.removeItem('default_fd_details');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
  }

  loadToken(): void {
    if (this.isBrowser) {
      // Try localStorage first, then sessionStorage as fallback
      let storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        storedToken = sessionStorage.getItem('access_token');
        if (storedToken) {
          console.log('ApiClientService: Token found in sessionStorage (localStorage was empty)');
          // Restore to localStorage
          localStorage.setItem('access_token', storedToken);
        }
      }
      
      console.log('ApiClientService: Checking storage for token...');
      console.log('  - localStorage access_token exists:', !!localStorage.getItem('access_token'));
      console.log('  - sessionStorage access_token exists:', !!sessionStorage.getItem('access_token'));
      this.token = storedToken;
      console.log('ApiClientService: Token loaded:', !!this.token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  /** A stable browser-storage namespace for the account represented by the current JWT. */
  getUserStorageKey(key: string): string {
    let identity = 'anonymous';
    let userId = '';
    try {
      const token = this.token || (this.isBrowser ? localStorage.getItem('access_token') : null);
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        identity = String(payload.sub || payload.username || payload.userId || payload.user_id || '');
        userId = String(payload.userId || payload.user_id || payload.id || '');
        if (!identity) identity = token;
      }
    } catch {
      // Opaque or malformed tokens still receive an isolated namespace.
      identity = this.token || 'anonymous';
    }
    const normalized = identity.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'anonymous';
    const normalizedUserId = userId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    // Include userId in key to prevent data leakage between users with same username
    return `${key}:${normalizedUserId ? normalized + '_' + normalizedUserId : normalized}`;
  }

  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    }
    return null;
  }

  setRefreshToken(refreshToken: string): void {
    if (this.isBrowser) {
      localStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('refresh_token', refreshToken);
    }
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
      console.log('Authorization header attached');
    } else {
      console.warn('No token available for request');
    }

    return headers;
  }

  private request<T>(endpoint: string, options: any = {}): Observable<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    const method = (options.method || 'GET').toUpperCase();
    return this.http.request<T>(method, url, {
      ...options,
      headers,
      body: options.body,
      observe: 'body',
      responseType: 'json'
    }).pipe(
      tap(response => this.auditSuccessfulOperation(endpoint, method, options.body, response)),
      catchError(error => {
        // Only clear token on 401 if it's a login/auth endpoint, not for other services
        if (error.status === 401 && error.url?.includes('/api/auth/')) {
          console.warn('Auth 401 error - clearing token');
          this.clearToken();
        }
        return throwError(() => error);
      })
    ) as Observable<T>;
  }

  private auditSuccessfulOperation(endpoint: string, method: string, body: any, response: any): void {
    if (!this.isBrowser || !this.token || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

    const path = endpoint.split('?')[0];
    const segments = path.split('/').filter(Boolean).map(segment => {
      try { return decodeURIComponent(segment); } catch { return segment; }
    });
    let operationType = '';
    let targetType = '';
    let targetId = '';

    if (path.startsWith(':8090/api/auth/admin/users')) {
      targetType = 'USER';
      targetId = body?.username || segments[segments.length - 1] || '';
      if (method === 'POST' && segments.length === 5) operationType = 'USER_CREATED';
      else if (method === 'DELETE') operationType = 'USER_DELETED';
      else if (method === 'PUT' && path.endsWith('/roles')) operationType = 'USER_ROLE_UPDATED';
      else if (method === 'PUT' && path.endsWith('/ban')) operationType = 'USER_DEACTIVATED';
      else if (method === 'PUT' && path.endsWith('/unban')) operationType = 'USER_REACTIVATED';
      if (path.endsWith('/roles') || path.endsWith('/ban') || path.endsWith('/unban')) targetId = segments[segments.length - 2] || targetId;
    } else if (path.startsWith(':8080/api/v1/products')) {
      targetType = 'PRODUCT';
      targetId = body?.productCode || segments[segments.length - 1] || '';
      if (method === 'POST' && segments.length === 4) operationType = 'PRODUCT_CREATED';
      else if (method === 'DELETE' && path.endsWith('/permanent')) {
        operationType = 'PRODUCT_DELETED';
        targetId = segments[segments.length - 2] || targetId;
      } else if (method === 'DELETE') operationType = 'PRODUCT_RETIRED';
      else if (method === 'PUT' && body?.status === 'ACTIVE') operationType = 'PRODUCT_REACTIVATED';
      else if (method === 'PUT') operationType = 'PRODUCT_UPDATED';
    } else if (path === ':8086/api/fd/account/approve' && method === 'POST') {
      targetType = 'FD_APPLICATION';
      targetId = body?.fdAccountNo || '';
      operationType = String(body?.action).toUpperCase() === 'REJECT' ? 'FD_APPLICATION_REJECTED' : 'FD_APPLICATION_APPROVED';
    } else if (path === ':8086/api/fd/account/create' || path === ':8086/api/fd/account/create-with-txn') {
      targetType = 'FD_ACCOUNT';
      targetId = response?.fdAccountNo || response?.accountNo || '';
      operationType = 'FD_ACCOUNT_CREATED';
    } else if (path === ':8086/api/fd/account/apply' && method === 'POST') {
      targetType = 'FD_APPLICATION';
      targetId = response?.fdAccountNo || '';
      operationType = 'FD_APPLICATION_SUBMITTED';
    } else if (path.startsWith(':8086/api/fd/account/apply-for-user/') && method === 'POST') {
      targetType = 'FD_APPLICATION';
      targetId = response?.fdAccountNo || '';
      operationType = 'FD_APPLICATION_SUBMITTED_BY_OFFICER';
    } else if (path === ':8086/api/fd/account/bundle/apply' && method === 'POST') {
      targetType = 'FD_BUNDLE';
      targetId = response?.bundleId || '';
      operationType = 'FD_BUNDLE_SUBMITTED';
    } else if (path.includes('/api/fd/account/bundle/') && path.endsWith('/approve') && method === 'POST') {
      targetType = 'FD_BUNDLE';
      targetId = segments[segments.length - 2] || '';
      operationType = String(body?.action).toUpperCase() === 'REJECT' ? 'FD_BUNDLE_REJECTED' : 'FD_BUNDLE_APPROVED';
    } else if (/\/api\/fd\/account\/[^/]+\/withdrawal$/.test(path) && method === 'POST') {
      targetType = 'FD_ACCOUNT';
      targetId = segments[segments.length - 2] || '';
      operationType = 'FD_PREMATURE_WITHDRAWAL';
    } else if (path === ':8086/api/fd/clock/advance' && method === 'POST') {
      targetType = 'BUSINESS_CLOCK';
      targetId = String(body?.days ?? '');
      operationType = 'BUSINESS_TIME_ADVANCED';
    } else if (path === ':8086/api/fd/clock/reset' && method === 'POST') {
      targetType = 'BUSINESS_CLOCK';
      targetId = 'business-date';
      operationType = 'BUSINESS_TIME_RESET';
    } else if (/\/api\/fd\/interest\/[^/]+\/settings$/.test(path) && method === 'PUT') {
      targetType = 'FD_ACCOUNT';
      targetId = segments[segments.length - 2] || '';
      operationType = 'INTEREST_SETTINGS_UPDATED';
    } else if (path.startsWith(':8086/api/report/extract/run') && method === 'POST') {
      targetType = 'REPORT';
      targetId = 'fd-extract';
      operationType = 'REPORT_EXTRACT_RUN';
    } else if (path.startsWith(':8086/api/report/python') && method === 'POST') {
      targetType = 'REPORT';
      targetId = 'python-report';
      operationType = 'REPORT_GENERATED';
    }

    // The log endpoint is intentionally not routed through request(), so it cannot recurse.
    if (!operationType) return;
    const summary = `${operationType.replaceAll('_', ' ')}${targetId ? `: ${targetId}` : ''}`;
    this.http.post(`${this.API_BASE_URL}:8086/api/admin/operation-logs`, {
      operationType,
      targetType,
      targetId: targetId || null,
      summary
    }, { headers: this.getHeaders() }).subscribe({
      error: error => console.warn('Could not write operation audit log:', error.status)
    });
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
    return this.request(`:8080/api/v1/products/active${params}`).pipe(
      map((response: any) => {
        // Transform snake_case to camelCase
        return this.snakeToCamel(Array.isArray(response) ? response : []);
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
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

  calculateRate(productCode: string, termMonths: number, customerCategory: string, amount?: number, age?: number): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}/rate`, {
      method: 'POST',
      body: { termMonths, customerCategory, amount, age }
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

  permanentlyDeleteProduct(productCode: string): Observable<any> {
    return this.request(`:8080/api/v1/products/${productCode}/permanent`, {
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

  getCustomerSummary(customerId: string): Observable<any> {
    return this.request(`:8086/api/fd/account/customers/${encodeURIComponent(customerId)}`);
  }

  getStaffUsers(): Observable<any> {
    return this.request(':8090/api/auth/staff/users');
  }

  getCurrentUser(): Observable<any> {
    return this.request(':8090/api/auth/me');
  }

  applyForCustomerFD(userId: string, data: any): Observable<any> {
    return this.request(`:8086/api/fd/account/apply-for-user/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: data
    });
  }

  updateCustomerCategory(customerCategory: string): Observable<any> {
    return this.request(':8086/api/fd/account/profile/category', {
      method: 'PUT',
      body: { customerCategory }
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

  getMyCustomerIdentity(): Observable<any> {
    return this.request(':8086/api/fd/account/profile');
  }

  withdrawApplication(fdAccountNo: string): Observable<any> {
    return this.request(`:8086/api/fd/account/${fdAccountNo}/withdraw`, {
      method: 'POST'
    });
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

  getInterestAccounts(): Observable<any[]> {
    return this.request(':8086/api/fd/interest/accounts');
  }

  getMyInterestAccounts(): Observable<any[]> {
    return this.request(':8086/api/fd/interest/mine');
  }

  updateInterestMode(account: string, mode: string): Observable<any> {
    return this.request(`:8086/api/fd/interest/${encodeURIComponent(account)}/settings`, {
      method: 'PUT', body: { mode }
    });
  }

  getNotificationLogs(limit = 100, offset = 0): Observable<any[]> {
    const boundedLimit = Math.min(Math.max(limit, 1), 200);
    const boundedOffset = Math.max(Math.floor(offset), 0);
    return this.request(`:8083/api/notifications?limit=${boundedLimit}&offset=${boundedOffset}`);
  }

  getStatementSummary(): Observable<any> {
    return this.request(':8082/api/statements/summary/all');
  }

  getAccountStatements(account: string): Observable<any[]> {
    return this.request(`:8082/api/statements/${encodeURIComponent(account)}`);
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
    const params = businessDate ? `?date=${encodeURIComponent(businessDate)}` : '';
    return this.request(`:8086/api/report/extract/run${params}`, {
      method: 'POST'
    });
  }

  generatePythonReport(businessDate?: string): Observable<any> {
    const params = businessDate ? `?date=${encodeURIComponent(businessDate)}` : '';
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

  downloadInterestReport(format: string = 'pdf'): Observable<Blob> {
    return this.downloadReport(`:8086/api/report/interest-report?format=${format}`, `interest-report.${format}`);
  }

  downloadTransactionReport(format: string = 'xlsx'): Observable<Blob> {
    return this.downloadReport(`:8086/api/report/transaction-report?format=${format}`, `transaction-report.${format}`);
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

  getPortfolioDistribution(): Observable<any> {
    return this.request(':8086/api/charts/portfolio-distribution');
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

  // Admin user management endpoints
  getAllUsers(): Observable<any> {
    return this.request(':8090/api/auth/admin/users');
  }

  getOperationLogs(filters: Record<string, string | number | null | undefined>): Observable<any> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        params.set(key, String(value));
      }
    }
    return this.request(`:8086/api/admin/operation-logs?${params.toString()}`);
  }

  createUser(username: string, password: string, email: string, roles: string[]): Observable<any> {
    return this.request(':8090/api/auth/admin/users', {
      method: 'POST',
      body: { username, password, email, roles }
    });
  }

  updateUserRoles(username: string, roles: string[]): Observable<any> {
    return this.request(`:8090/api/auth/admin/users/${username}/roles`, {
      method: 'PUT',
      body: { roles }
    });
  }

  banUser(username: string): Observable<any> {
    return this.request(`:8090/api/auth/admin/users/${encodeURIComponent(username)}/ban`, {
      method: 'PUT'
    });
  }

  unbanUser(username: string): Observable<any> {
    return this.request(`:8090/api/auth/admin/users/${encodeURIComponent(username)}/unban`, {
      method: 'PUT'
    });
  }

  deleteUser(username: string): Observable<any> {
    return this.request(`:8090/api/auth/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
  }

  // Journal endpoints (Bank Officer only)
  getJournalAll(page: number = 0, size: number = 100): Observable<any[]> {
    return this.request(`:8086/api/fd/journal/all?page=${page}&size=${size}`);
  }

  getJournalByType(txnType: string, page: number = 0, size: number = 100): Observable<any[]> {
    return this.request(`:8086/api/fd/journal/by-type?txnType=${txnType}&page=${page}&size=${size}`);
  }

  getJournalSummary(): Observable<any> {
    return this.request(':8086/api/fd/journal/summary');
  }

  // Ledger endpoints (Bank Officer only)
  searchLedgerByName(name: string, page: number = 0, size: number = 50): Observable<any[]> {
    return this.request(`:8086/api/fd/ledger/search-by-name?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
  }

  searchLedgerById(customerId: string, page: number = 0, size: number = 50): Observable<any[]> {
    return this.request(`:8086/api/fd/ledger/search-by-id?customerId=${encodeURIComponent(customerId)}&page=${page}&size=${size}`);
  }

  getAllLedgerAccounts(page: number = 0, size: number = 50): Observable<any[]> {
    return this.request(`:8086/api/fd/ledger/all?page=${page}&size=${size}`);
  }

  getAccountLedger(fdAccountNo: string): Observable<any[]> {
    return this.request(`:8086/api/fd/ledger/${encodeURIComponent(fdAccountNo)}/transactions`);
  }

  getAccountDetails(fdAccountNo: string): Observable<any> {
    return this.request(`:8086/api/fd/ledger/${fdAccountNo}`);
  }
}
