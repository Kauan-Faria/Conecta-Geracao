import 'package:flutter/material.dart';

/// Paleta oficial do ConectaGeração (Figma + assets em `public/`).
///
/// Use estes tokens em todas as telas — evite cores hardcoded.
abstract final class AppColors {
  // ── Marca (teal) ──────────────────────────────────────────────────────────
  /// Cor principal: botões, links, destaques e ícones da marca.
  static const Color primary = Color(0xFF00838F);

  /// Teal mais escuro: estados pressionados e contraste reforçado.
  static const Color primaryDark = Color(0xFF006973);

  /// Teal claro: fundos decorativos (ex.: nuvem atrás do robô).
  static const Color primaryLight = Color(0xFFEBF5F3);

  /// Ciano de destaque: detalhes ilustrativos e realces suaves.
  static const Color accent = Color(0xFF5BC4BE);

  static const Color onPrimary = Color(0xFFFFFFFF);

  // ── Superfícies ─────────────────────────────────────────────────────────
  /// Fundo principal das telas (branco puro do Figma).
  static const Color background = Color(0xFFFFFFFF);

  /// Fundo alternativo do app (telas internas com leve contraste).
  static const Color surface = Color(0xFFF5F5F5);

  /// Fundo de cards e containers elevados.
  static const Color surfaceContainer = Color(0xFFFFFFFF);

  // ── Texto ─────────────────────────────────────────────────────────────────
  /// Texto principal e títulos.
  static const Color onSurface = Color(0xFF1A1A1A);

  /// Subtítulos e textos secundários.
  static const Color onSurfaceVariant = Color(0xFF616161);

  /// Texto auxiliar / placeholders.
  static const Color onSurfaceMuted = Color(0xFF9E9E9E);

  // ── Bordas e divisores ────────────────────────────────────────────────────
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFE0E0E0);

  // ── Feedback ──────────────────────────────────────────────────────────────
  static const Color error = Color(0xFFB00020);
  static const Color onError = Color(0xFFFFFFFF);

  // ── Sombras ───────────────────────────────────────────────────────────────
  static const Color shadow = Color(0x0A000000);

  // ── Alto contraste (acessibilidade) ───────────────────────────────────────
  static const Color highContrastBackground = Color(0xFF000000);
  static const Color highContrastSurface = Color(0xFF121212);
  static const Color onSurfaceHighContrast = Color(0xFFFFFFFF);
  static const Color highContrastPrimary = Color(0xFFFFEB3B);
  static const Color highContrastOnPrimary = Color(0xFF000000);

  /// Alias legado — preferir [onSurfaceHighContrast].
  static const Color highContrastOnSurface = onSurfaceHighContrast;

  /// Alias legado — preferir [primary].
  static const Color secondary = primary;

  /// CTA secundário azul (ex.: "Continua sem Cadastro", "Se cadastrar com o Google").
  static const Color secondaryCta = Color(0xFF0077FF);

  /// CTA verde-água (ações alternativas: "Entra com Email e senha", "Não possuo Cadastro").
  static const Color secondaryCtaTeal = Color(0xFF40A696);

  /// CTA azul escuro ("Entrar sem Cadastro").
  static const Color secondaryCtaIndigo = Color(0xFF1D4ED8);
}
