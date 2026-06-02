import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/auth/presentation/login_page.dart';
import 'package:conecta_geracao/features/auth/presentation/welcome_page.dart';
import 'package:conecta_geracao/features/shell/presentation/app_shell.dart';
import 'package:conecta_geracao/features/shell/presentation/shell_pages.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authGate = ref.watch(authGateProvider);
  final guestGate = ref.watch(guestSessionGateProvider);
  final routerRefresh = ref.watch(routerRefreshProvider);

  return GoRouter(
    initialLocation: '/welcome',
    refreshListenable: routerRefresh,
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isWelcome = location == '/welcome';
      final isLogin = location == '/login';
      final isPublicRoute = isWelcome || isLogin;
      final hasAccess = authGate.isAuthenticated || guestGate.isGuestActive;

      if (hasAccess && isPublicRoute) {
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
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
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
                path: '/chat',
                builder: (context, state) => const ChatPlaceholderPage(),
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
