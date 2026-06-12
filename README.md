# Conecta Geração

Aplicativo mobile de **orientação digital** para analfabetos digitais (20–70+ anos). O app oferece um assistente conversacional com IA que guia o usuário passo a passo em tarefas do dia a dia — PIX, Gov.br, mapas, notificações e mais — com foco em **acessibilidade** e linguagem simples.

Monorepo com **API NestJS** em `apps/backend` e **app Flutter** em `apps/mobile`.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Mobile** | Flutter (Dart 3.12+), Riverpod, GoRouter, Material 3 |
| **Backend** | NestJS 10, TypeScript, Prisma, class-validator |
| **Banco de dados** | PostgreSQL (Supabase) |
| **Autenticação** | Firebase Auth (Google, telefone/SMS, e-mail/senha, convidado) |
| **IA** | Google Gemini (assistente conversacional + RAG) |
| **Mapas** | Google Maps Platform (API) + flutter_map/OSM (UI) |
| **Push** | Firebase Cloud Messaging (FCM) |
| **Deploy API** | Render |
| **Monorepo Node** | pnpm workspaces |

### Bibliotecas principais

**Backend** (`apps/backend`)

- `@nestjs/*` — framework HTTP, Swagger, throttling, jobs agendados
- `@prisma/client` — ORM e migrations
- `firebase-admin` — validação de ID token
- `@google/generative-ai` — integração Gemini
- `class-validator` / `class-transformer` — validação de DTOs

**Mobile** (`apps/mobile`)

- `flutter_riverpod` — gerenciamento de estado
- `go_router` — navegação declarativa
- `firebase_core`, `firebase_auth`, `firebase_messaging`, `google_sign_in` — auth e push
- `http` — cliente REST (`ApiClient`)
- `flutter_map`, `latlong2`, `geolocator` — mapas e localização
- `shared_preferences` — cache local leve (preferências, não sensível)
- `connectivity_plus` — detecção de conectividade

---

## Estrutura do repositório

```
Conecta-Geracao/
├── apps/
│   ├── backend/          # API NestJS (@conecta-geracao/api)
│   │   └── src/modules/  # conversations, knowledge-base, maps, notifications
│   └── mobile/           # App Flutter
│       └── lib/
│           ├── core/     # tema, rede, roteamento, widgets base
│           └── features/ # auth, chat, maps, notifications, shell, ...
├── memory-bank/          # Documentação AI-DLC (intents, bolts, standards)
├── public/telas/         # Referências visuais de UI
├── package.json          # Scripts raiz (pnpm)
└── pnpm-workspace.yaml
```

---

## Pré-requisitos

| Ferramenta | Versão recomendada |
|------------|-------------------|
| **Node.js** | 20+ (LTS) |
| **pnpm** | 9+ (`npm install -g pnpm`) |
| **Flutter** | 3.44+ (SDK Dart ^3.12) |
| **Docker** | Opcional (API em container) |

Contas e serviços externos necessários para desenvolvimento completo:

- **Firebase** — Auth, FCM e Google Sign-In
- **Supabase** — PostgreSQL (`DATABASE_URL`)
- **Google Cloud** — Gemini API e Google Maps Platform
- **Render** — deploy da API em produção (opcional em dev local)

---

## Setup inicial

### 1. Clonar e instalar dependências Node

```bash
git clone https://github.com/Kauan-Faria/Conecta-Gera-o.git
cd Conecta-Geracao
pnpm install
```

### 2. Configurar variáveis de ambiente (backend)

```bash
cp apps/backend/.env.example apps/backend/.env
```

Preencha `apps/backend/.env` com credenciais reais. Variáveis obrigatórias para a API funcionar:

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
pnpm api:prisma:migrate    # aplica migrations
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

---

## Executar em desenvolvimento

### API (backend)

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

### Docker (API — opcional)

```bash
cd apps/backend
pnpm docker:up      # sobe API em background
pnpm docker:down    # para o container
pnpm docker:logs    # logs da API
pnpm docker:build   # build + sobe em background
```

---

## Testes

**Backend**

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

---

## Arquitetura (resumo)

- **Backend:** modular monolith NestJS com DDD e arquitetura hexagonal por bounded context (`domain` → `application` → `infrastructure` → `presentation`)
- **Mobile ↔ API:** REST JSON sobre HTTPS; contrato documentado em OpenAPI/Swagger
- **Auth:** Firebase ID token no app → `Authorization: Bearer <token>` → validação com Firebase Admin SDK na API
- **Estado mobile:** Riverpod com providers por feature
- **Correlação de logs:** header `X-Request-Id` (Flutter → API)

Detalhes completos em `memory-bank/standards/`.

---

## Principais módulos

| Módulo | Descrição |
|--------|-----------|
| **Auth & Shell** | Login (Google, telefone, e-mail/senha, convidado), navegação, acessibilidade |
| **Conversations** | Chat com assistente IA (Gemini + RAG da base de conhecimento) |
| **Knowledge Base** | Tópicos curados (PIX, Gov.br, etc.) com passos estruturados |
| **Maps** | Busca de lugares, geocoding, rotas (proxy Google Maps na API) |
| **Notifications** | FCM, preferências, campanhas e dicas educacionais |

---

## Documentação do projeto

| Pasta / arquivo | Conteúdo |
|-----------------|----------|
| `memory-bank/standards/` | Arquitetura, tech stack, UX, convenções de API e código |
| `memory-bank/intents/` | Requisitos e unidades por capability |
| `memory-bank/bolts/` | Sessões de implementação (artefatos DDD) |
| `memory-bank/story-index.md` | Índice global de stories |
| `apps/mobile/README.md` | Detalhes específicos do app Flutter |
| `comando-info-proj.md` | Referência rápida de comandos de desenvolvimento |

---

## Licença

ISC — ver `package.json`.
