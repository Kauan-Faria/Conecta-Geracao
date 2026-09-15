import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../services/auth';
import { KnowledgeService } from '../../services/knowledge';
import { EducationalTipService } from '../../services/educational-tip';
import { CampaignService } from '../../services/campaign';
import { DashboardService } from '../../services/dashboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly educationalTipService = inject(EducationalTipService);
  private readonly campaignService = inject(CampaignService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  titulo = 'Dashboard';

  operador =
    this.authService.getCurrentUser() ?? 'Administrador';

  conteudos = 0;
  dicas = 0;
  campanhas = 0;
  usuarios: number | null = null;
  perguntasIa: number | null = null;

  carregando = true;
  apiOk = false;
  erro = '';

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.carregando = true;
    this.erro = '';

    forkJoin({
      conteudos: this.knowledgeService.getTopics(),
      dicas: this.educationalTipService.getTips(),
      campanhas: this.campaignService.getCampaigns(),
      stats: this.dashboardService.getStats().pipe(
        catchError(() => of({ registeredUsers: null, aiQuestions: null })),
      ),
    }).subscribe({
      next: ({ conteudos, dicas, campanhas, stats }) => {
        this.conteudos = conteudos?.length ?? 0;
        this.dicas = dicas?.length ?? 0;
        this.campanhas = campanhas?.length ?? 0;
        this.usuarios = stats.registeredUsers;
        this.perguntasIa = stats.aiQuestions;

        this.apiOk = true;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.apiOk = false;
        this.carregando = false;
        this.erro =
          'Não foi possível carregar todos os dados do dashboard.';
        this.cdr.detectChanges();
      },
    });
  }

  formatMetric(value: number | null): string {
    if (this.carregando) {
      return '…';
    }
    if (value === null) {
      return '—';
    }
    return String(value);
  }

  metricHint(value: number | null, available: string): string {
    if (!this.carregando && value === null) {
      return 'Contagem indisponível neste ambiente';
    }
    return available;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
