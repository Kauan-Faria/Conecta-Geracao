# Conecta Geração

Aplicativo mobile de **orientação digital** para analfabetos digitais (20–70+ anos). O app oferece um assistente conversacional com IA que guia o usuário passo a passo em tarefas do dia a dia — PIX, Gov.br, mapas, notificações e mais — com foco em **acessibilidade** e linguagem simples.

Monorepo com:

| App | Papel |
|-----|--------|
| **`apps/mobile`** | App Flutter — usuário final |
| **`apps/backend`** | API NestJS — chat, RAG, mapas, push do app |
| **`apps/admin-api`** | API Spring Boot — backoffice (CRUD de conteúdo) |
| **`apps/admin`** | Painel Angular — consome o `admin-api` |

O NestJS e o Flutter **não foram substituídos**. O backoffice (Java + Angular) cobre a gestão administrativa que o MVP deixou de fora, no **mesmo PostgreSQL**.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Mobile** | Flutter (Dart 3.12+), Riverpod, GoRouter, Material 3 |
| **API do app** | NestJS 10, TypeScript, Prisma, class-validator |
| **API admin** | Spring Boot 3.3, Java 17, JPA, Security, Validation |
| **Painel admin** | Angular 22, HttpClient, Router, Forms (`ngModel`) |
| **Banco de dados** | PostgreSQL (Supabase) — compartilhado |
| **Auth (app)** | Firebase Auth (Google, telefone/SMS, e-mail/senha, convidado) |
| **Auth (admin)** | JWT próprio do `admin-api` (operadores) |
| **IA** | Google Gemini (assistente conversacional + RAG) |
| **Mapas** | Google Maps Platform (API) + flutter_map/OSM (UI) |
| **Push** | Firebase Cloud Messaging (FCM) |
| **Deploy API app** | Render |
| **Monorepo Node** | pnpm workspaces (`apps/backend`) |

### Quem fala com quem

```text
Flutter  ──REST/Firebase JWT──►  NestJS (:3000)  ──Prisma──►  PostgreSQL
Angular  ──REST/JWT admin────►  Spring (:8081)  ──JPA─────►  PostgreSQL
                                      ▲
                              mesmas tabelas de
                         knowledge / tips / campaigns
```

### Bibliotecas principais

**Backend do app** (`apps/backend`)

- `@nestjs/*` — framework HTTP, Swagger, throttling, jobs agendados
- `@prisma/client` — ORM e migrations (fonte da verdade do schema)
- `firebase-admin` — validação de ID token e FCM
- `@google/genai` — integração Gemini
- `class-validator` / `class-transformer` — validação de DTOs

**Mobile** (`apps/mobile`)

- `flutter_riverpod` — gerenciamento de estado
- `go_router` — navegação declarativa
- `firebase_core`, `firebase_auth`, `firebase_messaging`, `google_sign_in` — auth e push
- `http` — cliente REST (`ApiClient`)
- `flutter_map`, `latlong2`, `geolocator` — mapas e localização
- `shared_preferences` — cache local leve (preferências, não sensível)
- `connectivity_plus` — detecção de conectividade

**Admin API** (`apps/admin-api`)

- Spring Web / Data JPA / Security / Validation / Thymeleaf (`/health`)
- `springdoc-openapi` — Swagger UI
- `jjwt` — JWT de operador
- PostgreSQL JDBC — mesmo banco do NestJS (`ddl-auto: validate`)

**Admin web** (`apps/admin`)

- Angular standalone + Router + Forms
- HttpClient + interceptor Bearer
- Guards de autenticação (`authGuard` / `guestGuard`)

---

## Estrutura do repositório

```
Conecta-Geracao/
├── apps/
│   ├── mobile/           # App Flutter (usuário final)
│   │   └── lib/
│   │       ├── core/     # tema, rede, roteamento, widgets base
│   │       └── features/ # auth, chat, maps, notifications, shell, ...
│   ├── backend/          # API NestJS (@conecta-geracao/api)
│   │   ├── prisma/       # schema + migrations (inclui admin_users)
│   │   └── src/modules/  # conversations, knowledge-base, maps, notifications
│   ├── admin-api/        # API Spring Boot (backoffice)
│   └── admin/            # Painel Angular (backoffice)
├── memory-bank/          # Documentação AI-DLC (intents, bolts, standards)
├── public/telas/         # Referências visuais de UI
├── package.json          # Scripts raiz (pnpm → NestJS)
└── pnpm-workspace.yaml
```

---

## Pré-requisitos

| Ferramenta | Versão recomendada |
|------------|-------------------|
| **Node.js** | 20+ (LTS); Angular CLI 22 pode exigir Node ≥ 22.22 |
| **pnpm** | 9+ (`npm install -g pnpm`) |
| **Flutter** | 3.44+ (SDK Dart ^3.12) |
| **Java** | 17+ (para `admin-api`) |
| **Maven** | 3.9+ |
| **Docker** | Opcional (API NestJS em container) |

Contas e serviços externos necessários para desenvolvimento completo:

- **Firebase** — Auth, FCM e Google Sign-In (**apenas o app mobile / NestJS**)
- **Supabase** — PostgreSQL (`DATABASE_URL`)
- **Google Cloud** — Gemini API e Google Maps Platform
- **Render** — deploy da API NestJS em produção (opcional em dev local)

---

## Setup inicial

### 1. Clonar e instalar dependências Node (API do app)

```bash
git clone https://github.com/Kauan-Faria/Conecta-Geracao.git
cd Conecta-Geracao
pnpm install
```

### 2. Configurar variáveis de ambiente (NestJS)

```bash
cp apps/backend/.env.example apps/backend/.env
```

Preencha `apps/backend/.env` com credenciais reais. Variáveis obrigatórias para a API do app:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string Postgres (Supabase) |
| `DIRECT_URL` | URL direta para migrations Prisma |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `GEMINI_API_KEY` | Chave da API Gemini |
| `GOOGLEMAPS_API_KEY` | Chave Google Maps (Geocoding, Places, Routes) |

Variáveis opcionais: `SHADOW_DATABASE_URL`, `GEMINI_MODEL`, `FCM_ENABLED`, crons de notificação, etc. — ver `apps/backend/.env.example`.

> **Segurança:** nunca commite `.env` nem cole chaves/senhas neste repositório.

### 3. Banco de dados (Prisma)

```bash
pnpm api:prisma:generate   # gera o client Prisma
pnpm api:prisma:migrate    # aplica migrations (inclui admin_users)
pnpm api:prisma:seed       # seed idempotente (tópicos MVP, etc.)
```

### 4. Configurar Firebase no mobile

```bash
dart pub global activate flutterfire_cli
cd apps/mobile
flutterfire configure
```

Isso atualiza `lib/firebase_options.dart` com as credenciais do projeto.

- **Android:** adicione SHA-1/SHA-256 no console Firebase
- **iOS:** configure URL schemes do Google Sign-In

### 5. Dependências Flutter

```bash
cd apps/mobile
flutter pub get
```

### 6. Backoffice (opcional — painel + admin-api)

Configure o `admin-api` (mesmo Postgres; URL no formato JDBC):

```bash
export DATABASE_URL="jdbc:postgresql://<host>:5432/<database>"
export DB_USERNAME="postgres"
export DB_PASSWORD="sua-senha"
export ADMIN_JWT_SECRET="troque-por-uma-chave-longa-aleatoria"
export ADMIN_SEED_USERNAME="admin"
export ADMIN_SEED_PASSWORD="defina-uma-senha-forte"
export ADMIN_CORS_ORIGIN="http://localhost:4200"
```

Instale o painel Angular (projeto independente do workspace pnpm da raiz):

```bash
cd apps/admin
pnpm install
```

Detalhes: `apps/admin-api/README.md` e `apps/admin/README.md`.

---

## Executar em desenvolvimento

### API do app (NestJS)

Na raiz do monorepo:

```bash
pnpm api:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

Outros scripts úteis:

```bash
pnpm api:build            # build de produção
pnpm api:test             # testes Jest
pnpm api:prisma:generate  # regenerar Prisma client
pnpm api:prisma:migrate   # nova migration
pnpm api:prisma:seed      # reexecutar seed
```

### Mobile (Flutter)

```bash
cd apps/mobile
flutter run
```

Por padrão o app aponta para `http://localhost:3000`. Para outro host:

```bash
flutter run --dart-define=API_BASE_URL=https://sua-api.onrender.com
```

Atalhos no `flutter run`:

| Tecla | Ação |
|-------|------|
| `r` | Hot reload |
| `R` | Hot restart |
| `q` | Quit |

### Admin API (Spring Boot)

```bash
cd apps/admin-api
mvn spring-boot:run
```

- API: http://localhost:8081
- Swagger: http://localhost:8081/swagger-ui.html
- Health (Thymeleaf): http://localhost:8081/health

### Painel admin (Angular)

Com o `admin-api` no ar:

```bash
cd apps/admin
pnpm start
```

- UI: http://localhost:4200
- Login: credenciais seed (`ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD`)

Rotas principais: `/login`, `/home`, `/admin`, `/admin/conteudos`.

### Docker (API NestJS — opcional)

```bash
cd apps/backend
pnpm docker:up      # sobe API em background
pnpm docker:down    # para o container
pnpm docker:logs    # logs da API
pnpm docker:build   # build + sobe em background
```

---

## Testes

**Backend (NestJS)**

```bash
pnpm api:test
# ou dentro de apps/backend:
pnpm test:watch
```

**Mobile**

```bash
cd apps/mobile
flutter analyze
flutter test
```

**Admin (Angular)**

```bash
cd apps/admin
pnpm test
```

---

## Arquitetura (resumo)

- **Produto (MVP):** Flutter + NestJS — orientação digital, acessibilidade, IA, mapas, push
- **Backoffice (disciplina / operação):** Angular + Spring Boot — CRUD de tópicos, dicas e campanhas
- **Banco único:** Prisma migrations definem o schema; o Spring usa `ddl-auto: validate`
- **Auth separada:** Firebase no app do usuário; JWT de operador no painel
- **Mobile ↔ NestJS:** REST JSON; OpenAPI/Swagger; `X-Request-Id`
- **Angular ↔ admin-api:** REST JSON; interceptor `Authorization: Bearer <jwt>`
- **Estado mobile:** Riverpod por feature

Detalhes completos em `memory-bank/standards/`.

---

## Principais módulos

| Módulo | Descrição |
|--------|-----------|
| **Auth & Shell** | Login (Google, telefone, e-mail/senha, convidado), navegação, acessibilidade |
| **Conversations** | Chat com assistente IA (Gemini + RAG da base de conhecimento) |
| **Knowledge Base** | Tópicos curados (PIX, Gov.br, etc.); leitura no NestJS, escrita no admin-api |
| **Maps** | Busca de lugares, geocoding, rotas (proxy Google Maps na API) |
| **Notifications** | FCM, preferências, dicas e campanhas |
| **Backoffice** | Painel Angular + Spring Boot (operadores, JWT, Swagger) |

---

## Documentação do projeto

| Pasta / arquivo | Conteúdo |
|-----------------|----------|
| `memory-bank/standards/` | Arquitetura, tech stack, UX, convenções de API e código |
| `memory-bank/intents/` | Requisitos e unidades por capability |
| `memory-bank/bolts/` | Sessões de implementação (artefatos DDD) |
| `memory-bank/story-index.md` | Índice global de stories |
| `apps/mobile/README.md` | Detalhes do app Flutter |
| `apps/backend/` | API NestJS (scripts e `.env.example`) |
| `apps/admin-api/README.md` | API Spring Boot do backoffice |
| `apps/admin/README.md` | Painel Angular |

---

## Licença

ISC — ver `package.json`.
