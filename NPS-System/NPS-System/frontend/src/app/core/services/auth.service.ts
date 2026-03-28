import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse 
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private sessionExpiresAtSubject = new BehaviorSubject<Date | null>(null);
  public sessionExpiresAt$ = this.sessionExpiresAtSubject.asObservable();
  
  private tokenRefreshSubscription?: Subscription;
  private sessionCheckSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
    this.startSessionCheck();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedExpiration = localStorage.getItem('sessionExpiresAt');
    
    if (storedUser && storedExpiration) {
      const expiresAt = new Date(storedExpiration);
      
      if (expiresAt > new Date()) {
        this.currentUserSubject.next(JSON.parse(storedUser));
        this.sessionExpiresAtSubject.next(expiresAt);
        this.startTokenRefresh();
      } else {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.user && response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken || '');
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('sessionExpiresAt', response.expiresAt?.toString() || '');
          
          this.currentUserSubject.next(response.user);
          this.sessionExpiresAtSubject.next(response.expiresAt ? new Date(response.expiresAt) : null);
          
          this.startTokenRefresh();
        }
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const request: RefreshTokenRequest = { refreshToken: refreshToken || '' };
    
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh-token`, request).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken || '');
          localStorage.setItem('sessionExpiresAt', response.expiresAt?.toString() || '');
          
          this.sessionExpiresAtSubject.next(response.expiresAt ? new Date(response.expiresAt) : null);
        } else {
          this.logout();
        }
      })
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (this.getAccessToken()) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        complete: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiresAt');
    
    this.currentUserSubject.next(null);
    this.sessionExpiresAtSubject.next(null);
    
    this.stopTokenRefresh();
    this.router.navigate(['/login']);
  }

  private startTokenRefresh(): void {
    this.stopTokenRefresh();
    
    // Refresh token every 4 minutes (before the 5-minute session expires)
    this.tokenRefreshSubscription = interval(environment.tokenRefreshIntervalSeconds * 1000)
      .subscribe(() => {
        this.refreshToken().subscribe();
      });
  }

  private stopTokenRefresh(): void {
    if (this.tokenRefreshSubscription) {
      this.tokenRefreshSubscription.unsubscribe();
    }
  }

  private startSessionCheck(): void {
    // Check session every second
    this.sessionCheckSubscription = interval(1000).subscribe(() => {
      const expiresAt = this.sessionExpiresAtSubject.value;
      
      if (expiresAt && new Date() >= expiresAt) {
        this.logout();
      }
    });
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem('sessionExpiresAt');
    
    if (!token || !expiresAt) return false;
    
    return new Date(expiresAt) > new Date();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
