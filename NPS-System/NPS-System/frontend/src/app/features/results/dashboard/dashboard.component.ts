import { Component, OnInit, OnDestroy } from '@angular/core';
import { VoteService } from '../../../core/services/vote.service';
import { NpsResult } from '../../../core/models/vote.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Resultados NPS</h1>
          <p class="dashboard-subtitle" *ngIf="lastUpdated">
            Última actualización: {{ lastUpdated | date : 'HH:mm:ss' }}
          </p>
        </div>
        <button type="button" class="btn-refresh" (click)="refresh()" [disabled]="refreshInProgress">
          {{ refreshInProgress ? 'Actualizando...' : '↻ Actualizar' }}
        </button>
      </div>

      <div class="alert-error" *ngIf="errorMessage">⚠ {{ errorMessage }}</div>

      <div class="skeleton-grid" *ngIf="isLoading && !npsResult">
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
      </div>

      <div class="dashboard-legacy" *ngIf="npsResult">
        <div class="nps-hero">
          <div class="nps-score" [style.color]="getNpsColor()">
            {{ npsResult.npsScore | number : '1.0-1' }}
          </div>
          <div class="nps-label">{{ getNpsLabelText() }}</div>
          <div class="nps-total">
            Basado en <strong>{{ npsResult.totalVotes }}</strong> respuesta(s)
          </div>
          <p class="nps-interpretation">{{ getNpsInterpretation() }}</p>
        </div>

        <div class="stats-grid-zip">
          <div class="stat-card-zip stat-card--promoter">
            <div class="stat-card__value">{{ npsResult.promoters }}</div>
            <div class="stat-card__label">Promotores</div>
            <div class="stat-card__pct">Puntuación 9-10</div>
            <div class="stat-card__bar">
              <div
                class="stat-card__bar-fill stat-card__bar-fill--promoter"
                [style.width]="getBarWidth(npsResult.promoterPercentage)"
              ></div>
            </div>
            <div class="stat-card__pct-val">{{ npsResult.promoterPercentage | number : '1.0-1' }}%</div>
          </div>

          <div class="stat-card-zip stat-card--neutral">
            <div class="stat-card__value">{{ npsResult.passives }}</div>
            <div class="stat-card__label">Neutros</div>
            <div class="stat-card__pct">Puntuación 7-8</div>
            <div class="stat-card__bar">
              <div
                class="stat-card__bar-fill stat-card__bar-fill--neutral"
                [style.width]="getBarWidth(npsResult.passivePercentage)"
              ></div>
            </div>
            <div class="stat-card__pct-val">{{ npsResult.passivePercentage | number : '1.0-1' }}%</div>
          </div>

          <div class="stat-card-zip stat-card--detractor">
            <div class="stat-card__value">{{ npsResult.detractors }}</div>
            <div class="stat-card__label">Detractores</div>
            <div class="stat-card__pct">Puntuación 0-6</div>
            <div class="stat-card__bar">
              <div
                class="stat-card__bar-fill stat-card__bar-fill--detractor"
                [style.width]="getBarWidth(npsResult.detractorPercentage)"
              ></div>
            </div>
            <div class="stat-card__pct-val">{{ npsResult.detractorPercentage | number : '1.0-1' }}%</div>
          </div>
        </div>

        <div class="formula-card">
          <p class="formula-title">Fórmula NPS</p>
          <p class="formula-text">
            NPS = (Promotores − Detractores) / Total × 100<br />
            NPS = ({{ npsResult.promoters }} − {{ npsResult.detractors }}) /
            {{ npsResult.totalVotes || 1 }} × 100 = <strong [style.color]="getNpsColor()">{{ npsResult.npsScore | number : '1.0-1' }}</strong>
          </p>
        </div>

        <div class="nps-bar card">
          <h3>Distribución de votos</h3>
          <div class="bar-container">
            <div class="bar-segment detractors" [style.width.%]="npsResult.detractorPercentage">
              {{ npsResult.detractorPercentage > 5 ? npsResult.detractorPercentage + '%' : '' }}
            </div>
            <div class="bar-segment passives" [style.width.%]="npsResult.passivePercentage">
              {{ npsResult.passivePercentage > 5 ? npsResult.passivePercentage + '%' : '' }}
            </div>
            <div class="bar-segment promoters" [style.width.%]="npsResult.promoterPercentage">
              {{ npsResult.promoterPercentage > 5 ? npsResult.promoterPercentage + '%' : '' }}
            </div>
          </div>
          <div class="bar-legend">
            <span class="legend-item"><span class="dot detractors"></span> Detractores (0-6)</span>
            <span class="legend-item"><span class="dot passives"></span> Neutros (7-8)</span>
            <span class="legend-item"><span class="dot promoters"></span> Promotores (9-10)</span>
          </div>
        </div>

        <div class="recent-votes card">
          <h3>Votos recientes</h3>
          <div class="votes-list" *ngIf="npsResult.recentVotes.length > 0">
            <div class="vote-item" *ngFor="let vote of npsResult.recentVotes">
              <div class="vote-score" [class]="getVoteClass(vote.score)">
                {{ vote.score }}
              </div>
              <div class="vote-details">
                <p class="vote-user">{{ vote.username }}</p>
                <p class="vote-date">{{ vote.createdAt | date : 'medium' }}</p>
                <p class="vote-comment" *ngIf="vote.comment">{{ vote.comment }}</p>
              </div>
              <div class="vote-category" [class]="vote.category.toLowerCase()">
                {{ vote.category }}
              </div>
            </div>
          </div>
          <p class="no-votes" *ngIf="npsResult.recentVotes.length === 0">No hay votos registrados aún.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .dashboard-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }

    .dashboard-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .btn-refresh {
      padding: 0.5rem 1rem;
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert-error {
      background: #fef2f2;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .skeleton {
      height: 120px;
      border-radius: 12px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .nps-hero {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: var(--card-background);
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .nps-hero .nps-score {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .nps-label {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .nps-total {
      margin-top: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .nps-interpretation {
      margin-top: 1rem;
      font-size: 0.95rem;
      color: var(--text-secondary);
    }

    .stats-grid-zip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card-zip {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .stat-card__value {
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-card--promoter .stat-card__value {
      color: #059669;
    }
    .stat-card--neutral .stat-card__value {
      color: #d97706;
    }
    .stat-card--detractor .stat-card__value {
      color: #dc2626;
    }

    .stat-card__label {
      font-weight: 600;
      color: var(--text-primary);
    }

    .stat-card__pct {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .stat-card__bar {
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      margin: 0.75rem 0 0.35rem;
      overflow: hidden;
    }

    .stat-card__bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .stat-card__bar-fill--promoter {
      background: #059669;
    }
    .stat-card__bar-fill--neutral {
      background: #d97706;
    }
    .stat-card__bar-fill--detractor {
      background: #dc2626;
    }

    .stat-card__pct-val {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .formula-card {
      background: #f9fafb;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--border-color);
    }

    .formula-title {
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .formula-text {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .nps-bar h3 {
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .bar-container {
      display: flex;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
    }

    .bar-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      min-width: 0;
    }

    .bar-segment.detractors {
      background: #ef4444;
    }
    .bar-segment.passives {
      background: #f59e0b;
    }
    .bar-segment.promoters {
      background: #22c55e;
    }

    .bar-legend {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.detractors {
      background: #ef4444;
    }
    .dot.passives {
      background: #f59e0b;
    }
    .dot.promoters {
      background: #22c55e;
    }

    .recent-votes h3 {
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .votes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .vote-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .vote-score {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .vote-score.detractor {
      background: #fef2f2;
      color: #ef4444;
    }
    .vote-score.passive {
      background: #fffbeb;
      color: #f59e0b;
    }
    .vote-score.promoter {
      background: #f0fdf4;
      color: #22c55e;
    }

    .vote-details {
      flex: 1;
    }

    .vote-user {
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .vote-date {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .vote-comment {
      margin: 0.5rem 0 0;
      font-size: 0.875rem;
    }

    .vote-category {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .vote-category.promotor {
      background: #f0fdf4;
      color: #22c55e;
    }
    .vote-category.neutro {
      background: #fffbeb;
      color: #f59e0b;
    }
    .vote-category.detractor {
      background: #fef2f2;
      color: #ef4444;
    }

    .no-votes {
      text-align: center;
      color: var(--text-secondary);
      padding: 2rem;
      margin: 0;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  npsResult: NpsResult | null = null;
  isLoading = true;
  refreshInProgress = false;
  errorMessage = '';
  lastUpdated: Date | null = null;
  private refreshSubscription?: Subscription;

  constructor(private voteService: VoteService) {}

  ngOnInit(): void {
    this.loadResults();
    this.refreshSubscription = interval(30000).subscribe(() => this.quietRefresh());
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  refresh(): void {
    this.loadResults({ manual: true });
  }

  private quietRefresh(): void {
    if (!this.npsResult) return;
    this.loadResults({ silent: true });
  }

  private loadResults(options?: { manual?: boolean; silent?: boolean }): void {
    const manual = options?.manual;
    const silent = options?.silent;

    if (manual) {
      this.refreshInProgress = true;
      this.errorMessage = '';
    } else if (!silent) {
      this.isLoading = true;
    }

    this.voteService.getNpsResults().subscribe({
      next: (result) => {
        this.npsResult = result;
        this.lastUpdated = new Date();
        this.errorMessage = '';
        this.isLoading = false;
        this.refreshInProgress = false;
      },
      error: (e) => {
        this.errorMessage = e.error?.message || 'No se pudieron cargar los resultados';
        this.isLoading = false;
        this.refreshInProgress = false;
      }
    });
  }

  getNpsColor(): string {
    if (!this.npsResult) return '#111827';
    const s = this.npsResult.npsScore;
    if (s >= 50) return '#059669';
    if (s >= 0) return '#84cc16';
    if (s >= -50) return '#d97706';
    return '#dc2626';
  }

  getNpsLabelText(): string {
    if (!this.npsResult) return '';
    const s = this.npsResult.npsScore;
    if (s >= 50) return 'Excelente';
    if (s >= 0) return 'Bueno';
    if (s >= -50) return 'Regular';
    return 'Crítico';
  }

  getNpsInterpretation(): string {
    if (!this.npsResult) return '';
    const score = this.npsResult.npsScore;
    if (score >= 50) return 'Excelente — los clientes valoran mucho el servicio';
    if (score >= 0) return 'Bueno — hay margen de mejora';
    if (score >= -50) return 'Regular — requiere atención';
    return 'Crítico — acción urgente';
  }

  getBarWidth(pct: number): string {
    const n = Number(pct);
    if (Number.isNaN(n)) return '0%';
    return `${Math.min(100, Math.max(0, n))}%`;
  }

  getVoteClass(score: number): string {
    if (score >= 9) return 'promoter';
    if (score >= 7) return 'passive';
    return 'detractor';
  }
}
