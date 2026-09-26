/** Período de demonstração do seed Oracle, sem fuso. */
export const PERIODO_DEMONSTRACAO_INICIO = '2026-09-01T00:00:00';
export const PERIODO_DEMONSTRACAO_FIM = '2026-09-30T23:59:59';

/** Primeiro IDENTITY quando o schema nasce vazio. */
export const USUARIO_INICIAL_ID = 1;

/** Usuário do seed com consumo no limite, usado como foco da demonstração. */
export const NOME_FOCO_DEMONSTRACAO = 'Bruno Alves';

export interface ConsumptionAlert {
  id: number;
  userId: number;
  periodStart: string;
  periodEnd: string;
  tokenTotal: number;
  message: string;
  createdAt: string;
}

export interface ConsumptionReportLine {
  userId: number;
  name: string;
  tokenTotal: number;
  hasAlert: boolean;
}

export interface Consumption {
  userId: number;
  periodStart: string;
  periodEnd: string;
  tokenTotal: number;
  formattedText: string;
  alerts: ConsumptionAlert[];
  report: ConsumptionReportLine[];
}

export interface RegisterAlertResponse {
  alertId: number | null;
  recorded: boolean;
}
