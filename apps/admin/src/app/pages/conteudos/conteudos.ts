import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import {
  KnowledgeTopic,
  KnowledgeTopicPayload,
} from '../../models/knowledge';
import { KnowledgeService } from '../../services/knowledge';

@Component({
  selector: 'app-conteudos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './conteudos.html',
  styleUrl: './conteudos.css',
})
export class ConteudosComponent implements OnInit {
  private readonly knowledgeService = inject(KnowledgeService);

  busca = '';
  mensagem = '';
  loading = false;
  salvando = false;
  erro = '';
  mostrandoFormulario = false;

  conteudos: KnowledgeTopic[] = [];

  // Formulário de criação (ngModel)
  novoSlug = '';
  novoTitulo = '';
  novoResumo = '';
  novasKeywords = '';
  novaInstrucao = '';
  novoAtivo = true;

  ngOnInit(): void {
    this.carregar();
  }

  get conteudosFiltrados(): KnowledgeTopic[] {
    const termo = this.busca.toLowerCase().trim();

    if (!termo) {
      return this.conteudos;
    }

    return this.conteudos.filter(
      (conteudo) =>
        conteudo.title.toLowerCase().includes(termo) ||
        conteudo.summary.toLowerCase().includes(termo) ||
        conteudo.slug.toLowerCase().includes(termo) ||
        (conteudo.keywords ?? []).some((keyword) =>
          keyword.toLowerCase().includes(termo),
        ),
    );
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';

    this.knowledgeService.getTopics().subscribe({
      next: (topics) => {
        this.conteudos = topics ?? [];
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.erro = this.mapHttpError(
          error,
          'Não foi possível carregar os tópicos da base de conhecimento.',
        );
      },
    });
  }

  abrirFormulario(): void {
    this.mostrandoFormulario = true;
    this.erro = '';
    this.mensagem = '';
  }

  fecharFormulario(): void {
    this.mostrandoFormulario = false;
    this.resetFormulario();
  }

  criar(): void {
    this.erro = '';
    this.mensagem = '';

    const slug = this.novoSlug.trim().toLowerCase();
    const title = this.novoTitulo.trim();
    const summary = this.novoResumo.trim();
    const instruction = this.novaInstrucao.trim();

    if (!/^[a-z0-9-]{1,64}$/.test(slug)) {
      this.erro =
        'Slug inválido. Use kebab-case (letras minúsculas, números e hífen).';
      return;
    }

    if (!title || !summary) {
      this.erro = 'Título e resumo são obrigatórios.';
      return;
    }

    if (!instruction) {
      this.erro =
        'Informe ao menos uma instrução (passo 1) para o tópico.';
      return;
    }

    const keywords = this.novasKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload: KnowledgeTopicPayload = {
      slug,
      title,
      summary,
      keywords,
      displayOrder: this.conteudos.length,
      isActive: this.novoAtivo,
      steps: [
        {
          order: 1,
          instruction,
          checkpointQuestion: null,
          checkpointHints: [],
        },
      ],
    };

    this.salvando = true;

    this.knowledgeService.createTopic(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.mensagem = 'Tópico criado com sucesso.';
        this.fecharFormulario();
        this.carregar();
        setTimeout(() => {
          this.mensagem = '';
        }, 3000);
      },
      error: (error: unknown) => {
        this.salvando = false;
        this.erro = this.mapHttpError(
          error,
          'Não foi possível criar o tópico.',
        );
      },
    });
  }

  excluir(id: string, title: string): void {
    const ok = window.confirm(
      `Remover o tópico "${title}"? Essa ação afeta a base usada pelo assistente do app.`,
    );

    if (!ok) {
      return;
    }

    this.knowledgeService.deleteTopic(id).subscribe({
      next: () => {
        this.mensagem = 'Tópico removido com sucesso.';
        this.carregar();
        setTimeout(() => {
          this.mensagem = '';
        }, 3000);
      },
      error: (error: unknown) => {
        this.erro = this.mapHttpError(
          error,
          'Não foi possível remover o tópico.',
        );
      },
    });
  }

  private resetFormulario(): void {
    this.novoSlug = '';
    this.novoTitulo = '';
    this.novoResumo = '';
    this.novasKeywords = '';
    this.novaInstrucao = '';
    this.novoAtivo = true;
  }

  private mapHttpError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Sem conexão com o admin-api (localhost:8081).';
      }
      if (error.status === 401) {
        return 'Sessão expirada ou inválida. Faça login novamente.';
      }
      if (error.status === 409) {
        return 'Já existe um tópico com esse slug.';
      }
      const msg =
        typeof error.error === 'object' &&
        error.error &&
        'message' in error.error
          ? String((error.error as { message?: string }).message)
          : null;
      return msg || fallback;
    }
    return fallback;
  }
}
