import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class SessionTimeoutInterceptor implements HttpInterceptor, OnDestroy {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private activitySub: Subscription | null = null;
  private readonly idleMs = environment.sessionTimeoutMinutes * 60 * 1000;

  constructor(
    private auth: AuthService,
    private zone: NgZone
  ) {
    this.startListening();
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.resetTimer();
    return next.handle(req);
  }

  private startListening(): void {
    this.zone.runOutsideAngular(() => {
      const activity$ = merge(
        fromEvent(document, 'click'),
        fromEvent(document, 'keyup'),
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'touchstart')
      );
      this.activitySub = activity$.subscribe(() => this.resetTimer());
      this.resetTimer();
    });
  }

  private resetTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.zone.run(() => {
        if (this.auth.getAccessToken()) {
          this.auth.logout();
        }
      });
    }, this.idleMs);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.activitySub?.unsubscribe();
  }
}
