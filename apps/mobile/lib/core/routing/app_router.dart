import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/auth/presentation/email_auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/email_auth_page.dart';
import 'package:conecta_geracao/features/auth/presentation/email_verification_gate.dart';
import 'package:conecta_geracao/features/auth/presentation/email_verification_page.dart';
import 'package:conecta_geracao/features/auth/presentation/display_name_gate.dart';
import 'package:conecta_geracao/features/auth/presentation/display_name_onboarding_page.dart';
import 'package:conecta_geracao/features/auth/presentation/login_page.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_login_page.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_otp_page.dart';
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
import 'package:conecta_geracao/features/tutorials/presentation/tutorials_page.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  ref.watch(guestSessionGateProvider);
  final routerRefresh = ref.watch(routerRefreshProvider);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: routerRefresh,
    redirect: (context, state) {
      final authGate = ref.read(authGateProvider);
      final currentGuestGate = ref.read(guestSessionGateProvider);
      final user = authGate.user;
      final needsEmailVerification = userNeedsEmailVerification(user);
      final needsDisplayName = userNeedsDisplayName(user);

      final path = state.uri.path;
      final isLoginFlow = path.startsWith('/login');
      final isOnboarding = path == '/onboarding/display-name';
      final isPublicRoute = isLoginFlow || isOnboarding;
      final isAuthenticated = authGate.isAuthenticated;
      final hasAccess = isAuthenticated || currentGuestGate.isGuestActive;

      if (isAuthenticated && needsEmailVerification) {
        final isEmailVerify = path == '/login/email-verify';
        final isEmailEdit = path == '/login/email';
        if (!isEmailVerify && !isEmailEdit) {
          return '/login/email-verify';
        }
      }

      if (isAuthenticated &&
          needsDisplayName &&
          !isOnboarding &&
          !needsEmailVerification) {
        return '/onboarding/display-name';
      }

      if (isAuthenticated && !needsDisplayName && isOnboarding) {
        return '/home';
      }

      if (isAuthenticated &&
          isLoginFlow &&
          !needsDisplayName &&
          !needsEmailVerification) {
        return '/home';
      }

      if (!hasAccess && !isPublicRoute) {
        return '/login';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
        routes: [
          GoRoute(
            path: 'phone',
            builder: (context, state) => const PhoneLoginPage(),
          ),
          GoRoute(
            path: 'otp',
            builder: (context, state) {
              final phone = state.extra as String? ?? '';
              return PhoneOtpPage(phoneDigits: phone);
            },
          ),
          GoRoute(
            path: 'email',
            builder: (context, state) {
              final mode = state.uri.queryParameters['mode'];
              final initialMode = mode == 'signin'
                  ? EmailAuthMode.signIn
                  : EmailAuthMode.signUp;
              return EmailAuthPage(initialMode: initialMode);
            },
          ),
          GoRoute(
            path: 'email-verify',
            builder: (context, state) => const EmailVerificationPage(),
          ),
          GoRoute(
            path: 'alternative',
            redirect: (context, state) => '/login/email',
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
                path: '/tutorials',
                builder: (context, state) => const TutorialsPage(),
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
