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
    // Skip authorization for currency API (CORS proxy doesn't allow it)
    if (request.url.includes('api.allorigins.win') || request.url.includes('exchangerate-api.com')) {
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
}
