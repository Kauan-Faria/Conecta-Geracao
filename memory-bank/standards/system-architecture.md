# System Architecture

## Overview

**Modular monolith** NestJS com **DDD + arquitetura hexagonal** por bounded context. App **Flutter** consome **REST JSON** documentado em **OpenAPI/Swagger**. Estado no mobile com **Riverpod**. Persistência via **Prisma → Supabase Postgres**; auth via **Firebase** (validado na API).

## Architecture Style

**Modular monolith** (MVP)

- Um deploy da API no Render
- Módulos por domínio (`apps/backend/src/modules/{domain}/`)
- Camadas: `domain` → `application` → `infrastructure` → `presentation`
- Evolução futura: extrair bounded contexts para serviços se necessário

## API Design (Mobile ↔ Backend)

**REST JSON** sobre HTTPS

- NestJS controllers expõem recursos REST
- Documentação: **OpenAPI/Swagger** (gerada/mantida na API)
- Flutter: **`ApiClient`** centralizado (headers, auth token, `X-Request-Id`)
- Erros: **`ApiException`** mapeando resposta padronizada da API

**Cache local (Flutter)** — não é fonte da verdade

- Permitido para dados **não sensíveis**: preferências de acessibilidade, lista de tutoriais, progresso recente, último conteúdo acessado
- Implementação: Hive / Isar / SharedPreferences conforme o caso
- Regras críticas e dados de negócio: sempre da API

**Cache servidor (API)**: nenhum para dados de negócio no MVP; exceção escopada: cache in-memory de geocode no módulo maps (ADR-002); Redis avaliado sob demanda

## State Management (Flutter)

**Riverpod**

- Providers por feature
- Injeção de `ApiClient`, repositórios e use cases
- Testável com `ProviderContainer` overrides

## Caching Strategy

| Camada | MVP | Futuro |
|--------|-----|--------|
| API | Sem cache | Redis se leituras repetidas/escala |
| Flutter | Cache leve local (não sensível) | Mesma política; invalidar ao sync com API |
| CDN | Opcional `Cache-Control` em conteúdo público estático | Assets/tutoriais |

## Security Patterns

- **Autenticação**: Firebase Auth no app; **Firebase Admin SDK** guard no NestJS
- **Autorização**: `firebase_uid` correlacionado ao usuário no Postgres; regras por módulo/use case
- **Transporte**: HTTPS obrigatório
- **Input**: DTOs + `class-validator` / `class-transformer` na borda HTTP
- **Rate limiting**: básico no Render ou middleware NestJS
- **Supabase RLS**: políticas preparadas para eventual acesso direto ao Supabase; API usa connection com privilégios adequados (service role) via Prisma
- **Logging**: sem tokens/senhas/PII (ver `coding-standards.md`)
- **Correlação**: `X-Request-Id` Flutter → API → logs Pino

## Decision Relationships

- Hexagonal: ports na `application`, adapters em `infrastructure` (Prisma, Firebase, HTTP)
- OpenAPI é contrato entre `apps/backend` e `apps/mobile`
- Cache Flutter nunca substitui validação de regras na API
