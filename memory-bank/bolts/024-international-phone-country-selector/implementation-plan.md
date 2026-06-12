---
stage: plan
bolt: 024-international-phone-country-selector
created: 2026-06-11T23:32:08Z
---

## Implementation Plan: 024-international-phone-country-selector

### Objective

Evoluir o campo de telefone de seletor estático BR (+55) para um seletor internacional com dropdown pesquisável, máscaras por país e alinhamento visual integrado ao campo de número — mantendo Firebase SMS **apenas para Brasil** no MVP.

### Deliverables

- [ ] `apps/mobile/lib/features/auth/domain/phone_country.dart` — catálogo estático `PhoneCountry` com ISO, nome PT, DDI, emoji, máscara, `formatDisplay()`, `toE164()`, `isComplete()`
- [ ] `apps/mobile/lib/features/auth/presentation/widgets/country_code_selector.dart` — bottom sheet com busca (nome ou DDI), bandeira + nome + DDI, alvos ≥ 48dp
- [ ] `apps/mobile/lib/features/auth/presentation/widgets/international_phone_field.dart` — substitui `BrazilPhoneField`; seletor + número com mesma altura/borda (`IntrinsicHeight` + `CrossAxisAlignment.stretch`)
- [ ] Refatorar `phone_login_page.dart` — usa `InternationalPhoneField`; validação de completude via país selecionado
- [ ] Refatorar `phone_auth_controller.dart` — bloqueio amigável para países ≠ BR (sem chamar Firebase); BR mantém fluxo E.164 existente
- [ ] Manter `brazil_phone_formatter.dart` como delegação interna de BR ou migrar lógica para `PhoneCountry.brazil` (sem duplicar regras)
- [ ] `apps/mobile/test/features/auth/phone_country_test.dart` — máscaras BR/US/PT, E.164, busca no catálogo
- [ ] `apps/mobile/test/features/auth/international_phone_field_test.dart` — alinhamento smoke, troca de país limpa dígitos, mensagem não-BR
- [ ] Atualizar `auth_phone_screens_test.dart` — adaptar asserts (+55 default, seletor clicável)

### Dependencies

- **022-auth-ui-foundation** (implement concluído): `BrazilPhoneField`, `PhoneLoginPage`, `PhoneAuthController`, testes base de telas telefone/OTP
- **Pacotes Flutter existentes**: nenhum novo pacote necessário (Material bottom sheet + `TextInputFormatter`)

### Technical Approach

#### 1. Modelo `PhoneCountry`

Classe imutável com campos: `isoCode`, `namePt`, `dialCode`, `flagEmoji`, `displayMask`, `maxNationalDigits`.

Métodos estáticos/de instância:

- `PhoneCountry.defaultCountry` → Brasil (`BR`, +55)
- `PhoneCountry.all` → lista ordenada (Brasil primeiro, demais alfabético em PT)
- `PhoneCountry.search(String query)` → filtra por `namePt` ou `dialCode` (case-insensitive)
- `formatDisplay(String digitsOnly)` → aplica máscara do país
- `toE164(String input)` → `+{dialCode}{digits}` ou `null` se incompleto
- `isComplete(String input)` → delega a `toE164`

**Escopo geográfico** (story 009):

- Todas as nações soberanas das Américas (Norte, Central, Caribe, Sul) — ~35 países
- Portugal
- Diáspora brasileira: DE, IT, ES, FR, GB, IE, NL, BE, CH, LU, JP, KR, IL, AO, MZ, CV, GW, ST, TL

Máscaras definidas por país (prioridade nos testes):

| País | Máscara | Dígitos nacionais |
|------|---------|-------------------|
| BR | `(00) 00000-0000` | 10–11 |
| US/CA | `(000) 000-0000` | 10 |
| PT | `000 000 000` | 9 |
| Demais | agrupamento genérico por blocos de 3–4 ou só dígitos + `maxNationalDigits` | variável |

Reutilizar lógica de `BrazilPhoneFormatter` para BR (delegar de `PhoneCountry` ou mover para método `_formatBrazil`).

#### 2. `CountryCodeSelector`

- Widget compacto (bandeira + DDI + ícone expand) com `Semantics(label: 'País selecionado: {nome}, código {ddi}')`
- `onTap` abre `showModalBottomSheet` com:
  - `TextField` de busca no topo
  - `ListView` scrollável; cada item ≥ 48dp: emoji + nome PT + DDI
  - Estado vazio: "Nenhum país encontrado"
  - Fallback emoji → código ISO se emoji não renderizar (via `ExcludeSemantics` no emoji + texto ISO reserva opcional)
- Fechar sheet ao selecionar; callback `onCountryChanged(PhoneCountry)`

#### 3. `InternationalPhoneField`

- `StatefulWidget` com `selectedCountry` (default BR) e `TextEditingController` externo
- Layout: `IntrinsicHeight` → `Row(crossAxisAlignment: stretch)` → seletor + `Expanded(TextField)`
- Bordas compartilhadas: mesma `OutlineInputBorder` / `Container` height via `AppSpacing.minTouchTarget`
- `TextInputFormatter` parametrizado pelo país selecionado
- Ao mudar país: limpar controller (story edge case)
- Placeholder/hintText = `displayMask` do país

#### 4. Integração `PhoneLoginPage` + `PhoneAuthController`

- `PhoneLoginPage`: trocar `BrazilPhoneField` → `InternationalPhoneField`; `isComplete` via país + número
- `PhoneAuthController.sendCode(rawPhone, {required PhoneCountry country})`:
  - Se `country.isoCode != 'BR'`: `errorMessage = 'Cadastro por SMS está disponível apenas para números do Brasil. Use "Se cadastrar de outra forma".'` — **return false**, sem Firebase
  - Se BR: manter `BrazilPhoneFormatter.toE164` ou `country.toE164` — fluxo inalterado

#### 5. Deprecação de `BrazilPhoneField`

- Substituir uso em `phone_login_page.dart`
- Manter arquivo temporariamente com `@Deprecated` apontando para `InternationalPhoneField`, ou remover se nenhum outro import (grep antes de deletar)

#### 6. Acessibilidade

- Semantics no seletor e no campo número
- Itens da lista com `Semantics(button: true, label: '{nome}, código mais {ddi}')`
- Mensagem de erro não-BR em `liveRegion`

### Acceptance Criteria

- [ ] Seletor e campo de número visualmente alinhados (mesma altura, bordas contínuas — corrige desnível da screenshot)
- [ ] Dropdown/bottom sheet com bandeira emoji + nome PT + DDI
- [ ] Catálogo inclui Américas + PT + países de diáspora listados na story
- [ ] Busca por nome ("port" → Portugal) ou DDI ("351" → Portugal)
- [ ] Brasil (+55) pré-selecionado na primeira abertura
- [ ] Máscara e placeholder atualizam ao trocar país (BR, US/CA, PT verificados)
- [ ] BR + número completo → Firebase SMS sem regressão (E.164 +55…)
- [ ] País ≠ BR + número completo → mensagem amigável PT-BR orientando cadastro alternativo; **sem** chamada Firebase
- [ ] TalkBack: seletor anuncia país + DDI; lista navegável
- [ ] Troca de país limpa/reformata dígitos inválidos
- [ ] Testes unit/widget passando; lint limpo

### Risks & Mitigations

| Risco | Mitigação |
|-------|-----------|
| Lista longa (~55 países) | Bottom sheet scrollável + busca |
| Máscaras imprecisas fora BR/US/PT | `maxNationalDigits` + formato genérico; testes focados nos 3 principais |
| Regressão fluxo BR | Manter testes E.164 existentes; smoke test `auth_phone_screens_test` |
| Bolt 022 ainda em test | Implementação de 022 já entregue; 024 não depende do test-walkthrough de 022 |

### Out of Scope (confirmado na story)

- Firebase Phone Auth internacional
- Lista ISO 3166 completa (~240)
- Detecção automática de país (SIM/GPS)
