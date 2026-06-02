---
intent: 001-digital-guidance
phase: inception
status: context-defined
updated: 2026-05-28T01:00:00Z
---

# Orientação digital guiada — System Context

## System Overview

App mobile **Flutter** + API **NestJS** que oferece um **assistente conversacional com IA** para analfabetos digitais. A IA consulta uma **base de conhecimento** curada (6 tópicos MVP), faz **checkpoints** para saber em que etapa o usuário está e orienta passo a passo — sem pedir senhas ou tokens. Autenticação via **Firebase**; conversas persistidas no **Postgres/Supabase**.

## Context Diagram

```mermaid
flowchart TB
    User["Usuário digital<br/>(20–70+ anos)"]
    App["Conecta Geração<br/>Flutter App"]
    API["Conecta Geração API<br/>NestJS"]
    Firebase["Firebase Auth"]
    LLM["Provedor LLM<br/>(OpenAI/Gemini)"]
    DB["Supabase Postgres"]
    KB["Base de conhecimento<br/>(curada)"]

    User -->|"mensagens, checkpoints"| App
    App -->|"REST + Bearer token"| API
    App -->|"login"| Firebase
    API -->|"valida token"| Firebase
    API -->|"RAG + prompt"| LLM
    API -->|"consulta tópicos/passos"| KB
    API -->|"conversas, mensagens"| DB
    KB -->|"armazenado em"| DB
```

## Actors

- **Usuário digital** (Human): Analfabeto digital, smartphone próprio, usa o app sozinho; idade 20–70+.
- **Equipe de conteúdo** (Human, interno): Curadoria dos 6 tópicos e checkpoints na base de conhecimento (MVP: seed estático/JSON).
- **API NestJS** (System): Orquestra chat, RAG, guardrails e persistência.
- **Provedor LLM** (External System): Gera respostas conversacionais a partir do contexto RAG.

## External Integrations

| Sistema | Direção | Dados | Protocolo | Risco |
|---------|---------|-------|-----------|-------|
| Firebase Auth | App ↔ API | ID token, `firebase_uid` | SDK / Admin SDK | Médio |
| Provedor LLM | API → externo | Prompt + contexto RAG (sem PII sensível) | HTTPS REST | Alto |
| Supabase Postgres | API ↔ DB | Conversas, mensagens, tópicos, passos | Prisma/SQL | Médio |
| Render | Deploy API | — | HTTPS | Baixo |

## Data Flows

### Inbound (para o sistema)

| Origem | Dados | Validação |
|--------|-------|-----------|
| App mobile | Mensagem do usuário, resposta de checkpoint (sim/não/texto) | Auth Firebase; sanitização; rate limit |
| App mobile | Preferências de acessibilidade | Auth; enum validado |
| Admin/seed | Tópicos e passos da base | Schema validado; revisão humana |

### Outbound (do sistema)

| Destino | Dados | Garantia |
|---------|-------|----------|
| App mobile | Resposta da IA (texto simples, 1 passo por vez) | Entrega síncrona; fallback em erro LLM |
| App mobile | Lista/histórico de conversas | Paginação; cache local opcional |
| Provedor LLM | Prompt + chunks RAG | Sem senhas/tokens; minimização LGPD |
| Postgres | Conversas, mensagens, metadados de checkpoint | Persistência transacional |

## High-Level Constraints

- LGPD: minimização de dados; sem armazenar credenciais digitadas no chat
- Gov.br: **somente conteúdo educativo** — sem OAuth/integração de login
- MVP em ~3 meses; escala de testes ~100 sessões simultâneas
- Offline: leitura de conversas cacheadas; chat ao vivo exige rede
- Linguagem e UX conforme `memory-bank/standards/ux-guide.md`

## Key NFR Goals

- Latência IA p95 < 8s (MVP)
- Guardrails: IA nunca solicita senha, token, OTP ou PIN
- WCAG 2.1 AA no chat e navegação
- Respostas derivadas da base de conhecimento (RAG), não alucinação livre
