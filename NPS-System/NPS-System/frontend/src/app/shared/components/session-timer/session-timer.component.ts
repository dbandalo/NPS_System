import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-session-timer',
  template: `
    <div class="session-timer" [class.warning]="remainingSeconds < 60">
      <span class="timer-icon">&#9202;</span>
      <span class="timer-text">{{ formatTime(remainingSeconds) }}</span>
    </div>
  `,
  styles: [`
    .session-timer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      
      &.warning {
        background: #fef2f2;
        color: #dc2626;
        animation: pulse 1s infinite;
      }
    }
    
    .timer-icon {
      font-size: 1rem;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class SessionTimerComponent implements OnInit, OnDestroy {
  remainingSeconds: number = 0;
  private subscription?: Subscription;
  private timerSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.sessionExpiresAt$.subscribe(expiresAt => {
      if (expiresAt) {
        this.updateRemainingTime(expiresAt);
        this.startTimer(expiresAt);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
  }

  private updateRemainingTime(expiresAt: Date): void {
    const now = new Date();
    this.remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
  }

  private startTimer(expiresAt: Date): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateRemainingTime(expiresAt);
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
