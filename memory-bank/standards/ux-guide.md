# UX Guide

## Overview

Interface **Flutter** com **Material 3** e **design tokens** centralizados. Temas dinâmicos (claro, escuro, alto contraste) ligados às preferências do usuário. Foco em **acessibilidade** para público idoso e conexão entre gerações. MVP em **portrait** apenas.

## Design System / Component Library

**Material 3** customizado com tokens:

- `AppColors` — paleta completa da marca (teal primário, superfícies, texto, bordas, alto contraste)
- `BrandTheme` (`ThemeExtension`) — tokens de UI: cards, links, divisores, sombras e raio de borda
- `AppSpacing` — escala consistente (8dp base, ajustável por densidade reduzida)
- `AppTypography` — escalas de texto (normal, grande, extra grande)

Widgets base reutilizáveis em `apps/mobile/lib/core/widgets/` (ex.: `AppButton`, `AppCard`, `AppScaffold`).

## Styling Approach

- **`ThemeData`** + **`ThemeExtension`** para tokens e variantes de acessibilidade
- **Temas dinâmicos**: claro / escuro / alto contraste
- Preferências persistidas em cache local (não sensível) e aplicadas via Riverpod
- Features consomem tema via `Theme.of(context)`, `AppColors` e `context.brand` — sem cores hardcoded

## Paleta de cores (Figma)

| Token | Hex | Uso |
|-------|-----|-----|
| `AppColors.primary` | `#00838F` | Botões, links, destaques |
| `AppColors.primaryDark` | `#006973` | Estados pressionados |
| `AppColors.primaryLight` | `#EBF5F3` | Fundos decorativos (nuvem) |
| `AppColors.accent` | `#5BC4BE` | Realces e detalhes |
| `AppColors.background` | `#FFFFFF` | Fundo das telas de onboarding |
| `AppColors.surface` | `#F5F5F5` | Fundo das telas internas |
| `AppColors.onSurface` | `#1A1A1A` | Texto principal |
| `AppColors.onSurfaceVariant` | `#616161` | Subtítulos |
| `AppColors.border` | `#E0E0E0` | Bordas e divisores |

## Accessibility Standards

**WCAG 2.1 AA** com reforços para idosos:

| Requisito | Implementação |
|-----------|----------------|
| Contraste | AA mínimo; modo alto contraste disponível |
| Fonte | Tamanho ajustável (normal, grande, extra grande) |
| Densidade | Layout com menos informação por tela |
| Linguagem | Textos curtos, vocabulário simples |
| Ícones | Sempre acompanhados de rótulo textual |
| Toque | Alvos ≥ 48dp |
| Leitores de tela | `Semantics`, labels em botões e imagens |
| Movimento | Evitar animações excessivas; respeitar `reduce motion` |

Testar com TalkBack (Android) e VoiceOver (iOS) nos fluxos críticos.

## Responsive Design Strategy

**Mobile-first, portrait only (MVP)**

- Layout otimizado para telefone em orientação retrato
- Rotação bloqueada no MVP
- Tablet: mesma UI com margens maiores (sem layout dedicado no MVP)
- `MediaQuery.textScaler` respeitado + preferências do app

## Decision Relationships

- Tokens alimentam `ThemeExtension` e modos de acessibilidade
- Preferências de UX podem ser cache local (ver `system-architecture.md`)
- API não define UI; apenas dados e mensagens amigáveis para `ApiException`
