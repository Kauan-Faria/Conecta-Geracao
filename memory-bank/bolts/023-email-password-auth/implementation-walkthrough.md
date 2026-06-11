---
stage: implement
bolt: 023-email-password-auth
created: 2026-06-12T02:30:00Z
---

## Implementation Walkthrough: 001-mobile-auth-login-ui

### Summary

Implementado o fluxo completo de cadastro e login por e-mail/senha via Firebase Auth: repositório estendido, telas de cadastro/login e verificação de e-mail, contador de tentativas com recuperação de senha, e integração no GoRouter com gate `emailVerified`. O stub `/login/email` foi substituído pela implementação real.

### Structure Overview

A implementação segue a arquitetura feature-based existente em `features/auth/`: camada `data` (repositório + mapeamento de erros), `domain` (`AppUser` com `emailVerified`), `presentation` (controllers Riverpod + páginas usando widgets do bolt 022). O roteamento centraliza o gate de verificação em `email_verification_gate.dart` e lê estado de auth em tempo real dentro do callback `redirect` do GoRouter.

### Completed Work

- [x] `apps/mobile/lib/features/auth/domain/app_user.dart` — campo `emailVerified`
- [x] `apps/mobile/lib/features/auth/data/auth_repository.dart` — interface e-mail/senha
- [x] `apps/mobile/lib/features/auth/data/email_auth_error_messages.dart` — erros PT-BR testáveis
- [x] `apps/mobile/lib/features/auth/data/firebase_auth_repository.dart` — implementação Firebase
- [x] `apps/mobile/lib/features/auth/presentation/email_auth_controller.dart` — estado, contador, reset
- [x] `apps/mobile/lib/features/auth/presentation/email_auth_page.dart` — tela cadastro/login
- [x] `apps/mobile/lib/features/auth/presentation/email_verification_controller.dart` — reload e reenvio
- [x] `apps/mobile/lib/features/auth/presentation/email_verification_page.dart` — tela verificação
- [x] `apps/mobile/lib/features/auth/presentation/email_verification_gate.dart` — provider gate
- [x] `apps/mobile/lib/core/routing/app_router.dart` — rotas, redirects, gate em tempo real
- [x] `apps/mobile/test/helpers/fake_auth_repository.dart` — métodos e-mail para testes
- [x] `apps/mobile/test/features/auth/email_auth_error_messages_test.dart` — mapeamento erros
- [x] `apps/mobile/test/features/auth/email_auth_controller_test.dart` — contador e reset
- [x] `apps/mobile/test/features/auth/email_verification_gate_test.dart` — lógica gate
- [x] `apps/mobile/test/features/auth/auth_routing_test.dart` — rotas e redirect alternative
- [x] Removido `email_login_stub_page.dart`

### Key Decisions

- **Redirect com `ref.read`**: o callback `redirect` do GoRouter lê `authGate.user` em tempo real via `ref.read`, corrigindo estado obsoleto quando `RouterRefresh` dispara
- **Verificação antes do onboarding**: usuários com e-mail não verificado vão para `/login/email-verify` antes de `/onboarding/display-name`
- **Erros em arquivo separado**: `email_auth_error_messages.dart` permite testes unitários sem mock do Firebase SDK
- **Adaptação do mockup 191600**: ícone de envelope no lugar de OTP — Firebase usa link de confirmação, não código de 4 dígitos

### Deviations from Plan

- Arquivo `email_verification_controller.dart` adicionado (não listado no plano) para isolar lógica de reload/reenvio com cooldown
- Testes escritos durante implement (stage 3 documentará em `test-walkthrough.md`)

### Dependencies Added

- Nenhuma — `firebase_auth` já presente no projeto

### Developer Notes

- Habilitar **Email/Password** no Firebase Console (`conecta-geracao`) antes de testar em dispositivo
- `alternative_login_page.dart` permanece no código mas `/login/alternative` agora redireciona para `/login/email`
- Deep link de verificação de e-mail é nice-to-have futuro; fluxo atual usa botão "Avançar" com `reload()`
