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
| PostgreSQL | Render (managed) ou provedor externo (Neon, Supabase Postgres, etc.) |

MVP com pouca operação: Firebase para auth, Render para API e opção de Postgres gerenciado no mesmo provedor ou externo conforme custo/escala.

## Package Manager

**pnpm** — monorepo e API Node; já adotado na raiz do repositório.

## Decision Relationships

- Firebase Auth → NestJS deve validar tokens antes de endpoints protegidos
- PostgreSQL → escolha de ORM/cliente definida em `data-stack.md`
- Flutter ↔ API: contratos via REST; tipos podem ser alinhados via OpenAPI no futuro
