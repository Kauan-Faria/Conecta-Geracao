import 'package:conecta_geracao/features/maps/presentation/widgets/maps_map_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('MapsMapWidget', () {
    testWidgets('renders flutter_map with OSM attribution', (tester) async {
      final mapController = MapController();
      addTearDown(mapController.dispose);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: MapsMapWidget(mapController: mapController)),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.byType(FlutterMap), findsOneWidget);
      expect(find.textContaining('OpenStreetMap'), findsWidgets);
    });

    testWidgets('supports pinch zoom via default map options', (tester) async {
      final mapController = MapController();
      addTearDown(mapController.dispose);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: MapsMapWidget(mapController: mapController)),
        ),
      );

      await tester.pumpAndSettle();

      final flutterMap = tester.widget<FlutterMap>(find.byType(FlutterMap));
      expect(
        InteractiveFlag.hasPinchZoom(
          flutterMap.options.interactionOptions.flags,
        ),
        isTrue,
      );
    });
  });
}
