---
stage: plan
bolt: 022-auth-ui-foundation
created: 2026-06-11T23:45:00Z
---

## Implementation Plan: 001-mobile-auth-login-ui

### Objective

Entregar a fundação visual do fluxo de auth mobile: componentes compartilhados reutilizáveis e redesign das telas welcome (`/login`), telefone (`/login/phone`) e OTP (`/login/otp`) alinhados aos mockups em `public/telas/`, sem alterar a lógica Firebase existente.

### Deliverables

- `AuthBrandHeader`, `AuthCtaButton`, `AuthScreenScaffold` em `presentation/widgets/`
- `BrazilPhoneField` com seletor BR (+55) e máscara `(00) 00000-0000`
- `OtpPinInput` com 6 caixas e suporte a autofill SMS
- Refatoração de `login_page.dart`, `phone_login_page.dart`, `phone_otp_page.dart`
- Rota stub `/login/email` (placeholder até bolt 023)
- Testes widget das telas e componentes; `auth_routing_test` atualizado

### Dependencies

- **021-mobile-auth-login-gate-refactor** (complete): login gate, convidado efêmero e roteamento base estáveis
- **AppColors / AppSpacing / BrandTheme**: tokens de design já existentes
- **phone_auth_controller.dart**: lógica Firebase preservada integralmente

### Technical Approach

1. Extrair padrões visuais repetidos (header de marca, CTAs teal/azul com `arrow_circle_right`) em widgets dedicados
2. Substituir `AppScaffold` + `AppButton` nas telas internas de auth por `AuthScreenScaffold` + `AuthCtaButton`
3. `OtpPinInput`: campo oculto com `AutofillHints.oneTimeCode` + 6 caixas visuais sincronizadas
4. `LoginPage`: migrar `_LoginCtaButton` para `AuthCtaButton`; manter layout e Semantics existentes
5. Rota `/login/email`: página stub mínima com `AuthScreenScaffold`; bolt 023 implementará o fluxo real
6. Botão OTP secundário usa `Icons.arrow_circle_left`; link de reenvio SMS mantido como `TextButton` discreto

### Acceptance Criteria

- [ ] Welcome, telefone e OTP visualmente alinhados a `public/telas/` (191528, 191536, 191540)
- [ ] OTP em 6 caixas com autofill SMS (`AutofillHints.oneTimeCode`)
- [ ] "Se cadastrar de outra forma" navega para `/login/email`
- [ ] "Voltar e editar telefone" retorna à tela telefone com número preservado (`pop`)
- [ ] Testes widget das telas refatoradas passando
- [ ] Sem regressão convidado / telefone / Google
