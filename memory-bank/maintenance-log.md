# Maintenance Log

Registro de sincronizações e correções de documentação do memory-bank.

---

## 2026-06-10T14:00:00Z - Doc Sync (Master Agent)

**Triggered by**: verificação de documentação desatualizada vs código atual

| Área | Alteração | Motivo |
|------|-----------|--------|
| `standards/system-architecture.md` | `apps/api` → `apps/backend` | Caminho real do monorepo |
| `standards/coding-standards.md` | `apps/api` → `apps/backend` + nota pacote pnpm | Alinhar estrutura de pastas |
| `standards/tech-stack.md` | Supabase, Google Maps, FCM | Refletir integrações atuais |
| `standards/decision-index.md` | Resumo ADR-002 atualizado | Cache geocode com Google |
| `intents/002-*/stories/001,002,006` | OSM → Google Maps Platform | ADR-011 implementado no código |
| `intents/002-*/unit-brief.md` | Integrações e critérios NFR | Remover referências OSM backend |
| `intents/002-*/requirements.md` | Out of scope contraditório removido | Google Maps já é provedor backend |
| `bolts/011-*/ddd-01,02,03,adr-002` | Gateways Google, 57 testes | Código em `apps/backend/src/modules/maps/` |
| `bolts/012-*/adr-005, ddd-02` | Contexto Google em vez de OSM | Decisão de desacoplamento mantida |
| `bolts/015-*/` | OSRM → Directions API | Rota via proxy backend Google |
| `bolts/002-knowledge-base/bolt.md` | `apps/api` → `apps/backend` | Caminho de implementação |
| `story-index.md` | `last_updated` | Sincronização pós-revisão |

**Não alterado (intencional)**:
- `adr-003-public-osm-stack.md` — mantido como histórico (status superseded)
- Slugs de stories `001-osm-proxy-endpoints` — nomes de arquivo preservados; conteúdo atualizado

---

## 2026-06-10T22:20:00Z - Doc Sync (Notifications + Dev Setup)

**Triggered by**: segunda passagem bolts 016–020 + limpeza readme

| Área | Alteração | Motivo |
|------|-----------|--------|
| `apps/backend/.env.example` | Variáveis completas (DB, Firebase, Gemini, Maps, Notifications) | Arquivo tinha só maps |
| `readme` | Guia dev sem credenciais | Referência segura de comandos |
| `bolts/018-notifications-api/` | Test stage complete; YAML → Prisma seed | ADR-009; ddd-03 existia |
| `bolts/019-push-notifications-ui/` | Status complete + test-walkthrough | Implementação já no código |
| `intents/003-*/unit-brief.md` | Stories Complete + critérios marcados | Bolts 016–018 entregues |
| `story-index.md` | `last_updated` | Sincronização |

---
