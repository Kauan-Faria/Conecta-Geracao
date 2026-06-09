---
stage: implement
bolt: 010-mobile-auth-phone
created: 2026-06-02T22:30:00Z
---

## Implementation Walkthrough: 010-mobile-auth-phone

### Summary

Autenticação mobile evoluída para telefone + SMS como fluxo principal, onboarding obrigatório de nome, Google apenas na tela alternativa, e modo convidado com chat local efêmero (sem API) e sem histórico entre reentradas.

### Structure Overview

Camada `features/auth` ganhou domínio de telefone (E.164, sessão OTP), repositório Firebase Phone Auth, controllers Riverpod (`PhoneAuthController`, gate de nome), e quatro telas de login/onboarding. Roteamento GoRouter inclui sub-rotas `/login/otp` e `/login/alternative` e `/onboarding/display-name`. Chat usa ramo convidado no `ChatController` com respostas locais stub.

### Completed Work

- [x] `apps/mobile/lib/features/auth/domain/brazil_phone_formatter.dart` — máscara BR e E.164 +55
- [x] `apps/mobile/lib/features/auth/domain/phone_verification_session.dart` — sessão OTP
- [x] `apps/mobile/lib/features/auth/data/auth_repository.dart` — contratos phone OTP e displayName
- [x] `apps/mobile/lib/features/auth/data/firebase_auth_repository.dart` — verifyPhoneNumber, confirm OTP, updateDisplayName
- [x] `apps/mobile/lib/features/auth/presentation/phone_auth_controller.dart` — envio/reenvio/confirmar código
- [x] `apps/mobile/lib/features/auth/presentation/display_name_gate.dart` — provider needsDisplayName
- [x] `apps/mobile/lib/features/auth/presentation/login_page.dart` — telefone principal
- [x] `apps/mobile/lib/features/auth/presentation/phone_otp_page.dart` — OTP com autofill e copy PT-BR
- [x] `apps/mobile/lib/features/auth/presentation/alternative_login_page.dart` — só Google
- [x] `apps/mobile/lib/features/auth/presentation/display_name_onboarding_page.dart` — "Como podemos te chamar?"
- [x] `apps/mobile/lib/features/auth/presentation/auth_controller.dart` — updateDisplayName, exit guest no login
- [x] `apps/mobile/lib/core/routing/app_router.dart` — rotas e redirects (nome pendente)
- [x] `apps/mobile/lib/core/routing/guest_session_gate.dart` — limpa histórico ao entrar como guest
- [x] `apps/mobile/lib/features/chat/presentation/chat_controller.dart` — chat convidado em memória
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` — banner convidado + chat habilitado
- [x] `apps/mobile/lib/features/home/presentation/home_page.dart` — copy convidado em verificações recentes
- [x] `apps/mobile/lib/features/shell/presentation/shell_pages.dart` — CTA celular nas configurações
- [x] `apps/mobile/lib/features/auth/presentation/welcome_page.dart` — invalida chat ao entrar como guest
- [x] `apps/mobile/test/helpers/fake_auth_repository.dart` — stubs phone/displayName
- [x] `apps/mobile/test/features/auth/brazil_phone_formatter_test.dart` — testes de formatação
- [x] `apps/mobile/test/features/auth/auth_routing_test.dart` — expectativas login telefone
- [x] `apps/mobile/test/features/chat/chat_page_test.dart` — guest com input de chat

### Key Decisions

- **Sem pacote `pinput`**: OTP com `TextField` + `AutofillHints.oneTimeCode` para reduzir dependências.
- **Chat convidado local**: API exige token Firebase; respostas stub no app alinhadas ao backend stub, sem persistência.
- **Auto-verify Android**: `verificationCompleted` completa sessão com id sentinel `__auto_verified__`.

### Deviations from Plan

Nenhuma significativa. Endpoint anônimo na API não foi criado (fora do escopo do bolt mobile).

### Dependencies Added

Nenhum pacote novo no `pubspec.yaml` (usa `firebase_auth` existente).

### Developer Notes

- Habilitar Phone Auth e números de teste no Firebase Console antes de testar SMS real.
- Teste manual TalkBack no fluxo telefone + onboarding no estágio Test.
- `app_shell_test` pode dar timeout em `pumpAndSettle` por loading da lista de conversas na home (ambiente sem API mock).
