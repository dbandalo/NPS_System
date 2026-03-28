import { Component, OnInit, OnDestroy } from '@angular/core';
import { VoteService } from '../../core/services/vote.service';
import { NpsResult } from '../../core/models/vote.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard NPS</h1>
        <p>Resultados en tiempo real</p>
      </div>
      
      <div class="loading" *ngIf="isLoading">
        <p>Cargando resultados...</p>
      </div>
      
      <div class="dashboard-content" *ngIf="!isLoading && npsResult">
        <!-- NPS Score Card -->
        <div class="nps-score-card card">
          <h3>Puntuacion NPS</h3>
          <div class="nps-score" [class]="getNpsClass()">
            {{ npsResult.npsScore }}
          </div>
          <p class="nps-interpretation">{{ getNpsInterpretation() }}</p>
        </div>
        
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card card promoters">
            <div class="stat-icon">&#128077;</div>
            <div class="stat-info">
              <h4>Promotores</h4>
              <p class="stat-value">{{ npsResult.promoters }}</p>
              <p class="stat-percentage">{{ npsResult.promoterPercentage }}%</p>
            </div>
          </div>
          
          <div class="stat-card card passives">
            <div class="stat-icon">&#128528;</div>
            <div class="stat-info">
              <h4>Neutros</h4>
              <p class="stat-value">{{ npsResult.passives }}</p>
              <p class="stat-percentage">{{ npsResult.passivePercentage }}%</p>
            </div>
          </div>
          
          <div class="stat-card card detractors">
            <div class="stat-icon">&#128078;</div>
            <div class="stat-info">
              <h4>Detractores</h4>
              <p class="stat-value">{{ npsResult.detractors }}</p>
              <p class="stat-percentage">{{ npsResult.detractorPercentage }}%</p>
            </div>
          </div>
          
          <div class="stat-card card total">
            <div class="stat-icon">&#128202;</div>
            <div class="stat-info">
              <h4>Total Votos</h4>
              <p class="stat-value">{{ npsResult.totalVotes }}</p>
            </div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="nps-bar card">
          <h3>Distribucion de Votos</h3>
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
        
        <!-- Recent Votes -->
        <div class="recent-votes card">
          <h3>Votos Recientes</h3>
          <div class="votes-list" *ngIf="npsResult.recentVotes.length > 0">
            <div class="vote-item" *ngFor="let vote of npsResult.recentVotes">
              <div class="vote-score" [class]="getVoteClass(vote.score)">
                {{ vote.score }}
              </div>
              <div class="vote-details">
                <p class="vote-user">{{ vote.username }}</p>
                <p class="vote-date">{{ vote.createdAt | date:'medium' }}</p>
                <p class="vote-comment" *ngIf="vote.comment">{{ vote.comment }}</p>
              </div>
              <div class="vote-category" [class]="vote.category.toLowerCase()">
                {{ vote.category }}
              </div>
            </div>
          </div>
          <p class="no-votes" *ngIf="npsResult.recentVotes.length === 0">
            No hay votos registrados aun.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      margin-bottom: 2rem;
      
      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }
      
      p {
        color: var(--text-secondary);
      }
    }
    
    .loading {
      text-align: center;
      padding: 3rem;
    }
    
    .nps-score-card {
      text-align: center;
      margin-bottom: 2rem;
      
      h3 {
        font-size: 1rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }
      
      .nps-score {
        font-size: 4rem;
        font-weight: 700;
        
        &.excellent { color: #22c55e; }
        &.good { color: #84cc16; }
        &.average { color: #f59e0b; }
        &.poor { color: #ef4444; }
      }
      
      .nps-interpretation {
        margin-top: 0.5rem;
        font-size: 1rem;
        color: var(--text-secondary);
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .stat-icon {
        font-size: 2rem;
      }
      
      h4 {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
      }
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
      }
      
      .stat-percentage {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }
      
      &.promoters .stat-value { color: #22c55e; }
      &.passives .stat-value { color: #f59e0b; }
      &.detractors .stat-value { color: #ef4444; }
      &.total .stat-value { color: var(--primary-color); }
    }
    
    .nps-bar {
      margin-bottom: 2rem;
      
      h3 {
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
        
        &.detractors { background: #ef4444; }
        &.passives { background: #f59e0b; }
        &.promoters { background: #22c55e; }
      }
      
      .bar-legend {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;
        
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
          
          &.detractors { background: #ef4444; }
          &.passives { background: #f59e0b; }
          &.promoters { background: #22c55e; }
        }
      }
    }
    
    .recent-votes {
      h3 {
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
        
        &.detractor { background: #fef2f2; color: #ef4444; }
        &.passive { background: #fffbeb; color: #f59e0b; }
        &.promoter { background: #f0fdf4; color: #22c55e; }
      }
      
      .vote-details {
        flex: 1;
        
        .vote-user {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .vote-date {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .vote-comment {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
      }
      
      .vote-category {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        
        &.promotor { background: #f0fdf4; color: #22c55e; }
        &.neutro { background: #fffbeb; color: #f59e0b; }
        &.detractor { background: #fef2f2; color: #ef4444; }
      }
      
      .no-votes {
        text-align: center;
        color: var(--text-secondary);
        padding: 2rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  npsResult: NpsResult | null = null;
  isLoading = true;
  private refreshSubscription?: Subscription;

  constructor(private voteService: VoteService) {}

  ngOnInit(): void {
    this.loadResults();
    
    // Refresh every 30 seconds for real-time updates
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadResults();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadResults(): void {
    this.voteService.getNpsResults().subscribe({
      next: (result) => {
        this.npsResult = result;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getNpsClass(): string {
    if (!this.npsResult) return '';
    const score = this.npsResult.npsScore;
    if (score >= 50) return 'excellent';
    if (score >= 0) return 'good';
    if (score >= -50) return 'average';
    return 'poor';
  }

  getNpsInterpretation(): string {
    if (!this.npsResult) return '';
    const score = this.npsResult.npsScore;
    if (score >= 50) return 'Excelente - Los clientes aman su servicio';
    if (score >= 0) return 'Bueno - Hay espacio para mejorar';
    if (score >= -50) return 'Regular - Necesita atencion inmediata';
    return 'Critico - Requiere accion urgente';
  }

  getVoteClass(score: number): string {
    if (score >= 9) return 'promoter';
    if (score >= 7) return 'passive';
    return 'detractor';
  }
}
