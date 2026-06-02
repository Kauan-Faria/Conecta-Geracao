# Data Stack

## Overview

Persistência com **PostgreSQL** hospedado no **Supabase**. A API NestJS acessa o banco via **Prisma**. Autenticação permanece no **Firebase Auth** (não usa Supabase Auth no MVP).

## Database

**Supabase (PostgreSQL)**

- Postgres gerenciado com opção de Storage e Realtime no futuro
- Auth de usuários: Firebase Auth (Google no MVP)
- Dados de negócio (perfis, entidades do app) na API → Prisma → Supabase

Rationale: Postgres relacional e maduro; Supabase reduz operação; extras (Storage, Realtime) sem migrar de provedor. Firebase Auth mantém o fluxo de login já definido no tech stack.

## ORM / Database Client

**Prisma**

- Schema-first, migrations versionadas
- Tipos TypeScript gerados para a API NestJS
- Integração comum com NestJS (`PrismaService`)

Rationale: DX forte, migrations claras e alinhamento com TypeScript/NestJS.

## Decision Relationships

- `DATABASE_URL` aponta para o Postgres do Supabase (Render/NestJS em produção)
- Tabelas de usuário devem referenciar `firebase_uid` (ou campo equivalente) para correlacionar token Firebase com registro no Postgres
- Não usar Supabase Auth no MVP; guards NestJS validam Firebase ID token
- Prisma migrations rodam no pipeline/deploy da API, não no app Flutter
