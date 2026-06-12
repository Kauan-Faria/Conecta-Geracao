---
id: 009-international-phone-country-selector
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T23:55:00Z
assigned_bolt: 024-international-phone-country-selector
implemented: true
---

# Story: 009-international-phone-country-selector

## User Story

**As a** usuário ou familiar no exterior
**I want** escolher meu país no campo de telefone e ver a bandeira e o código corretos
**So that** eu reconheça meu número mesmo quando o cadastro por SMS ainda for só para o Brasil

## Acceptance Criteria

- [ ] **Given** tela de cadastro por telefone, **When** visualizo o campo, **Then** vejo seletor de país integrado ao campo de número (mesma altura, bordas alinhadas, sem desnível visual)
- [ ] **Given** seletor de país, **When** abro o dropdown, **Then** vejo lista com **bandeira emoji + nome do país + DDI** (ex.: 🇧🇷 Brasil +55)
- [ ] **Given** lista de países, **When** consulto o escopo, **Then** inclui **todas as Américas**, **Portugal** e países de **diáspora brasileira** (Alemanha, Itália, Espanha, França, Reino Unido, Irlanda, Países Baixos, Bélgica, Suíça, Luxemburgo, Japão, Coreia do Sul, Israel, Angola, Moçambique, Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Timor-Leste)
- [ ] **Given** dropdown aberto, **When** digito no campo de busca, **Then** filtro por nome do país ou DDI (ex.: "port" → Portugal; "351" → Portugal)
- [ ] **Given** app aberto pela primeira vez, **When** entro na tela telefone, **Then** **Brasil (+55)** está pré-selecionado
- [ ] **Given** seleciono um país, **When** o país muda, **Then** a **máscara do número** e o **placeholder** atualizam conforme o país (ex.: BR `(00) 00000-0000`, US/CA `(000) 000-0000`, PT `000 000 000`)
- [ ] **Given** Brasil selecionado, **When** número completo e toco "Avançar", **Then** fluxo Firebase SMS existente funciona sem regressão (E.164 +55…)
- [ ] **Given** país **diferente de Brasil**, **When** número completo na máscara local e toco "Avançar", **Then** vejo mensagem amigável em PT-BR simples orientando **"Se cadastrar de outra forma"** (e-mail/Google) — **sem** chamar Firebase Phone Auth (preparação visual; fora do MVP funcional)
- [ ] **Given** leitor de tela, **When** foco no seletor, **Then** anuncio inclui país selecionado e DDI; itens da lista são navegáveis
- [ ] **Given** troco de país, **When** havia dígitos no campo, **Then** campo de número é limpo ou reformatado sem caracteres inválidos

## Technical Notes

- Refatorar `BrazilPhoneField` → widget genérico (ex.: `InternationalPhoneField`) em `apps/mobile/lib/features/auth/presentation/widgets/`
- Catálogo estático `PhoneCountry` em `apps/mobile/lib/features/auth/domain/` com: `isoCode`, `namePt`, `dialCode`, `flagEmoji`, `displayMask`, `maxNationalDigits`, `formatDisplay()`, `toE164()`
- Máscaras por país via `TextInputFormatter` parametrizado; manter `BrazilPhoneFormatter` como implementação BR ou migrar lógica para o catálogo
- **Alinhamento UX**: `IntrinsicHeight` + `CrossAxisAlignment.stretch` ou `InputDecorator` compartilhado — seletor e `TextField` com mesma altura de borda
- Dropdown: `DropdownButtonFormField` customizado ou bottom sheet com `ListView` + `TextField` de busca (preferir bottom sheet para listas longas e alvos ≥ 48dp)
- Países não-BR: validar máscara localmente; bloquear envio SMS com mensagem clara (não erro técnico)
- Testes: widget do seletor, máscaras BR/US/PT, alinhamento visual smoke, mensagem ao tentar avançar com país não-BR

## Dependencies

### Requires
- 001-auth-shared-components
- 002-phone-screens-redesign (telas telefone/OTP base)

### Enables
- Futura story de Phone Auth internacional (fora do MVP)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Busca sem resultados | Mensagem "Nenhum país encontrado" |
| País BR → outro → BR | Volta máscara BR; número limpo |
| Fonte grande | Dropdown scrollável; alvos ≥ 48dp |
| Modo alto contraste | Bordas e foco visíveis no seletor integrado |
| Emoji de bandeira não renderiza | Fallback para código ISO (ex.: "BR") |

## Out of Scope

- Firebase Phone Auth para países fora do Brasil
- Lista completa ISO 3166 (~240 países)
- Detecção automática de país por SIM/GPS
- Vinculação de múltiplos números por conta
