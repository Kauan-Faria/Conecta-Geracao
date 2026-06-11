---
intent: 004-auth-login-experience
phase: inception
status: construction
created: 2026-06-11T22:00:00.000Z
updated: 2026-06-11T23:30:00.000Z
---

# Requirements: Experiência de login e cadastro (UI + e-mail/senha)

## Intent Overview

Alinhar **todas as telas de autenticação** do app Flutter ao esboço visual em `public/telas/` e ampliar os métodos de login para incluir **cadastro e entrada por e-mail e senha** via Firebase Auth, além dos fluxos existentes (telefone SMS, Google e convidado).

Esta intent **complementa e refina** `001-digital-guidance` / unit `001-mobile-auth-shell`. Não substitui shell, roteamento base nem modo convidado — evolui a **camada de UI** e adiciona **e-mail/senha** como caminho alternativo de cadastro.

**Referência visual**: `public/telas/` (5 telas: welcome, telefone, confirmar telefone, registro e-mail, confirmar e-mail).

**Problema que resolve**: a UI atual das telas internas de auth diverge do design aprovado; usuários e familiares que preferem e-mail/senha não têm esse caminho no app.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| UI de login fiel ao design | Telas 1–5 reproduzem layout, copy e CTAs dos mockups | Must |
| Cadastro por e-mail funcional | Usuário cria conta, verifica e-mail e acessa o app | Must |
| Login por e-mail para quem já tem conta | Entrada com e-mail + senha sem refazer cadastro | Must |
| Manter telefone como caminho principal | Fluxo telefone continua acessível a partir de "Fazer cadastro" | Must |
| Google como alternativa rápida | Botão Google na tela de registro por e-mail | Must |
| Recuperação de senha acessível | Após 4 erros de login, usuário vê "Esqueci minha senha" e recebe e-mail de reset | Must |
| Acessibilidade preservada | WCAG 2.1 AA conforme `ux-guide.md` | Must |

---

## Functional Requirements

### FR-1: Tela inicial (welcome / login gate)
- **Description**: Primeira tela ao abrir o app sem sessão — idêntica ao mockup `191528.png`.
- **Acceptance Criteria**:
  - Logo ConectaGeração, headline "Use seu celular com **mais segurança**", subtítulo orientativo
  - Ilustração robô + nuvem e cards de benefícios (Evite erros, Passo a passo, Mais segurança)
  - CTA primário teal **"Fazer cadastro"** → fluxo telefone (`/login/phone`)
  - CTA secundário azul **"Continua sem Cadastro"** → modo convidado (story 007 intent 001)
  - Tokens `AppColors` / assets existentes; alvos ≥ 48dp
- **Priority**: Must

### FR-2: Layout compartilhado das telas internas de auth
- **Description**: Telas 2–5 compartilham cabeçalho de marca (logo + nome + divisor), sem AppBar genérico.
- **Acceptance Criteria**:
  - Widget reutilizável (`AuthBrandHeader` ou equivalente) em todas as telas internas
  - Botões primário (teal) e secundário (azul `#0077FF`) com ícone seta em círculo, como no mockup
  - Fundo branco, tipografia e espaçamentos conforme `ux-guide.md`
  - `Semantics` e rótulos em todos os CTAs
- **Priority**: Must

### FR-3: Cadastro por telefone (UI)
- **Description**: Tela de telefone conforme mockup `191536.png`.
- **Acceptance Criteria**:
  - Título **"Vamos fazer seu cadastro"**
  - Instrução: preencher número de telefone
  - Campo com seletor BR (+55) e máscara `(00) 00000-0000`
  - Botão **"Avançar"** (teal) envia SMS via Firebase Phone Auth
  - Botão **"Se cadastrar de outra forma"** (azul) → tela de registro por e-mail
  - Validação: botão desabilitado até número completo
- **Priority**: Must

### FR-4: Confirmação por SMS (UI + OTP)
- **Description**: Tela OTP conforme mockup `191540.png`, adaptada ao padrão Firebase (6 dígitos).
- **Acceptance Criteria**:
  - Título **"Vamos finalizar seu cadastro"**
  - Texto explicativo sobre SMS e código
  - Entrada OTP em **6 caixas individuais** (estilo visual do mockup; Firebase envia 6 dígitos)
  - Autofill SMS (`AutofillHints.oneTimeCode`) quando disponível
  - Botão **"Avançar"** confirma código
  - Botão **"Voltar e editar telefone"** retorna à tela anterior
  - Mensagens de erro em português simples
- **Priority**: Must

### FR-5: Cadastro e login por e-mail e senha
- **Description**: Tela conforme mockup `191555.png` + entrada para usuários existentes.
- **Acceptance Criteria**:
  - Título **"Vamos fazer seu cadastro"** (modo cadastro) ou **"Entrar com e-mail"** (modo login)
  - Campos: e-mail, senha; no cadastro, **confirmar senha**
  - Link **"Já tenho conta"** / **"Criar conta"** alterna entre cadastro e login
  - Botão **"Avançar"**: `createUserWithEmailAndPassword` (cadastro) ou `signInWithEmailAndPassword` (login)
  - Botão **"Se cadastrar com o Google"** (cadastro) ou **"Entrar com o Google"** (login)
  - Validação: senhas coincidem (cadastro), mínimo 6 caracteres (Firebase), e-mail válido
  - Erros Firebase mapeados para PT-BR (e-mail em uso, senha fraca, credenciais inválidas)
- **Priority**: Must

### FR-6: Verificação de e-mail pós-cadastro
- **Description**: Tela conforme mockup `191600.png`, integrada ao fluxo Firebase.
- **Acceptance Criteria**:
  - Exibida após cadastro por e-mail (não após login de conta já verificada)
  - Título **"Vamos finalizar seu cadastro"**
  - Texto orientando verificação por e-mail (link enviado pelo Firebase)
  - Botão **"Avançar"**: recarrega usuário; se `emailVerified`, segue para onboarding de nome ou home
  - Botão **"Voltar e editar Email"** retorna à tela de e-mail
  - Botão/link **"Reenviar e-mail"** chama `sendEmailVerification()`
  - Deep link / retorno ao app após clicar no link do e-mail (quando configurado no Firebase)
- **Priority**: Must

### FR-7: Roteamento e fluxos integrados
- **Description**: GoRouter atualizado para novos caminhos sem quebrar convidado, Google ou telefone.
- **Acceptance Criteria**:
  - Rotas: `/login`, `/login/phone`, `/login/otp`, `/login/email`, `/login/email-verify`
  - `/login/alternative` redireciona ou é substituído pelo fluxo e-mail (Google permanece na tela e-mail)
  - Após qualquer login bem-sucedido: gate de nome (`/onboarding/display-name`) se necessário
  - Convidado e usuário autenticado: sem regressão no redirect existente
- **Priority**: Must

### FR-8: Repositório de auth estendido
- **Description**: `AuthRepository` / `FirebaseAuthRepository` com operações de e-mail.
- **Acceptance Criteria**:
  - `signUpWithEmailAndPassword(email, password)`
  - `signInWithEmailAndPassword(email, password)`
  - `sendEmailVerification()` após cadastro
  - `sendPasswordResetEmail(email)` para recuperação de senha
  - `reloadCurrentUser()` / checagem `emailVerified`
  - Mesmo `AppUser` + ID token para API backend
  - Email/Password habilitado no console Firebase
- **Priority**: Must

### FR-9: Segurança de senha (Firebase Auth)
- **Description**: Senhas de e-mail/senha nunca trafegam em texto plano para o backend NestJS nem são persistidas no Postgres.
- **Acceptance Criteria**:
  - Cadastro e login usam exclusivamente Firebase Auth (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`)
  - Firebase armazena a senha com hash **scrypt** nos servidores do Firebase (padrão do provedor)
  - Postgres mantém apenas `firebase_uid` e dados de negócio — **sem coluna de senha**
  - Senha nunca logada, nunca enviada à API NestJS; API valida apenas **Firebase ID token**
  - Mensagens de erro não revelam se o e-mail existe (credenciais inválidas genéricas)
- **Priority**: Must

### FR-10: Recuperação de senha após tentativas falhas
- **Description**: Usuários idosos ou com dificuldade que erram a senha repetidamente recebem ajuda explícita para redefinir a senha.
- **Acceptance Criteria**:
  - Contador de tentativas falhas **somente no modo login** (e-mail + senha), incrementado a cada `wrong-password` / `invalid-credential`
  - Após **4 tentativas falhas consecutivas**, exibir banner amigável em português simples (ex.: "Parece que você esqueceu a senha. Podemos te ajudar.")
  - CTA primário **"Esqueci minha senha"** (alvo ≥ 48dp) visível após o 4º erro; também disponível como link secundário antes do limite (opcional, discreto)
  - Ao tocar "Esqueci minha senha": chamar `sendPasswordResetEmail(email)` via Firebase Auth
  - Tela ou diálogo de confirmação: "Enviamos um e-mail para {email}. Siga o link para criar uma nova senha."
  - Contador **zera** após login bem-sucedido ou após envio bem-sucedido do e-mail de reset
  - Erros mapeados para PT-BR (`user-not-found` → orientar verificar e-mail; `invalid-email` → "E-mail inválido")
  - Fluxo acessível: TalkBack/VoiceOver nos CTAs e mensagens
- **Priority**: Must
- **Bolt**: `023-email-password-auth` (story `008-forgot-password-after-failed-attempts`)

---

## Non-Functional Requirements

| NFR | Requirement |
|-----|-------------|
| Acessibilidade | Alvos ≥ 48dp; TalkBack/VoiceOver nos fluxos novos |
| Segurança | Senha hasheada no Firebase (scrypt); nunca no Postgres; nunca logada; mensagens genéricas para credenciais inválidas |
| Recuperação | Reset via e-mail Firebase; contador local de tentativas (sem persistência sensível) |
| Performance | Transições de tela < 300ms; OTP responsivo |
| LGPD | Política de privacidade menciona e-mail para autenticação |

---

## Out of Scope

- Apple Sign-In
- Vinculação de métodos (link phone + email na mesma conta) — fase futura
- OTP de e-mail com 4 dígitos customizado (requer backend próprio; Firebase usa link)
- Alterações no backend NestJS (auth continua via Firebase ID token)

---

## Dependencies

| Dependency | Reason |
|------------|--------|
| `001-mobile-auth-shell` | Shell, router base, Firebase Auth, convidado |
| `public/telas/` | Referência visual |
| Firebase Console | Email/Password provider habilitado |
| `ux-guide.md` | Tokens e acessibilidade |

---

## Success Criteria (Intent)

- [ ] 5 telas visuais alinhadas aos mockups em `public/telas/`
- [ ] Cadastro completo: telefone **ou** e-mail **ou** Google **ou** convidado
- [ ] Login por e-mail para contas existentes
- [ ] Verificação de e-mail funcional após cadastro
- [ ] "Esqueci minha senha" após 4 erros de login + e-mail de reset Firebase
- [ ] Senhas protegidas via Firebase Auth (sem senha no Postgres)
- [ ] Testes widget/router cobrindo novos caminhos
