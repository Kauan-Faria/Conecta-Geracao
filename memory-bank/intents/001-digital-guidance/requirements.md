---
intent: 001-digital-guidance
phase: inception
status: inception-approved
updated: 2026-06-11T12:00:00Z
---

# Requirements: Orientação digital guiada

## Intent Overview

Permitir que **analfabetos digitais** (20–70+ anos, smartphone próprio, uso majoritariamente solo) sanem dúvidas práticas do mundo digital **dentro do app**, por meio de um **assistente conversacional com IA** que pergunta em que etapa o usuário está e o orienta passo a passo. A IA consulta uma **base de conhecimento** curada com fluxos sobre tarefas digitais comuns. MVP enxuto para testes com usuários reais em ~3 meses.

**Fora de escopo no MVP**: perfis de cuidadores; integração real com Gov.br para autenticação; pedir senhas, tokens ou credenciais.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Usuário resolve dúvida digital com orientação da IA | % de sessões que atingem checkpoint final do fluxo (meta a calibrar nos testes) | Must |
| Conversa clara e objetiva para execução da tarefa | Feedback qualitativo positivo em testes com usuários reais | Must |
| Cobertura dos fluxos críticos do MVP | 6 tópicos disponíveis na base de conhecimento e acionáveis via chat | Must |
| Experiência acessível | Conformidade com `ux-guide.md` (WCAG 2.1 AA + reforços) | Must |
| MVP entregável em ~3 meses | Testes com usuários reais iniciados no prazo | Must |

---

## Functional Requirements

### FR-1: Chat com assistente IA
- **Description**: O usuário inicia uma conversa no app e descreve sua dúvida em linguagem natural. A IA responde de forma conversacional, como um orientador humano.
- **Acceptance Criteria**:
  - Usuário pode enviar mensagem de texto e receber resposta da IA
  - Respostas em português, vocabulário simples e frases curtas
  - Uma mensagem da IA contém no máximo uma instrução principal por vez (passo a passo)
  - Histórico da conversa atual visível na tela de chat
- **Priority**: Must

### FR-2: Diagnóstico por etapas (checkpoints)
- **Description**: A IA pergunta em que ponto o usuário está (ex.: "Você já abriu o app do banco?") antes de avançar, confirmando se conseguiu executar cada etapa.
- **Acceptance Criteria**:
  - IA faz perguntas de checkpoint antes de instruir o próximo passo
  - Usuário pode responder sim/não ou descrever onde parou
  - IA adapta a resposta com base na resposta do usuário (não avança cegamente)
  - Fluxo registra etapa atual da sessão (para retomada e métricas)
- **Priority**: Must

### FR-3: Base de conhecimento para orientação
- **Description**: Conteúdo curado sobre tarefas digitais é armazenado e consultado pela IA para gerar respostas consistentes e corretas.
- **Acceptance Criteria**:
  - Base contém, no mínimo, os 6 tópicos do MVP (ver FR-4)
  - Cada tópico possui passos estruturados (etapas/checkpoints) consumíveis pela IA
  - Respostas da IA derivam da base (RAG ou equivalente), não apenas conhecimento livre do modelo
  - Conteúdo pode ser atualizado sem redeploy completo do app (via API/admin mínimo ou arquivos na API)
- **Priority**: Must

### FR-4: Tópicos cobertos no MVP
- **Description**: A base de conhecimento e a IA devem orientar sobre os seguintes assuntos:
  1. Como fazer um PIX
  2. Como obter/usar código Gov.br (tutorial informativo — **sem** integração de login)
  3. Como compartilhar contato ou localização pelo WhatsApp
  4. Como passar senha do Wi-Fi via QR Code
  5. Como emitir 2ª via de boleto
  6. Como reconhecer/aviso sobre possível golpe
- **Acceptance Criteria**:
  - Usuário consegue iniciar conversa sobre qualquer um dos 6 tópicos
  - IA conduz do início ao fim (ou até ponto seguro de parada) para cada tópico
  - Conteúdo Gov.br é exclusivamente educativo (não coleta credenciais nem autentica)
- **Priority**: Must

### FR-5: Guardrails de segurança e privacidade na conversa
- **Description**: A IA nunca solicita dados sensíveis proibidos e recusa pedidos perigosos.
- **Acceptance Criteria**:
  - IA **não** pede senha, token, OTP, PIN, credenciais bancárias ou dados equivalentes
  - IA orienta o usuário a inserir dados sensíveis **apenas** no app/sistema oficial, nunca no chat
  - Respostas sobre golpes incluem alerta claro sem induzir cliques em links desconhecidos
  - Logs e persistência seguem LGPD (sem armazenar dados sensíveis digitados pelo usuário)
- **Priority**: Must

### FR-6: Histórico de conversas
- **Description**: O usuário **autenticado** pode ver conversas anteriores para retomar contexto. Modo convidado **não** persiste histórico (ver FR-8.2).
- **Acceptance Criteria**:
  - Lista de conversas passadas acessível no app (somente usuário logado)
  - Usuário pode abrir conversa anterior e continuar (online)
  - Metadados mínimos: data, tópico inferido ou título, status (em andamento/concluída)
  - Convidado não vê lista de conversas anteriores na API nem retoma sessões passadas
- **Priority**: Should

### FR-7: Acesso offline parcial
- **Description**: Sem internet, o usuário acessa conversas antigas previamente carregadas.
- **Acceptance Criteria**:
  - Modo offline exibe conversas já sincronizadas/cacheadas
  - Novas mensagens à IA **não** funcionam offline (mensagem clara ao usuário)
  - Limite de contexto renderizado respeitado (conversas muito longas podem truncar ou paginar)
- **Priority**: Should

### FR-8: Autenticação acessível (telefone como caminho principal)
- **Description**: Usuários analfabetos digitais entram com **número de celular + código SMS**, sem depender de conta Google ou e-mail. Após validar o código, o app pergunta **como a pessoa quer ser chamada** e persiste o vínculo da conta. Métodos alternativos ficam em fluxo secundário ("Entrar de outra forma"). Autenticação continua via **Firebase Auth**; API valida ID token e associa conversas ao `firebase_uid`.
- **Acceptance Criteria**:
  - **Caminho principal**: tela com campo de telefone (máscara Brasil), botão para receber código SMS, campo de 6 dígitos e mensagens em português simples
  - **Tela do código (OTP)**: texto explicativo fixo de **como o código chega** (SMS no mesmo celular, 6 números, pode demorar alguns segundos) e o que fazer se não chegar (reenviar / "Entrar de outra forma"); sem jargão técnico
  - **Preenchimento do código**: suporte a **autofill** do SMS no Android e iOS (código sugerido acima do teclado ou preenchimento automático quando o SO permitir), para o usuário não precisar sair do app para copiar manualmente
  - **Primeiro acesso** (telefone novo no Firebase): após código válido, exibe modal/sheet "Como podemos te chamar?" com um campo **obrigatório** (mín. 2 caracteres, sem opção "Pular") e botão "Continuar"; nome salvo no perfil Firebase (`displayName`)
  - **Retorno**: usuário com telefone já cadastrado entra direto na home após código válido, sem pedir nome novamente
  - **Alternativo**: link "Entrar de outra forma" abre tela com **Google** (Must). **E-mail/senha** fica fora do onboarding — usuário pode vincular depois em Configurações, se quiser (fase futura)
  - Conversas e preferências vinculadas ao `firebase_uid` após login completo
  - Não existe fluxo de cuidador ou conta vinculada de terceiros
  - **Entrada sem autenticação**: usuário **sempre** cai na **tela de login** (não há welcome como porta de entrada); nessa tela decide fazer login por telefone **ou** entrar sem conta (ver FR-8.2)
  - **Modo convidado** permanece opcional na tela de login, claramente secundário ao login por telefone (ver FR-8.2)
  - OTP de login ocorre **somente** na tela de autenticação — a IA do chat **nunca** solicita código SMS (ver FR-5)
- **Priority**: Must

### FR-8.1: Perfil mínimo do usuário
- **Description**: Nome de exibição para personalizar saudações na home e futuras mensagens da IA.
- **Acceptance Criteria**:
  - Nome exibido na UI vem do `displayName` do Firebase após onboarding
  - Usuário pode alterar o nome depois em Configurações (Should — story separada se necessário)
  - Telefone não é exibido em telas sociais do app (privacidade)
- **Priority**: Must

### FR-8.2: Modo convidado (sessão efêmera)
- **Description**: Quem ainda não quer criar conta pode usar o app e **conversar com a IA**, mas **sem gravar histórico** na nuvem. **Cada abertura do app sem login** leva à tela de login, onde a pessoa escolhe entrar com telefone ou **entrar sem conta**; nesse segundo caso o chat **reinicia do zero** — não retoma conversas de visitas anteriores.
- **Acceptance Criteria**:
  - **Porta de entrada**: sem sessão autenticada, abrir o app **sempre** mostra a tela de login (não restaurar modo convidado automaticamente)
  - Tela de login oferece opção clara de **entrar sem conta** (secundária ao login por telefone), ex.: link "Sem cadastro, sem complicações"
  - Convidado acessa chat e recebe respostas da IA (mesma qualidade de orientação, dentro dos guardrails)
  - **Sem persistência remota**: conversas de convidado **não** são salvas na API / Postgres
  - **Sem retomada entre visitas**: ao fechar o app e abrir de novo sem login, o usuário volta à tela de login; se escolher convidado novamente, **chat reinicia** — sem lista de conversas anteriores nem continuação de thread antiga
  - **Sem persistência local entre visitas**: sessão convidado **não** sobrevive a cold start do app (sem reativar guest de SharedPreferences)
  - Durante **uma única visita** convidado (sem fechar o app), o usuário mantém contexto contínuo no chat até encerrar o app ou fazer login
  - CTA discreto no chat convidando a fazer login por telefone para **salvar** o histórico
  - Após login com telefone, histórico passa a ser o do usuário autenticado (FR-6)
- **Priority**: Must

### FR-9: Preferências de acessibilidade
- **Description**: Usuário ajusta fonte, contraste e densidade; chat respeita preferências.
- **Acceptance Criteria**:
  - Tamanho de fonte (normal/grande/extra grande) aplicado na UI do chat
  - Modo alto contraste disponível
  - Alvos de toque ≥ 48dp nos controles do chat
- **Priority**: Must

### FR-10: Entrada assistida por sugestões
- **Description**: Atalhos visuais reduzem a barreira de "o que perguntar". No chat vazio, exibe os 6 tópicos MVP; na tela inicial, exibe ações rápidas orientadas à intenção do usuário (ver FR-11).
- **Acceptance Criteria**:
  - Chat vazio exibe grid com os 6 tópicos MVP (PIX, Gov.br, WhatsApp, Wi-Fi, Boleto, Golpe)
  - Toque em tópico MVP inicia conversa com mensagem starter e `topicSlug` quando aplicável
- **Priority**: Should

### FR-11: Tela inicial (Home) como hub do assistente
- **Description**: A aba Início apresenta o valor do app e caminhos claros para iniciar uma conversa com a IA, conforme mockup aprovado.
- **Acceptance Criteria**:
  - **Cabeçalho**: logo + "ConectaGeração" + atalho para Configurações
  - **Hero**: título "Antes de fazer algo importante...", subtítulo "Confira rapidamente e evite erros.", botão "Quero ajuda agora >" que abre a aba Chat sem enviar mensagem
  - **Ações rápidas** ("O que você quer fazer?"): grid 2 colunas com os **6 atalhos MVP** (PIX, Gov.br, WhatsApp, Wi-Fi, Boleto, Golpe)
  - **Toque em atalho MVP**: navega para Chat, cria nova conversa com `topicSlug` e envia mensagem starter **relacionada à ação** (ex.: PIX → "Desejo fazer um PIX"; Gov.br → "Desejo ajuda com o código Gov.br")
  - **Verificações recentes**: exibe até 4 conversas recentes com data relativa; link "Ver todas" abre lista completa; toque em item reabre conversa no Chat
  - UI acessível: alvos ≥ 48dp, rótulos textuais, tokens de `ux-guide.md`
- **Priority**: Must

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Tempo de resposta da IA | p95 latência ponta a ponta | < 8s no MVP (ajustável) |
| Carregamento da lista de conversas | p95 | < 2s |
| Renderização de histórico longo | UX | Paginação ou truncamento sem travar UI |

### Scalability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Usuários simultâneos (MVP) | Sessões ativas | ~100 (fase de testes) |
| Tópicos na base | Registros | 6+ com expansão futura |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Autenticação | Firebase Auth + guard NestJS | Padrão do projeto |
| Dados em trânsito | HTTPS | Obrigatório |
| LGPD | Consentimento + minimização | Sem PII/sensível desnecessário em logs |
| Guardrails IA | Política no prompt + validação | Bloquear pedidos de credenciais |
| Base de conhecimento | Acesso restrito à API | Sem exposição pública não autenticada |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Disponibilidade API (MVP) | Uptime | Best effort Render; degradação graciosa no app |
| Falha do provedor IA | UX | Mensagem amigável + retry; não perder mensagem do usuário |

### Usability / Accessibility
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Linguagem | Vocabulário simples | Frases curtas; evitar jargão |
| WCAG | 2.1 AA + reforços idosos | Ver `ux-guide.md` |
| Feedback de progresso | Checkpoints | Usuário sabe se "conseguiu" ou "travou" |

### Compliance
| Requirement | Standard | Notes |
|-------------|----------|-------|
| LGPD | Lei 13.709/2018 | Base legal, retenção mínima, direito de exclusão (fase MVP: documentar) |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Flutter + NestJS + Firebase + Postgres/Supabase (ver `memory-bank/standards/`).

**Intent-specific constraints**:
- MVP enxuto — prazo ~3 meses para início dos testes
- Gov.br: **somente tutorial**; sem OAuth/integração Gov.br
- IA conversacional é **core** do MVP (não placeholder)
- Provedor de LLM e estratégia RAG a definir na Construction (OpenAI, Gemini, etc.)
- Offline limitado a histórico cacheado; chat ao vivo exige conexão
- Sem perfil de cuidador

### Business Constraints
- Público: analfabetos digitais 20–70+, smartphone próprio, uso solo
- Prioridade: MVP **utilizável** e conversacional, não feature-complete
- Custo de IA é secundário frente à entrega de valor percebido

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| RAG com base curada produz respostas confiáveis | Alucinações ou passos errados | Revisão humana do conteúdo; testes com usuários reais |
| 6 tópicos cobrem dúvidas iniciais do MVP | Baixa adoção | Expandir base após feedback dos testes |
| Usuários conseguem digitar ou usar sugestões | Barreira de entrada | FR-10 + FR-11 atalhos na home e no chat |
| Latência < 8s é aceitável para o público | Frustração | Indicador "pensando..."; otimizar prompts/RAG |
| Login por telefone é familiar ao público-alvo | Abandono no onboarding | SMS OTP + textos curtos; Google em segundo plano |
| Custo de SMS Firebase em testes | Orçamento | Números de teste no console; limitar reenvios |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Provedor de LLM (OpenAI, Gemini, outro)? | Tech | Construction | Pendente |
| Admin de conteúdo: JSON estático vs. painel mínimo? | Tech/Produto | Units | Pendente |
| Retenção de conversas (dias/meses) sob LGPD? | Produto/Legal | Antes dos testes | Pendente |
| Entrada por voz no MVP? | Produto | Pendente | Provável Won't no MVP |
| Manter atalhos MVP no chat vazio além da home? | Produto | 2026-06-02 | Sim — home para intenções genéricas; chat vazio mantém 6 tópicos curados |
| Ações rápidas fixas (4) ou configuráveis? | Produto | 2026-06-02 | Fixas no MVP conforme mockup |
| E-mail/senha no MVP ou só Google no alternativo? | Produto | 2026-06-02 | **Resolvido**: só Google no alternativo no bolt 010; e-mail/senha opcional depois em Configurações |
| Remover modo convidado após login por telefone? | Produto | 2026-06-02 | **Resolvido**: manter convidado; IA ok, sem histórico remoto, nova sessão a cada entrada |
| Nome obrigatório no 1º acesso? | Produto | 2026-06-02 | **Resolvido**: sim, sem "Pular" |
| Autofill OTP SMS? | Produto | 2026-06-02 | **Resolvido**: sim, com texto orientativo na tela do código |
| Welcome como porta de entrada vs. login direto? | Produto | 2026-06-11 | **Resolvido**: login é a porta de entrada; welcome removida do fluxo de gate; opção convidado na tela de login |
| Convidado persiste entre aberturas do app? | Produto | 2026-06-11 | **Resolvido**: não; cada abertura sem login → tela de login → escolha explícita; chat convidado reinicia |

---

## Out of Scope (MVP)

- Perfil ou fluxo de cuidador/familiar
- Integração Gov.br para autenticação
- Pedido ou armazenamento de senhas, tokens ou OTP **no chat com a IA** (login por SMS na tela de auth é permitido)
- CMS completo ou marketplace de tutoriais
- Chat offline com IA (apenas leitura de histórico)
- Entrada por voz (unless promoted later)
