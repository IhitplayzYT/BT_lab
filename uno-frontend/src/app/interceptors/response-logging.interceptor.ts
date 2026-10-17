import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseLoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    
    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event.type === 4) { // HttpResponse
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log('✅ HTTP Response:', {
              url: request.url,
              method: request.method,
              status: (event as any).status,
              statusText: (event as any).statusText,
              body: (event as any).body,
              duration: `${duration}ms`
            });
          }
        }
      })
    );
  }
}
