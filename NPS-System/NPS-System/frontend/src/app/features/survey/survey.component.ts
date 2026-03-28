import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VoteService } from '../../core/services/vote.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-survey',
  template: `
    <div class="survey-wrapper" *ngIf="pageLoading">
      <div class="survey-card">
        <p class="survey-loading">Cargando...</p>
      </div>
    </div>

    <div class="survey-wrapper" *ngIf="!pageLoading && hasVoted && !voteSubmitted">
      <div class="survey-card survey-card--done">
        <div class="survey-done__icon" aria-hidden="true">&#9989;</div>
        <h2 class="survey-done__title">¡Ya registraste tu voto!</h2>
        <p class="survey-done__text">
          Gracias por participar<span *ngIf="username">, {{ username }}</span>. Tu opinión ha sido registrada.
        </p>
      </div>
    </div>

    <div class="survey-wrapper" *ngIf="!pageLoading && voteSubmitted">
      <div class="survey-card survey-card--success">
        <div class="survey-done__icon" aria-hidden="true">&#127881;</div>
        <h2 class="survey-done__title">¡Gracias por tu respuesta!</h2>
        <p class="survey-done__text">
          Tu puntuación de <strong>{{ selectedScore }}</strong> ha sido registrada correctamente.
        </p>
        <span class="survey-done__badge" [ngClass]="badgeClassForScore(selectedScore!)">{{ getLabel(selectedScore!) }}</span>
      </div>
    </div>

    <div class="survey-wrapper" *ngIf="!pageLoading && !hasVoted && !voteSubmitted">
      <div class="survey-card">
        <div class="survey-question">
          <p class="survey-question__label">Pregunta</p>
          <h2 class="survey-question__text">
            ¿Cuán probable es que recomiende nuestro producto o servicio a un familiar o amigo?
          </h2>
        </div>

        <div class="alert-error" *ngIf="errorMessage">&#9888; {{ errorMessage }}</div>

        <form [formGroup]="voteForm" (ngSubmit)="onSubmit()">
          <div class="score-section">
            <div class="score-labels-top">
              <span>Muy improbable</span>
              <span>Definitivamente lo recomendaría</span>
            </div>

            <div class="score-grid">
              <button
                *ngFor="let s of scores"
                type="button"
                class="score-btn"
                [ngClass]="getScoreClasses(s)"
                [class.score-btn--selected]="selectedScore === s"
                (click)="selectScore(s)"
                [attr.aria-label]="'Puntuación ' + s"
                [attr.aria-pressed]="selectedScore === s"
              >
                {{ s }}
              </button>
            </div>

            <div class="score-category" *ngIf="selectedScore !== null">
              Tu selección: <strong>{{ selectedScore }}</strong> —
              <span class="badge" [ngClass]="badgeClassForScore(selectedScore)">{{ getLabel(selectedScore) }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="comment">Comentario (opcional)</label>
            <textarea
              id="comment"
              formControlName="comment"
              rows="3"
              placeholder="Cuéntenos más sobre su experiencia..."
            ></textarea>
          </div>

          <div class="survey-actions">
            <button type="submit" class="btn-submit" [disabled]="selectedScore === null || isLoading">
              <span *ngIf="!isLoading">Enviar mi respuesta</span>
              <span *ngIf="isLoading">Enviando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .survey-wrapper {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f0f2f5;
    }

    .survey-card {
      background: #fff;
      border-radius: 16px;
      padding: 2.5rem 3rem;
      width: 100%;
      max-width: 680px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }

    .survey-loading {
      text-align: center;
      color: var(--text-secondary);
      margin: 0;
    }

    .survey-question {
      text-align: center;
      margin-bottom: 2rem;
    }

    .survey-question__label {
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      color: #6b7280;
      margin-bottom: 0.75rem;
    }

    .survey-question__text {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.4;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    .alert-error {
      background: #fef2f2;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .score-labels-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 0.75rem;
    }

    .score-grid {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .score-btn {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      background: #fff;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      color: #374151;
    }

    .score-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .score-btn--selected {
      color: #fff !important;
      border-color: transparent !important;
    }

    .score--detractor {
      border-color: #fca5a5;
      color: #dc2626;
    }
    .score--detractor.score-btn--selected {
      background: #dc2626;
    }
    .score--detractor:hover:not(.score-btn--selected) {
      background: #fee2e2;
    }

    .score--neutral {
      border-color: #fde68a;
      color: #d97706;
    }
    .score--neutral.score-btn--selected {
      background: #d97706;
    }
    .score--neutral:hover:not(.score-btn--selected) {
      background: #fef3c7;
    }

    .score--promoter {
      border-color: #a7f3d0;
      color: #059669;
    }
    .score--promoter.score-btn--selected {
      background: #059669;
    }
    .score--promoter:hover:not(.score-btn--selected) {
      background: #d1fae5;
    }

    .score-category {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.95rem;
      color: #374151;
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge--detractor {
      background: #fee2e2;
      color: #dc2626;
    }
    .badge--neutral {
      background: #fef3c7;
      color: #d97706;
    }
    .badge--promotor {
      background: #d1fae5;
      color: #059669;
    }

    .survey-actions {
      margin-top: 1.5rem;
      text-align: center;
    }

    .btn-submit {
      padding: 0.85rem 3rem;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-submit:hover:not(:disabled) {
      background: #4338ca;
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .survey-card--done .survey-done__icon,
    .survey-card--success .survey-done__icon {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    .survey-done__title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .survey-done__text {
      text-align: center;
      color: #6b7280;
      margin-top: 0.5rem;
    }
    .survey-done__badge {
      display: block;
      text-align: center;
      margin-top: 1rem;
    }

    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-family: inherit;
    }
  `]
})
export class SurveyComponent implements OnInit {
  voteForm!: FormGroup;
  scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedScore: number | null = null;
  isLoading = false;
  pageLoading = true;
  hasVoted = false;
  voteSubmitted = false;
  errorMessage = '';
  username = '';

  constructor(
    private fb: FormBuilder,
    private voteService: VoteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.voteForm = this.fb.group({
      comment: ['', [Validators.maxLength(500)]]
    });

    const user = this.authService.getCurrentUser();
    this.username = user?.username ?? '';

    this.voteService.hasVoted().subscribe({
      next: (r) => {
        this.hasVoted = r.hasVoted;
        this.pageLoading = false;
      },
      error: () => {
        this.hasVoted = !!user?.hasVoted;
        this.pageLoading = false;
      }
    });
  }

  getScoreClasses(s: number): Record<string, boolean> {
    const tier = s <= 6 ? 'detractor' : s <= 8 ? 'neutral' : 'promoter';
    return {
      [`score--${tier}`]: true
    };
  }

  getLabel(score: number): string {
    if (score >= 9) return 'Promotor';
    if (score >= 7) return 'Neutro';
    return 'Detractor';
  }

  badgeClassForScore(score: number): string {
    if (score >= 9) return 'badge--promotor';
    if (score >= 7) return 'badge--neutral';
    return 'badge--detractor';
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
