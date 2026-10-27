import { Injectable, signal, computed } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<any>(null);
  private isAuthenticated = signal(false);
  
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = this.isAuthenticated.asReadonly();
  readonly userRole = computed(() => this.currentUser()?.roles?.[0] || null);

  constructor(
    private apiClient: ApiClientService,
    private router: Router
  ) {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = this.apiClient.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      // Decode JWT to restore user data from token payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const userData = {
          username: payload.sub || payload.username,
          roles: payload.roles || [],
          accessToken: token
        };
        this.currentUser.set(userData);
        console.log('AuthService: User data restored from JWT:', userData);
      } catch (e) {
        console.error('AuthService: Failed to decode JWT:', e);
      }
    }
  }

  async login(username: string, password: string): Promise<any> {
    // A failed account switch must not leave the previous user's token active.
    this.apiClient.clearToken();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    try {
      console.log('AuthService: Calling API login');
      const response = await this.apiClient.login(username, password).toPromise();
      console.log('AuthService: API response received:', response);
      
      if (response?.accessToken) {
        console.log('AuthService: Setting tokens and user data');
        this.apiClient.setToken(response.accessToken);
        this.apiClient.setRefreshToken(response.refreshToken);
        this.currentUser.set(response);
        this.isAuthenticated.set(true);
        console.log('AuthService: Tokens set successfully');
        return response;
      } else {
        console.error('AuthService: No accessToken in response');
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('AuthService: Login error:', error);
      throw error;
    }
  }

  async signup(username: string, password: string, email: string): Promise<any> {
    this.apiClient.clearToken();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    try {
      console.log('AuthService: Calling API signup');
      const response = await this.apiClient.signup(username, password, email).toPromise();
      console.log('AuthService: API response received:', response);
      
      if (response?.accessToken) {
        console.log('AuthService: Setting tokens and user data');
        this.apiClient.setToken(response.accessToken);
        this.apiClient.setRefreshToken(response.refreshToken);
        this.currentUser.set(response);
        this.isAuthenticated.set(true);
        console.log('AuthService: Tokens set successfully');
        return response;
      } else {
        console.error('AuthService: No accessToken in response');
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('AuthService: Signup error:', error);
      throw error;
    }
  }

  async signupWithRole(username: string, password: string, email: string, role: string): Promise<void> {
    this.apiClient.clearToken();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    try {
      const response = await this.apiClient.signupWithRole(username, password, email, role).toPromise();
      
      if (response?.accessToken) {
        this.apiClient.setToken(response.accessToken);
        this.apiClient.setRefreshToken(response.refreshToken);
        this.currentUser.set(response);
        this.isAuthenticated.set(true);
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.apiClient.getRefreshToken();
    
    try {
      if (refreshToken) {
        await this.apiClient.logout(refreshToken).toPromise();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.apiClient.clearToken();
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/']);
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.apiClient.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.apiClient.refreshToken(refreshToken).toPromise();
      
      if (response?.accessToken) {
        this.apiClient.setToken(response.accessToken);
        this.apiClient.setRefreshToken(response.refreshToken);
        this.currentUser.set(response);
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }

    return false;
  }

  hasRole(role: string): boolean {
    const roles = this.currentUser()?.roles || [];
    return roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isBankOfficer(): boolean {
    return this.hasRole('BANK_OFFICER');
  }

  isCustomer(): boolean {
    return this.hasRole('CUSTOMER');
  }

  // Handle OTP-based signup authentication
  authenticateWithTokens(accessToken: string, refreshToken: string, userData: any): void {
    this.apiClient.setToken(accessToken);
    this.apiClient.setRefreshToken(refreshToken);
    this.currentUser.set(userData);
    this.isAuthenticated.set(true);
  }
}
