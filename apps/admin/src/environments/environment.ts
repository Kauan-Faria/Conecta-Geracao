/**
 * Configuração do painel admin.
 * A API é o admin-api (Spring Boot) — não o NestJS do app mobile.
 */
export const environment = {
  production: false,
  /** Base URL do apps/admin-api (porta 8081). */
  apiBaseUrl: 'http://localhost:8081',
};
