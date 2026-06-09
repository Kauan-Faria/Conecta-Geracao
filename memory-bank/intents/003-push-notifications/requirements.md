---
intent: 003-push-notifications
phase: inception
status: draft
created: 2026-06-08T22:00:00Z
updated: 2026-06-08T23:00:00Z
---

# Requirements: Notificações push com Firebase Cloud Messaging

## Intent Overview

Integrar **Firebase Cloud Messaging (FCM)** no Conecta-Geração para enviar notificações push a **usuários autenticados**, reengajando-os com lembretes de conversa, respostas da IA em background, dicas educativas e campanhas administrativas. O envio é **exclusivamente pelo backend** (NestJS), com arquitetura modular preparada para evolução (`NotificationsModule`, `DeviceToken`, `NotificationPreference`, `PushNotificationProvider`).

Esta intent complementa `001-digital-guidance` e `002-in-app-maps-navigation`. Push estava fora de escopo no MVP original da home; agora entra como capacidade incremental, **após auth, chat e maps estarem estáveis**.

**Problema que resolve**: usuários abandonam conversas ou não retornam ao app; sem push, perdem respostas da IA em background e dicas que poderiam ajudá-los no dia a dia digital.

**Beneficiários**: usuários autenticados (login Google ou telefone). **Convidados (guest) não recebem push no MVP.**

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Reengajar usuários com conversas abandonadas | Taxa de `notification_opened` em lembretes de conversa | Must |
| Entregar resposta da IA quando app está em background | % de notificações de resposta abertas vs enviadas | Must |
| Difundir dicas educativas (ex.: golpes) | Taxa de abertura de dicas periódicas | Should |
| Campanhas administrativas pelo backend | Campanhas enviadas com sucesso via API interna | Should |
| Consentimento e privacidade respeitados | 100% dos envios respeitam opt-in e preferência do usuário | Must |
| Observabilidade do funil de notificações | Eventos de analytics registrados (ver FR-10) | Must |

---

## Functional Requirements

### FR-1: Integração FCM no app Flutter
- **Description**: O app mobile integra `firebase_messaging` e registra o dispositivo para receber notificações push via FCM, reutilizando o projeto Firebase existente (`conecta-geracao`).
- **Acceptance Criteria**:
  - Pacote `firebase_messaging` adicionado e inicializado após `firebase_core`
  - App obtém token FCM do dispositivo quando elegível (usuário autenticado + consentimento)
  - Suporte a **notificações em background** (app fechado ou em segundo plano)
  - Suporte a **banner in-app simples** quando app está em **foreground**
  - Tratamento de erros de token (retry ou re-registro na próxima sessão)
- **Priority**: Must

### FR-2: Solicitação de permissão contextual (não na primeira abertura)
- **Description**: O app **não** solicita permissão de notificação na primeira abertura. A permissão é pedida **após o usuário perceber valor**, preferencialmente após usar o chat ou ativar recurso que justifique notificações.
- **Acceptance Criteria**:
  - Primeira abertura do app **não** exibe prompt de permissão de notificação
  - Prompt aparece em momento contextual (ex.: após primeira conversa útil, ao retomar chat, ou ao ativar recurso que depende de notificações)
  - Diálogo em linguagem simples explica **por que** notificações ajudam (frases curtas, conforme `ux-guide.md`)
  - Consentimento explícito antes de registrar token e enviar ao backend
  - Se usuário nega: app continua funcional; pode ser solicitado novamente em contexto futuro (sem spam)
  - Evento `notification_permission_granted` ou `notification_permission_denied` registrado
- **Priority**: Must

### FR-3: Registro e gestão de token FCM no backend
- **Description**: O backend persiste o token FCM associado ao usuário autenticado (`firebaseUid`), permitindo envio direcionado e limpeza no logout.
- **Acceptance Criteria**:
  - Endpoint autenticado para registrar/atualizar token FCM (`POST` ou `PUT`)
  - Token vinculado a `firebaseUid` do usuário logado
  - Suporte a múltiplos dispositivos por usuário (opcional no MVP: um token ativo por dispositivo)
  - Token **removido ou inativado** no logout do app
  - Evento `notification_token_registered` registrado após sucesso
  - Tokens de usuários convidados **não** são registrados
- **Priority**: Must

### FR-4: Preferência geral de notificações
- **Description**: Usuário pode ativar ou desativar notificações nas configurações do app. Sem categorias configuráveis no MVP.
- **Acceptance Criteria**:
  - Toggle "Receber notificações" nas configurações (alvo ≥ 48dp, rótulo textual)
  - Estado persistido no backend (`NotificationPreference`) e refletido no app
  - Com notificações desativadas: backend **não envia** push ao usuário
  - Categorias configuráveis (lembretes, dicas, campanhas) ficam **fora de escopo** — fase futura
  - Alteração de preferência tem efeito imediato nas próximas tentativas de envio
- **Priority**: Must

### FR-5: Lembrete de conversa abandonada
- **Description**: Backend envia notificação quando usuário abandonou conversa ativa por período configurável, incentivando retomada.
- **Acceptance Criteria**:
  - Job ou trigger no backend detecta conversa sem atividade por X horas (valor configurável, ex.: 24h)
  - Notificação contém título e corpo genéricos (ex.: "Você tem uma conversa em andamento") — **sem** conteúdo pessoal completo da conversa no payload
  - Deep link abre a **conversa específica** no chat
  - Não envia se preferência desativada ou sem token ativo
  - Respeita limite de frequência (ex.: no máximo 1 lembrete por conversa por dia)
  - Evento `notification_sent` registrado
- **Priority**: Must

### FR-6: Notificação de resposta da IA em background
- **Description**: Quando o usuário envia mensagem e o app vai para background antes da resposta da IA, o backend notifica quando a resposta estiver pronta.
- **Acceptance Criteria**:
  - Disparo apenas se app não está em foreground no momento da resposta (ou política equivalente documentada)
  - Corpo da notificação é resumo genérico (ex.: "Sua orientação está pronta") — **sem** transcrever resposta completa da IA
  - Deep link abre a **conversa** onde a resposta foi gerada
  - Não envia se preferência desativada
  - Evento `notification_sent` registrado
- **Priority**: Must

### FR-7: Dicas educativas periódicas
- **Description**: Backend envia dicas educativas em intervalos configuráveis (ex.: "como evitar golpes"), alinhadas à missão do app.
- **Acceptance Criteria**:
  - Conteúdo curado e pré-aprovado (não gerado dinamicamente por LLM no envio)
  - Frequência configurável no backend (ex.: no máximo 1 dica por semana por usuário)
  - Deep link abre tela relevante (home, chat com tópico sugerido, ou rota definida no payload)
  - Não envia se preferência desativada
  - Evento `notification_sent` registrado
- **Priority**: Should

### FR-8: Campanhas administrativas (backend)
- **Description**: Equipe interna dispara campanhas manuais via backend (API interna ou job), sem painel admin no MVP.
- **Acceptance Criteria**:
  - Endpoint ou comando interno permite enviar notificação para segmento (todos ativos, lista de UIDs, ou critério simples)
  - Payload inclui título, corpo genérico e deep link interno
  - Apenas usuários com preferência ativa e token válido recebem
  - Registro de campanha (id, data, contagem enviada) para auditoria mínima
  - Evento `notification_sent` por destinatário
- **Priority**: Should

### FR-9: Deep link ao tocar na notificação
- **Description**: Ao tocar na notificação, o app abre a tela correta via deep link interno, preservando sessão autenticada.
- **Acceptance Criteria**:
  - Payload FCM inclui campo estruturado de deep link (ex.: `route`, `conversationId`, `topicId`)
  - App em cold start, background ou foreground navega para destino correto
  - Rotas suportadas no MVP: chat/conversa, home, mapas (quando aplicável)
  - Deep link inválido ou expirado exibe fallback amigável (ex.: abre home)
  - Evento `notification_opened` registrado com tipo de notificação e rota
- **Priority**: Must

### FR-10: Eventos de analytics do funil de notificações
- **Description**: Sistema registra eventos para medir permissão, registro, envio e abertura.
- **Acceptance Criteria**:
  - `notification_permission_granted` — usuário concedeu permissão
  - `notification_permission_denied` — usuário negou permissão
  - `notification_token_registered` — token enviado e persistido com sucesso
  - `notification_sent` — backend confirmou envio FCM (por tipo: reminder, ai_response, tip, campaign)
  - `notification_opened` — usuário tocou na notificação
  - Eventos incluem metadados mínimos (tipo, timestamp); **sem** dados sensíveis ou conteúdo pessoal
- **Priority**: Must

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Registro de token | Latência p95 | < 500ms |
| Envio FCM (backend → dispositivo) | Latência p95 após trigger | < 5s |
| Abertura por deep link | Tempo até tela destino | < 2s (warm start) |

### Scalability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Usuários com token ativo | Volume MVP | Até 10.000 |
| Campanhas em lote | Throughput | 100 envios/minuto sem degradar API |

### Security & Privacy
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Consentimento | Opt-in explícito | Permissão contextual + toggle nas configurações |
| Payload | Sem dados sensíveis | Sem senhas, tokens, OTP, conteúdo completo de conversa |
| Notificação visível | Privacidade na lock screen | Corpo genérico; detalhes só dentro do app autenticado |
| Token FCM | Associado a usuário autenticado | Removido/inativado no logout |
| LGPD | Minimização de dados | Payload mínimo; preferência e token com base legal documentada |
| Endpoints de registro | Autenticados | Firebase ID token obrigatório |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Entrega FCM | Taxa de sucesso (tokens válidos) | > 95% |
| Token inválido | Limpeza automática | Backend marca token inativo após erro FCM permanente |
| Jobs de lembrete/dicas | Idempotência | Não duplicar notificação para mesmo evento |

### Accessibility
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Diálogo de permissão | `ux-guide.md` | Linguagem simples, alvos ≥ 48dp |
| Banner foreground | Legível | Contraste AA; texto curto |
| Configurações | TalkBack/VoiceOver | Toggle com label semântico |

### Compliance
| Requirement | Standard | Notes |
|-------------|----------|-------|
| LGPD | Consentimento e direito de oposição | Toggle desativa envios; token removido no logout |
| Firebase / FCM | Termos Google | Uso conforme políticas do projeto Firebase existente |

---

## Constraints

### Technical Constraints

**Padrões do projeto** (Construction Agent):
- Flutter + `firebase_core` / `firebase_auth` já integrados
- NestJS + Firebase Admin SDK (`firebase-admin`)
- PostgreSQL para persistência
- pnpm no monorepo

**Restrições específicas deste intent**:
- Reutilizar projeto Firebase `conecta-geracao` (sem novo projeto)
- Envio **apenas pelo backend** — sem painel admin, sem Firebase Console como fluxo operacional no MVP
- Arquitetura backend: `NotificationsModule`, entidades/VOs `DeviceToken`, `NotificationPreference`, port `PushNotificationProvider` (FCM via Admin SDK)
- **Prioridade de implementação**: após auth, chat e maps estáveis
- Convidados (guest) **fora de escopo** para push no MVP
- Categorias de notificação configuráveis **fora de escopo** no MVP

### Business Constraints
- Conteúdo de dicas e campanhas deve ser curado/aprovado antes do envio
- Frequência de notificações deve evitar fadiga (limites por tipo documentados no bolt)

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Auth, chat e maps estáveis antes deste intent | Retrabalho em deep links ou sessão | Executar bolt após dependências concluídas |
| Firebase Admin SDK já configurado no backend | Setup adicional de credenciais FCM | Documentar no bolt; validar `GOOGLE_APPLICATION_CREDENTIALS` |
| Usuários autenticados têm smartphone com FCM suportado | iOS/Android sem Google Play Services (edge) | Tratar erro graciosamente; não bloquear app |
| Analytics pipeline aceita novos eventos | Eventos não visíveis em dashboard | Definir destino (Firebase Analytics, logs estruturados) no bolt |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Intervalo exato para "conversa abandonada" (ex.: 24h) | Product | Construction | Pending — default 24h no bolt |
| Frequência máxima de dicas educativas | Product | Construction | Pending — default 1/semana |
| Destino de analytics (Firebase Analytics vs logs) | Engineering | Construction | Pending |
| API de campanha: REST interno vs CLI | Engineering | Bolt plan | Pending |

---

## Out of Scope (MVP)

- Painel administrativo web para campanhas
- Categorias configuráveis de notificação (lembretes vs dicas vs campanhas)
- Push para usuários convidados (guest)
- Notificações rich media (imagens, ações múltiplas)
- A/B testing de mensagens
- Integração com email ou SMS como canal alternativo
