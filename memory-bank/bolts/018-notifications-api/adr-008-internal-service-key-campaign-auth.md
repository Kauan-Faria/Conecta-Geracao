---
bolt: 018-notifications-api
created: 2026-06-09T23:17:23Z
status: accepted
---

# ADR-008: Autenticação de campanhas via internal service key

## Context

A story **005-tips-and-campaigns** exige endpoint interno `POST /notifications/campaigns` para operadores dispararem push manualmente, **sem painel admin web** no MVP. Endpoints de token/preferência (bolt 016) usam **Firebase Auth** (`Authorization: Bearer <id-token>`).

Campanhas não são ações de usuário final — são operações internas de produto/ops. Opções de auth:
- Firebase Auth com role `admin` custom claim
- API key / service key dedicada no header
- mTLS ou IP allowlist (Render)
- Endpoint desabilitado em produção (só CLI)

O MVP não tem painel admin, roles Firebase customizados nem infra mTLS. Equipe interna precisa disparar campanhas via curl/Postman/script.

## Decision

Proteger `POST /notifications/campaigns` com **`InternalServiceKeyGuard`**:

1. Header obrigatório: `X-Internal-Service-Key: <NOTIFICATIONS_INTERNAL_SERVICE_KEY>`
2. Valor comparado com env var `NOTIFICATIONS_INTERNAL_SERVICE_KEY` (secret no Render)
3. Ausente ou inválido → `401 Unauthorized`
4. Complementar com **ThrottlerGuard** global (ex.: 10 req/min por IP)
5. `requestedBy` na entidade `Campaign` = `"internal-service"` (MVP); header opcional `X-Requested-By` para identificar operador sem PII
6. **Não** expor a key em documentação pública ou repositório

Role admin Firebase fica **fase futura** quando existir painel ou operadores autenticados individualmente.

## Rationale

- Setup mínimo: uma env var, um guard NestJS
- Separa claramente auth de usuário (Firebase) vs auth interno (service key)
- Scripts de ops podem disparar campanhas sem token Firebase de usuário
- Throttling reduz risco de abuso se key vazar parcialmente
- Padrão comum em APIs internas de monolith MVP

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Firebase custom claim `admin` | Audit por operador; reutiliza auth existente | Requer setup claims; operador precisa login Google | Sem painel admin no MVP |
| Endpoint só em staging | Zero risco prod | Não atende campanhas reais em prod | Rejeitado por story |
| IP allowlist Render | Sem secret compartilhado | IPs dinâmicos; ops remoto difícil | Frágil para equipe distribuída |
| CLI NestJS command | Sem HTTP exposto | Menos flexível para integrações futuras | HTTP preferido na story |

## Consequences

### Positive

- Implementação rápida; testável com supertest + header mock
- Fronteira clara entre endpoints públicos autenticados e internos

### Negative

- Key compartilhada — sem audit por indivíduo no MVP
- Rotação de key requer redeploy coordenado

### Risks

- **Key leak**: mitigado por env secret, throttling, rotação documentada; nunca commitar key
- **Brute force**: mitigado por ThrottlerGuard e key longa (≥32 chars)

## Related

- **Stories**: 005-tips-and-campaigns
- **Standards**: `tech-stack.md` (Firebase Auth para endpoints de usuário)
- **Previous ADRs**: ADR-001 (endpoints públicos maps — contraste intencional: campanhas são internas)
