import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import {
  Consumption,
  ConsumptionReportLine,
  NOME_FOCO_DEMONSTRACAO,
  PERIODO_DEMONSTRACAO_FIM,
  PERIODO_DEMONSTRACAO_INICIO,
  USUARIO_INICIAL_ID,
} from '../../models/consumption';
import { ConsumptionService } from '../../services/consumption';

@Component({
  selector: 'app-consumo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consumo.html',
  styleUrl: './consumo.css',
})
export class ConsumoComponent implements OnInit {
  private readonly consumptionService = inject(ConsumptionService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly periodoInicio = PERIODO_DEMONSTRACAO_INICIO;
  readonly periodoFim = PERIODO_DEMONSTRACAO_FIM;

  userId = USUARIO_INICIAL_ID;
  idManual: number | null = null;

  dados: Consumption | null = null;
  carregando = false;
  disparando = false;
  mostrarCampoId = false;
  erro = '';
  erroDisparo = '';
  mensagem = '';

  /** Só a abertura automática troca o foco para o usuário de consumo alto. */
  private aplicarFocoDemonstracao = true;
  private avisoAposCarga = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(manterFoco = false): void {
    if (this.carregando) {
      return;
    }

    const trocarFoco = this.aplicarFocoDemonstracao && !manterFoco;
    this.carregando = true;
    this.erro = '';
    this.erroDisparo = '';
    this.mensagem = '';
    this.mostrarCampoId = false;

    this.consumptionService.consult(this.userId).subscribe({
      next: (dados) => {
        this.dados = this.normalizar(dados);
        this.aplicarFocoDemonstracao = false;

        const foco = trocarFoco
          ? this.dados.report.find(
              (linha) => linha.name === NOME_FOCO_DEMONSTRACAO,
            )
          : undefined;

        if (foco && foco.userId !== this.userId) {
          this.userId = foco.userId;
          this.dados = null;
          this.carregando = false;
          this.carregar(true);
          return;
        }

        this.carregando = false;
        this.mensagem = this.avisoAposCarga;
        this.avisoAposCarga = '';
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        this.carregando = false;
        this.dados = null;
        this.mostrarCampoId =
          error instanceof HttpErrorResponse && error.status === 404;
        this.erro = this.mapHttpError(
          error,
          'Não foi possível carregar o consumo.',
        );
        this.avisoAposCarga = '';
        this.cdr.detectChanges();
      },
    });
  }

  tentarComId(): void {
    if (
      this.idManual == null ||
      !Number.isInteger(this.idManual) ||
      this.idManual <= 0
    ) {
      this.erro = 'Informe um id de usuário maior que zero.';
      this.cdr.detectChanges();
      return;
    }

    this.userId = this.idManual;
    this.carregar(true);
  }

  selecionarUsuario(linha: ConsumptionReportLine): void {
    if (this.carregando || this.disparando || linha.userId === this.userId) {
      return;
    }

    this.userId = linha.userId;
    this.carregar(true);
  }

  disparar(): void {
    if (this.disparando || this.carregando || !this.dados) {
      return;
    }

    this.disparando = true;
    this.erroDisparo = '';
    this.mensagem = '';

    this.consumptionService.registerAlert(this.userId).subscribe({
      next: (resposta) => {
        this.disparando = false;
        this.avisoAposCarga = resposta.recorded
          ? 'Alerta registrado. A lista foi atualizada.'
          : 'Consumo abaixo do limite. Nenhum alerta novo.';
        this.cdr.detectChanges();
        this.carregar(true);
      },
      error: (error: unknown) => {
        this.disparando = false;
        this.erroDisparo = this.mapHttpError(
          error,
          'Não foi possível disparar o alerta.',
        );
        this.cdr.detectChanges();
      },
    });
  }

  private normalizar(dados: Consumption): Consumption {
    return {
      ...dados,
      alerts: dados.alerts ?? [],
      report: dados.report ?? [],
    };
  }

  private mapHttpError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Sem conexão com o admin-api (localhost:8081).';
      }
      if (error.status === 401) {
        return 'Sessão expirada ou inválida. Faça login novamente.';
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
