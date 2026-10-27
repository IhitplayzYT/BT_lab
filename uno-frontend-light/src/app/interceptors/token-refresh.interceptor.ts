import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from '../services/api-client.service';

@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
  constructor(private apiClient: ApiClientService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Public currency-rate APIs do not need the application's bearer token.
    // Keeping this request anonymous also avoids an unnecessary CORS preflight.
    const requestHost = this.getRequestHost(request.url);
    if (
      requestHost === 'api.allorigins.win' ||
      requestHost === 'exchangerate-api.com' ||
      requestHost.endsWith('.exchangerate-api.com') ||
      requestHost === 'api.frankfurter.app' ||
      requestHost === 'api.frankfurter.dev'
    ) {
      return next.handle(request);
    }

    // Ensure token is loaded before each request
    this.apiClient.loadToken();

    // Clone the request with updated headers
    const token = this.apiClient.getToken();
    if (token && !request.headers.has('Authorization')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }

  private getRequestHost(url: string): string {
    try {
      return new URL(url, 'http://localhost').hostname.toLowerCase();
    } catch {
      return '';
    }
  }
}
