import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    const containsApplicantDetails = /\/api\/fd\/account\/(?:apply(?:-for-user\/[^/?]+)?|bundle\/apply)(?:[/?]|$)/.test(request.url);
    
    console.log('🚀 HTTP Request:', {
      url: request.url,
      method: request.method,
      body: containsApplicantDetails ? '[redacted applicant details]' : request.body,
      headers: request.headers.keys().reduce((acc, key) => {
        acc[key] = request.headers.get(key);
        return acc;
      }, {} as Record<string, string | null>)
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.error('❌ HTTP Error:', {
          url: request.url,
          method: request.method,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          duration: `${duration}ms`
        });
        
        return throwError(() => error);
      })
    );
  }
}
