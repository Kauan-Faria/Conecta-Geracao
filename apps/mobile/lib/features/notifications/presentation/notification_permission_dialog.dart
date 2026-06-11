import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:flutter/material.dart';

Future<void> showNotificationPermissionDialog({
  required BuildContext context,
  required VoidCallback onAccept,
  required VoidCallback onDecline,
}) {
  return showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (dialogContext) {
      return AlertDialog(
        title: const Text('Quer receber avisos importantes?'),
        content: const Text(
          'Podemos avisar quando o assistente responder ou quando '
          'houver novidades para você. Você pode mudar isso depois '
          'nas configurações.',
        ),
        actions: [
          AppButton(
            label: 'Sim, quero receber',
            semanticLabel: 'Sim, quero receber avisos importantes',
            onPressed: () {
              Navigator.of(dialogContext).pop();
              onAccept();
            },
          ),
          SizedBox(height: AppSpacing.sm),
          AppButton(
            label: 'Agora não',
            semanticLabel: 'Agora não quero receber avisos',
            onPressed: () {
              Navigator.of(dialogContext).pop();
              onDecline();
            },
          ),
        ],
      );
    },
  );
}
