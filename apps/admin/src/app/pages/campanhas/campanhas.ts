import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Campaign,
  CampaignPayload,
  CampaignSegmentType,
} from '../../models/campaign';

import { CampaignService } from '../../services/campaign';

@Component({
  selector: 'app-campanhas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './campanhas.html',
  styleUrl: './campanhas.css',
})
export class CampanhasComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);

  campanhas: Campaign[] = [];

  loading = true;
  salvando = false;

  erro = '';
  mensagem = '';

  busca = '';

  mostrandoFormulario = false;

  titulo = '';
  corpo = '';
  deepLink = '';
  segmentType: CampaignSegmentType = 'all_active';

  firebaseUidsTexto = '';

  ngOnInit(): void {
    this.carregar();
  }

  get campanhasFiltradas(): Campaign[] {
    const termo = this.busca.trim().toLowerCase();

    if (!termo) {
      return this.campanhas;
    }

    return this.campanhas.filter(
      (campanha) =>
        campanha.title.toLowerCase().includes(termo) ||
        campanha.body.toLowerCase().includes(termo) ||
        campanha.status.toLowerCase().includes(termo),
    );
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';

    this.campaignService.getCampaigns().subscribe({
      next: (campanhas) => {
        this.campanhas = campanhas ?? [];
        this.loading = false;
      },

      error: () => {
        this.erro = 'Não foi possível carregar as campanhas.';
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

  salvar(): void {
    this.erro = '';
    this.mensagem = '';

    if (
      !this.titulo.trim() ||
      !this.corpo.trim() ||
      !this.deepLink.trim()
    ) {
      this.erro =
        'Preencha título, mensagem e deep link.';
      return;
    }

    let firebaseUids: string[] | undefined;

    if (this.segmentType === 'uid_list') {
      firebaseUids = this.firebaseUidsTexto
        .split(/[\n,;]/)
        .map((uid) => uid.trim())
        .filter((uid) => uid.length > 0);

      if (firebaseUids.length === 0) {
        this.erro =
          'Informe pelo menos um Firebase UID para o segmento selecionado.';
        return;
      }
    }

    const payload: CampaignPayload = {
      title: this.titulo.trim(),
      body: this.corpo.trim(),
      deepLink: this.deepLink.trim(),
      segmentType: this.segmentType,
      firebaseUids,
    };

    this.salvando = true;

    this.campaignService
      .createCampaign(payload)
      .pipe(
        finalize(() => {
          this.salvando = false;
        }),
      )
      .subscribe({
        next: () => {
          this.mensagem =
            'Campanha criada com sucesso.';

          this.mostrandoFormulario = false;

          this.limparFormulario();

          this.carregar();
        },

        error: (error) => {
          console.error(
            'Erro ao criar campanha:',
            error,
          );

          this.erro =
            'Não foi possível criar a campanha.';
        },
      });
  }

  traduzirSegmento(
    segmentType: CampaignSegmentType,
  ): string {
    return segmentType === 'all_active'
      ? 'Todos os usuários ativos'
      : 'Lista de usuários';
  }

  traduzirStatus(status: string): string {
    const traducoes: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluída',
      failed: 'Falhou',
    };

    return traducoes[status] ?? status;
  }

  private limparFormulario(): void {
    this.titulo = '';
    this.corpo = '';
    this.deepLink = '';
    this.segmentType = 'all_active';
    this.firebaseUidsTexto = '';
  }
}