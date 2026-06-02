import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:flutter/material.dart';

class ChatInputBar extends StatelessWidget {
  const ChatInputBar({
    required this.controller,
    required this.onSend,
    required this.isSending,
    this.enabled = true,
    super.key,
  });

  final TextEditingController controller;
  final VoidCallback onSend;
  final bool isSending;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(top: BorderSide(color: brand.divider)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Semantics(
              textField: true,
              label: 'Digite sua mensagem',
              child: TextField(
                controller: controller,
                enabled: enabled && !isSending,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: enabled ? (_) => onSend() : null,
                decoration: InputDecoration(
                  hintText: 'Digite sua mensagem...',
                  hintStyle: theme.textTheme.bodyLarge?.copyWith(
                    color: AppColors.onSurfaceMuted,
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm + 4,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(brand.borderRadius + 8),
                    borderSide: BorderSide.none,
                  ),
                ),
                style: theme.textTheme.bodyLarge,
              ),
            ),
          ),
          SizedBox(width: AppSpacing.sm),
          Semantics(
            button: true,
            label: 'Gravar mensagem de voz, em breve',
            child: SizedBox(
              height: AppSpacing.minTouchTarget,
              child: FilledButton.icon(
                onPressed: !enabled || isSending
                    ? null
                    : () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Gravação de voz em breve. Use o teclado por enquanto.',
                            ),
                          ),
                        );
                      },
                icon: const Icon(Icons.mic, size: 20),
                label: const Text('Gravar'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(brand.borderRadius + 8),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
