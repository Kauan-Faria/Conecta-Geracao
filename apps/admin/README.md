# Admin (Angular) — Backoffice Conecta Geração

Painel web do operador. Consome o `apps/admin-api` (Spring Boot) para conteúdos, dicas, campanhas e o consumo simulado de tokens da IA.

O app Flutter e o NestJS ficam de fora deste painel. O operador autentica com o **JWT do admin-api**. Firebase continua só no app do usuário final.

Conteúdos, dicas, campanhas e o dashboard vêm do PostgreSQL compartilhado (Supabase). A tela de consumo lê um Oracle que cada pessoa instala e cria na própria máquina, sempre via `admin-api`. Não existe Oracle compartilhado do projeto. O browser não abre conexão com esse banco.

## Pré-requisitos

1. `admin-api` rodando em `http://localhost:8081`
2. Migration `admin_users` aplicada (via Prisma em `apps/backend`)
3. Node 20+ e pnpm
4. Para `/admin/consumo`: Oracle instalado na sua máquina, com os scripts de `apps/admin-api/src/main/resources/db/oracle/` aplicados no schema local, e as variáveis `ORACLE_URL`, `ORACLE_USERNAME` e `ORACLE_PASSWORD` apontando para essa instância no `admin-api`

A home, os conteúdos, as dicas e as campanhas seguem no ar quando o Oracle está desligado. Só a tela de consumo mostra o erro.

## Rodar

```bash
cd apps/admin
pnpm install
pnpm start
```

Abra http://localhost:4200

Login: usuário/senha seed do `admin-api` (`ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD`).

## Rotas

| Rota | Função | API |
|------|--------|-----|
| `/login` | Login JWT | `POST /api/auth/login` |
| `/home` | Dashboard (contagens no Postgres) | tópicos, dicas, campanhas, stats |
| `/admin` | Catálogo da área administrativa | — |
| `/admin/conteudos` | CRUD de tópicos | `/api/knowledge-topics` |
| `/admin/dicas` | CRUD de dicas educacionais | `/api/educational-tips` |
| `/admin/campanhas` | Campanhas | `/api/campaigns` |
| `/admin/consumo` | Indicador, texto, alertas e relatório de tokens | `GET /api/consumption`, `POST /api/consumption/alerts` |

`/login` usa `guestGuard`. As demais rotas usam `authGuard` e redirecionam para `/login` sem JWT. O interceptor envia `Authorization: Bearer <token>` em toda chamada, exceto o login.

O período da tela de consumo é o do seed: `2026-09-01T00:00:00` até `2026-09-30T23:59:59`. O limite de consumo alto é 10.000 tokens.

## Arquitetura

Aplicação standalone. O router é plano: cada tela é uma rota irmã, com guarda na própria rota. `AdminComponent` não é layout pai das outras páginas.

```text
src/app/
├── app.config.ts          # Router + HttpClient + authInterceptor
├── app.routes.ts          # rotas planas + authGuard / guestGuard
├── guards/                # sessão JWT (localStorage via AuthService)
├── interceptors/          # Bearer nas chamadas do admin-api
├── environments/          # apiBaseUrl → http://localhost:8081
├── models/                # contratos JSON da API
├── services/              # HttpClient; um serviço por recurso
└── pages/                 # uma pasta por tela (ts, html, css, spec)
```

Cada recurso segue o mesmo corte: `pages/<tela>` chama `services/<recurso>`, que usa `environment.apiBaseUrl`. O componente não monta URL nem fala com banco. `consumo` usa `ConsumptionService` e `models/consumption.ts`, no mesmo desenho de `conteudos` / `KnowledgeService`.

A home é a única tela com menu lateral. As demais voltam para `/home` por um link. O atalho de consumo está no menu e nas ações rápidas da home.

## Stack da disciplina

- HttpClient + interceptor
- Data binding (`{{ }}`, `[ ]`, `( )`, `[(ngModel)]`)
- Diretivas `*ngIf` / `*ngFor`
- Formulários com `[(ngModel)]`
- Router (`/home`, `/admin`, `/admin/consumo`, …)
