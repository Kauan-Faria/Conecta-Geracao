import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/maps/domain/map_action.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/route_summary.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('ChatMessage.fromJson parses metadata.map_action', () {
    final message = ChatMessage.fromJson({
      'id': 'msg-1',
      'role': 'assistant',
      'content': 'Vou procurar farmácias perto de você.',
      'createdAt': '2026-06-01T10:24:00.000Z',
      'metadata': {
        'map_action': {
          'type': 'map_search',
          'category': 'pharmacy',
          'radiusKm': 5,
        },
      },
    });

    expect(message.mapAction, isNotNull);
    expect(message.mapAction!.category, PoiCategory.pharmacy);
    expect(message.mapAction!.radiusKm, 5);
  });

  test('MapAction normalizes radius to allowed values', () {
    final action = MapAction.fromJson({
      'type': 'map_search',
      'category': 'pharmacy',
      'radiusKm': 7,
    });

    expect(action.radiusKm, 5);
  });

  test('decodePolyline decodes encoded route', () {
    final points = decodePolyline('_p~iF~ps|U');
    expect(points, isNotEmpty);
    expect(points.first.latitude, closeTo(38.5, 0.1));
  });

  test('formatRouteDistance uses simple Portuguese', () {
    expect(formatRouteDistance(450), 'cerca de 450 m');
    expect(formatRouteDistance(1250), 'cerca de 1.3 km');
  });
}
