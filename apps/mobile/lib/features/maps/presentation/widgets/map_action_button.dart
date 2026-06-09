import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/features/maps/domain/map_action.dart';
import 'package:flutter/material.dart';

class MapActionButton extends StatelessWidget {
  const MapActionButton({
    required this.mapAction,
    required this.onPressed,
    super.key,
  });

  final MapAction mapAction;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 52, top: AppSpacing.xs),
      child: Align(
        alignment: Alignment.centerLeft,
        child: AppButton(
          label: 'Ver no mapa',
          semanticLabel:
              'Ver ${mapAction.category.label} no mapa em um raio de ${mapAction.radiusKm} quilômetros',
          onPressed: onPressed,
        ),
      ),
    );
  }
}
