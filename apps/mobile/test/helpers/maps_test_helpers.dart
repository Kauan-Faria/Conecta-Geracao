import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/core/routing/app_router.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/presentation/location_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_bootstrap.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'fake_auth_repository.dart';
import 'fake_chat_repository.dart';
import 'fake_notifications_remote_port.dart';
import 'fake_push_messaging_client.dart';

class OnlineConnectivityService extends ConnectivityService {
  OnlineConnectivityService() : super(Connectivity());

  @override
  Future<bool> hasConnection() async => true;
}

class TestLocationController extends LocationController {
  @override
  LocationState build() => const LocationState(
    permissionDenied: true,
    errorMessage: 'Informe seu bairro ou cidade para buscar lugares.',
  );

  @override
  Future<GeoPoint?> ensureCenter({GeoPoint? presetCenter}) async => null;
}

Future<ProviderContainer> pumpShellApp(
  WidgetTester tester, {
  AppUser? user,
  bool guestSession = false,
}) async {
  tester.view.physicalSize = const Size(400, 900);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  final fakeAuth = FakeAuthRepository(initialUser: user);
  final fakeChat = FakeChatRepository();
  SharedPreferences.setMockInitialValues({});
  final sharedPreferences = await SharedPreferences.getInstance();

  late ProviderContainer container;

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(fakeAuth),
        cachedChatRepositoryProvider.overrideWithValue(
          CachedChatRepository(
            remote: fakeChat,
            cache: SharedPreferencesConversationCacheRepository(
              sharedPreferences,
            ),
          ),
        ),
        connectivityServiceProvider.overrideWithValue(
          OnlineConnectivityService(),
        ),
        sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        locationControllerProvider.overrideWith(TestLocationController.new),
        pushMessagingClientProvider.overrideWithValue(
          FakePushMessagingClient(),
        ),
        notificationsApiProvider.overrideWithValue(
          FakeNotificationsRemotePort(),
        ),
        notificationsBootstrapProvider.overrideWith((ref) => Future.value()),
      ],
      child: const ConectaGeracaoApp(),
    ),
  );

  await tester.pumpAndSettle();
  container = ProviderScope.containerOf(
    tester.element(find.byType(ConectaGeracaoApp)),
  );

  if (guestSession) {
    await tester.tap(find.text('Continua sem Cadastro'));
    await tester.pumpAndSettle();
  }

  return container;
}

Future<void> navigateToMaps(ProviderContainer container) async {
  final router = container.read(routerProvider);
  router.go('/maps');
}

void expectMapsTabActive(WidgetTester tester) {
  expect(find.text('O que você procura por perto?'), findsOneWidget);
}
