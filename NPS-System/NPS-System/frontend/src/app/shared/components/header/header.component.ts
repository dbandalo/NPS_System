import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  template: `
    <header class="header" *ngIf="currentUser$ | async as user">
      <div class="container header-content">
        <div class="logo">
          <h1>Sistema NPS</h1>
        </div>
        <div class="user-info">
          <app-session-timer></app-session-timer>
          <span class="username">{{ user.username }}</span>
          <span class="role-badge" [class]="user.role.toLowerCase()">{{ user.role }}</span>
          <button class="btn btn-secondary btn-sm" (click)="logout()">Cerrar Sesion</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      height: 64px;
      display: flex;
      align-items: center;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .logo h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .username {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      
      &.admin {
        background: #dbeafe;
        color: #1d4ed8;
      }
      
      &.votante {
        background: #dcfce7;
        color: #15803d;
      }
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser$!: Observable<User | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
