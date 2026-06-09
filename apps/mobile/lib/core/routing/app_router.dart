import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/auth/presentation/alternative_login_page.dart';
import 'package:conecta_geracao/features/auth/presentation/display_name_gate.dart';
import 'package:conecta_geracao/features/auth/presentation/display_name_onboarding_page.dart';
import 'package:conecta_geracao/features/auth/presentation/login_page.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_otp_page.dart';
import 'package:conecta_geracao/features/auth/presentation/welcome_page.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_page.dart';
import 'package:conecta_geracao/features/chat/presentation/conversation_list_page.dart';
import 'package:conecta_geracao/features/home/presentation/home_page.dart';
import 'package:conecta_geracao/features/maps/domain/maps_context.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_route_page.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_search_page.dart';
import 'package:conecta_geracao/features/shell/presentation/app_shell.dart';
import 'package:conecta_geracao/features/shell/presentation/shell_pages.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authGate = ref.watch(authGateProvider);
  final guestGate = ref.watch(guestSessionGateProvider);
  final needsDisplayName = ref.watch(needsDisplayNameProvider);
  final routerRefresh = ref.watch(routerRefreshProvider);

  return GoRouter(
    initialLocation: '/welcome',
    refreshListenable: routerRefresh,
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isWelcome = location == '/welcome';
      final isLoginFlow = location.startsWith('/login');
      final isOnboarding = location == '/onboarding/display-name';
      final isPublicRoute = isWelcome || isLoginFlow || isOnboarding;
      final isAuthenticated = authGate.isAuthenticated;
      final hasAccess = isAuthenticated || guestGate.isGuestActive;

      if (isAuthenticated && needsDisplayName && !isOnboarding) {
        return '/onboarding/display-name';
      }

      if (isAuthenticated && !needsDisplayName && isOnboarding) {
        return '/home';
      }

      if (hasAccess && (isWelcome || isLoginFlow) && !needsDisplayName) {
        return '/home';
      }

      if (!hasAccess && !isPublicRoute) {
        return '/welcome';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomePage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
        routes: [
          GoRoute(
            path: 'otp',
            builder: (context, state) {
              final phone = state.extra as String? ?? '';
              return PhoneOtpPage(phoneDigits: phone);
            },
          ),
          GoRoute(
            path: 'alternative',
            builder: (context, state) => const AlternativeLoginPage(),
          ),
        ],
      ),
      GoRoute(
        path: '/onboarding/display-name',
        builder: (context, state) => const DisplayNameOnboardingPage(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/maps',
                builder: (context, state) {
                  final category = PoiCategory.fromApiValue(
                    state.uri.queryParameters['category'],
                  );
                  final radiusKm = int.tryParse(
                    state.uri.queryParameters['radiusKm'] ?? '',
                  );
                  return MapsSearchPage(
                    initialCategory: category,
                    initialRadiusKm: radiusKm,
                  );
                },
                routes: [
                  GoRoute(
                    path: 'route',
                    builder: (context, state) {
                      final args = state.extra as MapsRouteArgs?;
                      if (args == null) {
                        return const MapsSearchPage();
                      }
                      return MapsRoutePage(args: args);
                    },
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chat',
                builder: (context, state) {
                  final conversationId =
                      state.uri.queryParameters['conversationId'];
                  final topicSlug = state.uri.queryParameters['topic'];
                  final startNewChat =
                      state.uri.queryParameters['new'] == 'true';
                  final mapsContext = MapsContext.fromQuery(
                    context: state.uri.queryParameters['context'],
                    category: state.uri.queryParameters['category'],
                  );
                  return ChatPage(
                    initialConversationId: conversationId,
                    initialTopicSlug: topicSlug,
                    startNewChat: startNewChat,
                    initialMapsContext: mapsContext,
                  );
                },
              ),
              GoRoute(
                path: '/conversations',
                builder: (context, state) => const ConversationListPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/settings',
                builder: (context, state) => const SettingsPage(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
