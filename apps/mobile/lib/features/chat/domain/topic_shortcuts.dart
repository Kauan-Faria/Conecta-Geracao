import 'package:flutter/material.dart';

class TopicShortcut {
  const TopicShortcut({
    required this.slug,
    required this.shortLabel,
    required this.actionLabel,
    required this.starterMessage,
    required this.icon,
  });

  final String slug;
  final String shortLabel;
  final String actionLabel;
  final String starterMessage;
  final IconData icon;
}

const mvpTopicShortcuts = <TopicShortcut>[
  TopicShortcut(
    slug: 'fazer-pix',
    shortLabel: 'PIX',
    actionLabel: 'Fazer um PIX',
    starterMessage: 'Desejo fazer um PIX',
    icon: Icons.pix,
  ),
  TopicShortcut(
    slug: 'codigo-govbr',
    shortLabel: 'Gov.br',
    actionLabel: 'Código Gov.br',
    starterMessage: 'Desejo ajuda com o código Gov.br',
    icon: Icons.account_balance,
  ),
  TopicShortcut(
    slug: 'whatsapp-contato-localizacao',
    shortLabel: 'WhatsApp',
    actionLabel: 'Enviar mensagem',
    starterMessage: 'Desejo enviar mensagem pelo WhatsApp',
    icon: Icons.chat,
  ),
  TopicShortcut(
    slug: 'wifi-qr-code',
    shortLabel: 'Wi-Fi',
    actionLabel: 'Passar senha Wi-Fi',
    starterMessage: 'Desejo compartilhar a senha do Wi-Fi',
    icon: Icons.wifi,
  ),
  TopicShortcut(
    slug: 'segunda-via-boleto',
    shortLabel: 'Boleto',
    actionLabel: '2ª via de boleto',
    starterMessage: 'Desejo emitir a segunda via de boleto',
    icon: Icons.receipt_long,
  ),
  TopicShortcut(
    slug: 'alerta-golpe',
    shortLabel: 'Golpe',
    actionLabel: 'Verificar golpe',
    starterMessage: 'Desejo saber se é golpe',
    icon: Icons.warning_amber_rounded,
  ),
];

TopicShortcut? topicShortcutForSlug(String slug) {
  for (final shortcut in mvpTopicShortcuts) {
    if (shortcut.slug == slug) {
      return shortcut;
    }
  }
  return null;
}
