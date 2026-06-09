---
intent: 001-digital-guidance
phase: inception
status: units-decomposed
updated: 2026-06-02T18:00:00Z
---

# Orientação digital guiada — Unit Decomposition

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Chat com assistente IA | `004-digital-guidance-ui` |
| FR-2 | Diagnóstico por etapas (checkpoints) | `003-ai-assistant-api` |
| FR-3 | Base de conhecimento | `002-knowledge-base` |
| FR-4 | Tópicos cobertos no MVP (6 assuntos) | `002-knowledge-base` |
| FR-5 | Guardrails de segurança e privacidade | `003-ai-assistant-api` |
| FR-6 | Histórico de conversas | `003-ai-assistant-api` |
| FR-7 | Acesso offline parcial | `004-digital-guidance-ui` |
| FR-8 | Autenticação acessível (telefone + alternativas) | `001-mobile-auth-shell` |
| FR-8.1 | Perfil mínimo (nome de exibição) | `001-mobile-auth-shell` |
| FR-8.2 | Modo convidado (sessão efêmera) | `001-mobile-auth-shell` |
| FR-9 | Preferências de acessibilidade | `001-mobile-auth-shell` |
| FR-10 | Entrada assistida por sugestões | `004-digital-guidance-ui` |
| FR-11 | Tela inicial (Home) | `004-digital-guidance-ui` |

## Units Overview

Este intent decompõe em **4 units**:

### Unit 1: `001-mobile-auth-shell`

**Description**: Shell do app Flutter, autenticação acessível (telefone SMS + alternativas), onboarding de nome e preferências de acessibilidade.

**Stories**: 7 | **Complexity**: M | **Priority**: Must

**Deliverables**: Login por telefone (OTP + autofill + textos orientativos), nome obrigatório, Google alternativo, convidado efêmero (IA sem histórico remoto), navegação e acessibilidade.

**Dependencies**: Nenhuma

---

### Unit 2: `002-knowledge-base`

**Description**: Módulo backend da base de conhecimento — tópicos, passos e checkpoints dos 6 assuntos MVP.

**Stories**: 3 | **Complexity**: M | **Priority**: Must

**Deliverables**: Schema Prisma, seed dos 6 tópicos, API de consulta para RAG.

**Dependencies**: Nenhuma (paralelo ao auth shell)

---

### Unit 3: `003-ai-assistant-api`

**Description**: API de chat com IA — RAG, fluxo de checkpoints, guardrails LGPD, persistência de conversas.

**Stories**: 5 | **Complexity**: L | **Priority**: Must

**Deliverables**: Endpoints de chat/conversas, integração LLM, políticas de segurança.

**Dependencies**: `001-mobile-auth-shell` (auth), `002-knowledge-base` (conteúdo RAG)

---

### Unit 4: `004-digital-guidance-ui`

**Description**: UI mobile do assistente — tela de chat, atalhos de tópicos, histórico e cache offline.

**Stories**: 5 | **Complexity**: L | **Priority**: Must

**Deliverables**: Chat acessível, lista de conversas, modo offline parcial, atalhos dos 6 tópicos.

**Dependencies**: `001-mobile-auth-shell`, `003-ai-assistant-api`

## Unit Dependency Graph

```text
001-mobile-auth-shell ──────────────────────────────┐
                                                     │
002-knowledge-base ──► 003-ai-assistant-api ──► 004-digital-guidance-ui
                              ▲                      │
                              └──────────────────────┘
```

## Execution Order

1. **Semana 1–2**: `001-mobile-auth-shell` + `002-knowledge-base` (paralelo)
2. **Semana 3–5**: `003-ai-assistant-api`
3. **Semana 5–8**: `004-digital-guidance-ui`
4. **Semana 9–12**: Testes com usuários reais e refinamento de conteúdo/prompts
