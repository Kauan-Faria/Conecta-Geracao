import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../services/auth';
import { KnowledgeService } from '../../services/knowledge';
import { EducationalTipService } from '../../services/educational-tip';
import { CampaignService } from '../../services/campaign';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly educationalTipService = inject(EducationalTipService);
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);

  titulo = 'Dashboard';

  operador =
    this.authService.getCurrentUser() ?? 'Administrador';

  conteudos = 0;
  dicas = 0;
  campanhas = 0;

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
    }).subscribe({
      next: ({ conteudos, dicas, campanhas }) => {
        this.conteudos = conteudos?.length ?? 0;
        this.dicas = dicas?.length ?? 0;
        this.campanhas = campanhas?.length ?? 0;

        this.apiOk = true;
        this.carregando = false;
      },

      error: (error) => {
        console.error(
          'Erro ao carregar dados do dashboard:',
          error,
        );

        this.apiOk = false;
        this.carregando = false;

        this.erro =
          'Não foi possível carregar todos os dados do dashboard.';
      },
    });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}