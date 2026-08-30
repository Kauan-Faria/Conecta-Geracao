import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { KnowledgeService } from '../../services/knowledge';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly router = inject(Router);

  titulo = 'Dashboard';
  operador = this.authService.getCurrentUser() ?? 'Administrador';
  conteudos = 0;
  carregandoConteudos = true;
  apiOk = false;
  erroConteudos = '';

  ngOnInit(): void {
    this.knowledgeService.getTopics().subscribe({
      next: (topics) => {
        this.conteudos = topics?.length ?? 0;
        this.carregandoConteudos = false;
        this.apiOk = true;
      },
      error: () => {
        this.carregandoConteudos = false;
        this.apiOk = false;
        this.erroConteudos =
          'Não foi possível carregar a contagem de tópicos.';
      },
    });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
