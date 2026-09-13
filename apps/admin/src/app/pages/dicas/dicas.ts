import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  EducationalTip,
  EducationalTipPayload,
} from '../../models/educational-tip';

import { EducationalTipService } from '../../services/educational-tip';

@Component({
  selector: 'app-dicas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dicas.html',
  styleUrl: './dicas.css',
})
export class DicasComponent implements OnInit {
  private readonly educationalTipService = inject(EducationalTipService);

  dicas: EducationalTip[] = [];

  loading = true;
  salvando = false;
  erro = '';
  mensagem = '';

  busca = '';

  mostrandoFormulario = false;
  editandoId: string | null = null;

  titulo = '';
  corpo = '';
  deepLink = '';
  topicTag = '';
  ativo = true;
  ordem = 0;

  ngOnInit(): void {
    this.carregar();
  }

  get dicasFiltradas(): EducationalTip[] {
    const termo = this.busca.trim().toLowerCase();

    if (!termo) {
      return this.dicas;
    }

    return this.dicas.filter((dica) =>
      dica.title.toLowerCase().includes(termo) ||
      dica.body.toLowerCase().includes(termo) ||
      (dica.topicTag ?? '').toLowerCase().includes(termo)
    );
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';

    this.educationalTipService.getTips().subscribe({
      next: (dicas) => {
        this.dicas = dicas ?? [];
        this.loading = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as dicas educativas.';
        this.loading = false;
      },
    });
  }

  abrirFormulario(): void {
    this.limparFormulario();
    this.mostrandoFormulario = true;
  }

  cancelar(): void {
    this.limparFormulario();
    this.mostrandoFormulario = false;
  }

  editar(dica: EducationalTip): void {
    this.editandoId = dica.id;

    this.titulo = dica.title;
    this.corpo = dica.body;
    this.deepLink = dica.deepLink;
    this.topicTag = dica.topicTag ?? '';
    this.ativo = dica.isActive;
    this.ordem = dica.sortOrder ?? 0;

    this.mostrandoFormulario = true;
  }

  salvar(): void {
    this.mensagem = '';
    this.erro = '';

    if (
      !this.titulo.trim() ||
      !this.corpo.trim() ||
      !this.deepLink.trim()
    ) {
      this.erro =
        'Preencha título, conteúdo da dica e deep link.';
      return;
    }

    const payload: EducationalTipPayload = {
      title: this.titulo.trim(),
      body: this.corpo.trim(),
      deepLink: this.deepLink.trim(),
      topicTag: this.topicTag.trim() || null,
      isActive: this.ativo,
      sortOrder: this.ordem,
    };

    this.salvando = true;

    const request$ = this.editandoId
      ? this.educationalTipService.updateTip(
          this.editandoId,
          payload,
        )
      : this.educationalTipService.createTip(payload);

    request$.subscribe({
      next: () => {
        this.salvando = false;

        this.mensagem = this.editandoId
          ? 'Dica atualizada com sucesso.'
          : 'Dica criada com sucesso.';

        this.mostrandoFormulario = false;
        this.limparFormulario();
        this.carregar();
      },
      error: () => {
        this.salvando = false;
        this.erro = 'Não foi possível salvar a dica.';
      },
    });
  }

  excluir(dica: EducationalTip): void {
    const confirmou = confirm(
      `Deseja realmente excluir a dica "${dica.title}"?`,
    );

    if (!confirmou) {
      return;
    }

    this.erro = '';
    this.mensagem = '';

    this.educationalTipService.deleteTip(dica.id).subscribe({
      next: () => {
        this.mensagem = 'Dica excluída com sucesso.';
        this.carregar();
      },
      error: () => {
        this.erro = 'Não foi possível excluir a dica.';
      },
    });
  }

  private limparFormulario(): void {
    this.editandoId = null;
    this.titulo = '';
    this.corpo = '';
    this.deepLink = '';
    this.topicTag = '';
    this.ativo = true;
    this.ordem = 0;
  }
}