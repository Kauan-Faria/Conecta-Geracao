# API Conventions

## Overview

API **REST JSON** NestJS com prefixo **`/api/v1/`**. Respostas em **envelope** com `data` e `meta`. Erros padronizados com `error`, `errors[]` de validação e `requestId`. Paginação **offset/limit**. Documentação **OpenAPI/Swagger**. Consumo pelo Flutter via **`ApiClient`** e **`ApiException`**.

## API Style

**REST** sobre HTTPS

- Recursos no plural: `/api/v1/tutorials`, `/api/v1/users/me`
- Verbos HTTP semânticos: GET, POST, PUT/PATCH, DELETE
- Status HTTP corretos (200, 201, 204, 400, 401, 403, 404, 409, 500)

## API Versioning

**URL prefix**: `/api/v1/`

- Global prefix no NestJS (`app.setGlobalPrefix` ou módulo versionado)
- Breaking changes → nova versão `/api/v2/`; `v1` mantida até deprecação do app

## Response Format (Success)

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

- `data`: payload (objeto, array ou `null`)
- `meta.requestId`: espelha `X-Request-Id` do cliente (gerado se ausente)

**Headers comuns (resposta)**:

- `X-Request-Id`: id da requisição

## Error Response Format

**HTTP status** + corpo:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem amigável para o usuário"
  },
  "errors": [
    { "field": "email", "message": "E-mail inválido" }
  ],
  "meta": {
    "requestId": "uuid"
  }
}
```

| Status | Uso | `error.code` (exemplos) |
|--------|-----|---------------------------|
| 400 | Validação | `VALIDATION_ERROR` |
| 401 | Token ausente/inválido | `UNAUTHORIZED` |
| 403 | Sem permissão | `FORBIDDEN` |
| 404 | Recurso não encontrado | `NOT_FOUND` |
| 409 | Conflito | `CONFLICT` |
| 500 | Erro interno | `INTERNAL_ERROR` |

- `errors[]`: presente em **400** de validação de campos; omitir ou `[]` nos demais casos
- `message`: linguagem simples (alinhado ao `ux-guide.md`)
- Stack trace: **nunca** em produção

**Flutter**: `ApiException` mapeia `statusCode`, `error.code`, `message`, `errors`

## Pagination Strategy

**Offset / limit** (query params)

```
GET /api/v1/tutorials?page=1&limit=20
```

**Resposta (lista)**:

```json
{
  "data": [],
  "meta": {
    "requestId": "uuid",
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

- `page`: 1-based
- `limit`: default 20, max 100
- Ordenação: `?sort=createdAt&order=desc` (quando aplicável)

## Authentication Headers

```
Authorization: Bearer <firebase-id-token>
X-Request-Id: <uuid>
Content-Type: application/json
Accept: application/json
```

## Decision Relationships

- OpenAPI deve refletir envelope, erros e paginação
- Exception Filter NestJS produz o formato de erro
- `coding-standards.md`: `Result` no domínio → convertido para este formato na borda HTTP
