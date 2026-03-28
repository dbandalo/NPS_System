import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  private refresh$: Observable<string> | null = null;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isAuthRequest(req.url)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401) {
          return throwError(() => err);
        }

        const refreshTok = localStorage.getItem('refreshToken');
        if (!refreshTok) {
          return throwError(() => err);
        }

        return this.getNewAccessToken().pipe(
          switchMap(token => next.handle(this.addToken(req, token))),
          catchError(() => throwError(() => err))
        );
      })
    );
  }

  private getNewAccessToken(): Observable<string> {
    if (!this.refresh$) {
      this.refresh$ = this.auth.refreshAccessToken().pipe(
        finalize(() => {
          this.refresh$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.refresh$;
  }

  private isAuthRequest(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/refresh-token') || url.includes('/auth/logout');
  }

  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
}
