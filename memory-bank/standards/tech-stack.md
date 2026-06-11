# Tech Stack

## Overview

Aplicativo mobile **Flutter (Dart)** com **API NestJS (TypeScript)** e autenticação **Firebase Auth**. Deploy da API no **Render**, com **PostgreSQL** para persistência. Gerenciador de pacotes Node: **pnpm**.

## Languages

- **Dart** — aplicativo mobile (Flutter)
- **TypeScript** — API backend (NestJS)

Dart oferece UI performática e experiência nativa no mobile. TypeScript no backend alinha com o ecossistema NestJS, tipagem forte e boa integração com ferramentas de API.

## Framework

- **Flutter** — cliente mobile (iOS/Android)
- **NestJS** — API REST/HTTP estruturada com módulos, DI e guards

NestJS facilita organização em APIs médias/grandes (módulos, validação, guards para auth). Flutter é o framework padrão para o app mobile neste projeto.

## Authentication

**Firebase Auth** (MVP: login com Google)

- Flutter: autenticação via Firebase SDK; usuário obtém ID token
- NestJS: validação do token com **Firebase Admin SDK** (guard/middleware)
- Cliente envia: `Authorization: Bearer <firebase-id-token>`

Rationale: setup rápido no MVP, login social (Google) sem implementar OAuth do zero; validação centralizada na API.

## Infrastructure & Deployment

| Componente | Plataforma |
|------------|------------|
| Auth | Firebase |
| API NestJS | Render |
| PostgreSQL | Supabase (managed) |
| Maps (backend proxy) | Google Maps Platform (`GOOGLEMAPS_API_KEY` no servidor) |
| Push notifications | Firebase Cloud Messaging (FCM) |

MVP com pouca operação: Firebase para auth e push, Render para API, Supabase para Postgres. Chaves de APIs pagas (Google Maps) ficam somente no backend.

## External Services

| Serviço | Uso | Onde configurar |
|---------|-----|-----------------|
| Google Maps Platform | Geocoding, Places, Directions (intent maps) | `apps/backend/.env` |
| Firebase Admin | Validação de ID token na API | `apps/backend/.env` |
| Provedor LLM | Respostas do assistente (Gemini) | `apps/backend/.env` |

## Package Manager

**pnpm** — monorepo e API Node; já adotado na raiz do repositório.

## Decision Relationships

- Firebase Auth → NestJS deve validar tokens antes de endpoints protegidos
- PostgreSQL → escolha de ORM/cliente definida em `data-stack.md`
- Flutter ↔ API: contratos via REST; tipos podem ser alinhados via OpenAPI no futuro
