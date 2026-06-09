import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MapsAiAssistButton extends StatelessWidget {
  const MapsAiAssistButton({this.selectedCategory, super.key});

  final PoiCategory? selectedCategory;

  @override
  Widget build(BuildContext context) {
    final categoryParam = selectedCategory?.apiValue;
    final query = categoryParam == null
        ? 'context=maps&new=true'
        : 'context=maps&category=$categoryParam&new=true';

    return AppButton(
      label: 'Pedir ajuda à IA',
      semanticLabel:
          'Pedir ajuda à inteligência artificial sobre a busca no mapa',
      onPressed: () => context.go('/chat?$query'),
    );
  }
}
