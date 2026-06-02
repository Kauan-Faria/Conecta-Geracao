import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsAccessibilitySection extends ConsumerWidget {
  const SettingsAccessibilitySection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefs = ref.watch(accessibilityControllerProvider);
    final controller = ref.read(accessibilityControllerProvider.notifier);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Acessibilidade', style: theme.textTheme.titleLarge),
        SizedBox(height: AppSpacing.md),
        Text('Tamanho da fonte', style: theme.textTheme.bodyLarge),
        SizedBox(height: AppSpacing.sm),
        Semantics(
          label: 'Tamanho da fonte',
          child: SegmentedButton<AppFontScale>(
            segments: AppFontScale.values
                .map(
                  (scale) =>
                      ButtonSegment(value: scale, label: Text(scale.label)),
                )
                .toList(),
            selected: {prefs.fontScale},
            onSelectionChanged: (selection) {
              controller.setFontScale(selection.first);
            },
          ),
        ),
        SizedBox(height: AppSpacing.lg),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Alto contraste'),
          subtitle: const Text('Cores mais fortes para facilitar a leitura'),
          value: prefs.highContrast,
          onChanged: controller.setHighContrast,
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Menos informação por tela'),
          subtitle: const Text('Espaçamento mais compacto'),
          value: prefs.reducedDensity,
          onChanged: controller.setReducedDensity,
        ),
      ],
    );
  }
}
