# Admin (Angular) — Backoffice Conecta Geração

Painel web administrativo que consome a **mesma API de backoffice** (`apps/admin-api`, Spring Boot)
usada para gerenciar a base de conhecimento compartilhada com o NestJS / app Flutter.

Não substitui o app mobile. Autenticação do operador é **JWT próprio do admin-api**
(Firebase continua só no app do usuário final).

## Pré-requisitos

1. `admin-api` rodando em `http://localhost:8081`
2. Migration `admin_users` aplicada (via Prisma em `apps/backend`)
3. Node 20+ e pnpm

## Rodar

```bash
cd apps/admin
pnpm install
pnpm start
```

Abra http://localhost:4200

Login: usuário/senha seed do `admin-api` (`ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD`).

## Rotas

| Rota | Função |
|------|--------|
| `/login` | Login JWT (`POST /api/auth/login`) |
| `/home` | Dashboard (contagem de tópicos via API) |
| `/admin` | Área administrativa |
| `/admin/conteudos` | CRUD de tópicos (`/api/knowledge-topics`) |

Rotas autenticadas usam `authGuard`. O interceptor envia `Authorization: Bearer <token>`.

## Stack da disciplina

- HttpClient + interceptor
- Data binding (`{{ }}`, `[ ]`, `( )`, `[(ngModel)]`)
- Diretivas `*ngIf` / `*ngFor`
- Formulários com `[(ngModel)]`
- Router (`/home`, `/admin`, …)
