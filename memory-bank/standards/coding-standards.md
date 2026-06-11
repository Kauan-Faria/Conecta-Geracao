# Coding Standards

## Overview

Padrões para código **Flutter (Dart)** e **API NestJS (TypeScript)** em monorepo. Formatação automatizada, linting equilibrado, testes focados em MVP, erros híbridos (Result + HTTP) e logging estruturado com correlação de requisições.

## Code Formatting

**Flutter**: `dart format` (configuração padrão do SDK)

**API (NestJS)**: **Prettier** com configuração mínima

**Enforcement**: format on save no IDE; validação em CI quando pipeline existir

## Linting

**Flutter**: `flutter_lints` (ou `very_good_analysis` para rigor extra)

**API (NestJS)**:
- ESLint com `@typescript-eslint/recommended`
- `strict: true` no `tsconfig.json`
- Proibir `any` implícito; preferir `unknown` quando tipo incerto

**Strictness**: equilibrado — bugs e más práticas sem excesso de ruído

## Naming Conventions

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Variáveis (Dart/TS) | camelCase | `userName`, `isActive` |
| Classes / widgets | PascalCase | `UserService`, `LoginPage` |
| Interfaces (TS) | PascalCase, sem prefixo `I` | `User`, `AuthRepository` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES`, `API_BASE_URL` |
| Arquivos Dart | snake_case | `login_page.dart` |
| Arquivos TS (módulos) | kebab-case | `user-service.ts` |
| NestJS classes | sufixo explícito | `UsersController`, `CreateUserUseCase` |
| Booleans | `is` / `has` / `can` | `isLoading`, `hasPermission` |

## File Organization

**Pattern**: monorepo por aplicativo + features no mobile + módulos/domínio na API

**Structure**:

```text
apps/
  mobile/                 # Flutter
    lib/
      features/           # feature-based
      core/               # shared: theme, routing, http client
  backend/                # NestJS (pacote pnpm: @conecta-geracao/api)
    src/
      modules/            # por domínio (bounded context)
        {domain}/
          domain/         # entities, value objects, domain errors
          application/    # use cases, ports
          infrastructure/ # adapters: prisma, firebase, http
          presentation/   # controllers, DTOs, filters
packages/                 # (futuro) contratos compartilhados
```

**API**: DDD + arquitetura hexagonal — domínio no centro; adapters na infraestrutura.

**Conventions**:
- Testes Flutter: `test/` espelhando `lib/features/`
- Testes API: co-located `*.spec.ts` ou pasta `__tests__/` por módulo
- Types/DTOs: co-located no módulo ou `dto/` dentro do módulo

## Testing Strategy

**Flutter**
- Framework: `flutter test`
- Widget tests nos fluxos críticos (login, navegação principal)

**API**
- Framework: **Jest**
- Unitários: domínio e use cases (sem dependências externas)
- Integração: controllers e repositories/adapters (com DB de teste ou mocks de porta)

**Coverage target**: caminhos críticos no MVP; expandir após primeiros intents

**Conventions**:
- Nomenclatura: `describe('CreateUserUseCase')` / `it('should ...')`
- Estrutura: Arrange-Act-Assert
- Mocks: nas portas (hexagonal), não no domínio

## Error Handling

**Pattern**: híbrido

- **Domínio / aplicação**: `Result<T, E>` — sem throw no core
- **Borda HTTP**: `HttpException` + **Exception Filter** → JSON padronizado
- **Flutter**: camada `ApiException` mapeando status + código + mensagem amigável

**API error format** (sugestão):

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Mensagem para o usuário",
  "requestId": "uuid"
}
```

**Custom errors**: classes de domínio (`DomainError`, `NotFoundError`, etc.) convertidas no filter

## Logging

**API**: **Pino** — logs JSON estruturados em produção

**Correlação**: header `X-Request-Id` enviado pelo Flutter; propagado em todos os logs da requisição

| Level | Usage |
|-------|-------|
| error | Falhas que exigem atenção |
| warn | Situação inesperada mas tratada |
| info | Eventos de negócio e request lifecycle |
| debug | Detalhes técnicos (apenas dev/staging) |

**Always log**: método, path, status, duração, `requestId`, `firebase_uid` (hash ou id, não token)

**Never log**: Firebase ID tokens, senhas, refresh tokens, PII sensível, dados de cartão

**Flutter**: `debugPrint` apenas em dev; erros de rede reportados via camada de observabilidade (futuro)
