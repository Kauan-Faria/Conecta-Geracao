---
intent: 008-admin-oracle-persistence
created: 2026-09-26T12:07:00Z
completed:
status: in-progress
---

# Inception Log: admin-oracle-persistence

## Overview

**Intent**: Camada Oracle local no admin para monitorar o consumo da IA, com PL/SQL chamado pelo Java.
**Type**: brown-field / infrastructure
**Created**: 2026-09-26T12:07:00Z

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | aprovados, aguardando Checkpoint 3 | requirements.md |
| System Context | criado | system-context.md |
| Units | criado | units.md + 2 unit-briefs |
| Stories | criado (10) | units/*/stories/*.md |
| Bolt Plan | criado (3) | bolts/033, 034, 035 |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 8 |
| Non-Functional Requirements | 5 grupos |
| Units | 2 |
| Stories | 10 |
| Bolts Planned | 3 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-oracle-consumption-api | 7 | 033, 034 | Must |
| 002-admin-consumption-ui | 3 | 035 | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-09-26 | Oracle só no admin (Angular + admin-api) | O admin-api já é Java/JDBC. Migrar NestJS, Prisma e o app quebraria o produto sem atender melhor o enunciado | Sim |
| 2026-09-26 | PostgreSQL/Supabase permanece para o app e o backoffice atual | Prisma é a fonte do schema compartilhado; Spring valida esse schema | Sim |
| 2026-09-26 | Domínio = entidades do Conecta Geração + leituras de consumo da IA | Não há sensores. O consumo da IA ocupa o papel das leituras críticas do enunciado | Sim |
| 2026-09-26 | Métrica = tokens por usuário; alerta quando o consumo fica alto | Checkpoint 1. Limite padrão documentado: 10.000 tokens no período | Sim |
| 2026-09-26 | Público = somente o operador do admin | Checkpoint 1 | Sim |
| 2026-09-26 | Oracle instalado na máquina, sem Docker | Checkpoint 1 | Sim |
| 2026-09-26 | Oracle persiste só a série simulada | O chat real continua no Supabase | Sim |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-09-26 | Fora: sensores físicos e migração total para Oracle | Pedido do produto | Escopo limitado ao admin |

## Ready for Construction

**Checklist**:
- [ ] All requirements documented
- [ ] System context defined
- [ ] Units decomposed
- [ ] Stories created for all units
- [ ] Bolts planned
- [ ] Human review complete

## Next Steps

1. Checkpoint 3 — revisão dos artefatos
2. Se aprovado: marcar inception completa e oferecer a construção
