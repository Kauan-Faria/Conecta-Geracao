import 'package:conecta_geracao/features/maps/domain/poi_category.dart';

class MapsContext {
  const MapsContext({this.category});

  final PoiCategory? category;

  static MapsContext? fromQuery({
    required String? context,
    required String? category,
  }) {
    if (context != 'maps') {
      return null;
    }
    return MapsContext(category: PoiCategory.fromApiValue(category));
  }

  String get bannerMessage {
    if (category != null) {
      return 'Você veio da aba Mapas. Posso ajudar a buscar ${category!.label.toLowerCase()} ou explicar as opções.';
    }
    return 'Você veio da aba Mapas. Posso ajudar a escolher o que buscar por perto.';
  }
}
