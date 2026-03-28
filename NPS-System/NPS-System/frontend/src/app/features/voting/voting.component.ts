import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VoteService } from '../../core/services/vote.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-voting',
  template: `
    <div class="voting-container">
      <div class="voting-card card" *ngIf="!hasVoted && !voteSubmitted">
        <div class="voting-header">
          <h2 class="nps-question">En una escala del 0 al 10, que tan probable es que recomiende nuestros servicios a un amigo o colega?</h2>
        </div>
        
        <div class="alert alert-danger" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="voteForm" (ngSubmit)="onSubmit()">
          <div class="score-selector">
            <button 
              type="button"
              *ngFor="let score of scores"
              class="score-btn"
              [class.selected]="selectedScore === score"
              [class.detractor]="score <= 6"
              [class.passive]="score >= 7 && score <= 8"
              [class.promoter]="score >= 9"
              (click)="selectScore(score)">
              {{ score }}
            </button>
          </div>
          
          <div class="score-labels">
            <span class="label-left">Nada probable</span>
            <span class="label-right">Muy probable</span>
          </div>
          
          <div class="form-group">
            <label for="comment">Comentario (opcional)</label>
            <textarea 
              id="comment" 
              formControlName="comment"
              rows="3"
              placeholder="Cuentenos mas sobre su experiencia..."></textarea>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            [disabled]="selectedScore === null || isLoading">
            {{ isLoading ? 'Enviando...' : 'Enviar Voto' }}
          </button>
        </form>
      </div>
      
      <div class="thank-you-card card" *ngIf="hasVoted || voteSubmitted">
        <div class="thank-you-icon">&#10003;</div>
        <h2>Gracias por su voto!</h2>
        <p>Su opinion es muy importante para nosotros.</p>
        <p class="vote-info" *ngIf="voteSubmitted">
          Usted califico con <strong>{{ selectedScore }}</strong> puntos.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .voting-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    
    .voting-card, .thank-you-card {
      width: 100%;
      max-width: 600px;
    }
    
    .voting-header {
      margin-bottom: 2rem;
    }
    
    .nps-question {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      text-align: center;
      line-height: 1.5;
    }
    
    .score-selector {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    
    .score-btn {
      width: 48px;
      height: 48px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      background: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.1);
      }
      
      &.selected {
        transform: scale(1.1);
        
        &.detractor {
          background: #fef2f2;
          border-color: #ef4444;
          color: #ef4444;
        }
        
        &.passive {
          background: #fffbeb;
          border-color: #f59e0b;
          color: #f59e0b;
        }
        
        &.promoter {
          background: #f0fdf4;
          border-color: #22c55e;
          color: #22c55e;
        }
      }
    }
    
    .score-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      
      span {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
    }
    
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      resize: vertical;
      font-family: inherit;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
    
    .btn-full {
      width: 100%;
      margin-top: 1rem;
    }
    
    .thank-you-card {
      text-align: center;
      padding: 3rem;
      
      .thank-you-icon {
        width: 80px;
        height: 80px;
        background: #f0fdf4;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: #22c55e;
        margin: 0 auto 1.5rem;
      }
      
      h2 {
        font-size: 1.5rem;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--text-secondary);
      }
      
      .vote-info {
        margin-top: 1rem;
        font-size: 1rem;
      }
    }
  `]
})
export class VotingComponent implements OnInit {
  voteForm!: FormGroup;
  scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedScore: number | null = null;
  isLoading = false;
  hasVoted = false;
  voteSubmitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private voteService: VoteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.voteForm = this.fb.group({
      comment: ['', [Validators.maxLength(500)]]
    });
    
    // Check if user has already voted
    const user = this.authService.getCurrentUser();
    if (user?.hasVoted) {
      this.hasVoted = true;
    }
  }

  selectScore(score: number): void {
    this.selectedScore = score;
  }

  onSubmit(): void {
    if (this.selectedScore === null) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const vote = {
      score: this.selectedScore,
      comment: this.voteForm.get('comment')?.value || undefined
    };
    
    this.voteService.createVote(vote).subscribe({
      next: () => {
        this.voteSubmitted = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al enviar el voto';
        this.isLoading = false;
      }
    });
  }
}
