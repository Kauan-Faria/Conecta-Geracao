class NotificationTarget {
  const NotificationTarget({
    required this.location,
    required this.analyticsRoute,
    this.showNotFoundMessage = false,
  });

  final String location;
  final String analyticsRoute;
  final bool showNotFoundMessage;
}

class NotificationDeepLink {
  const NotificationDeepLink._();

  static NotificationTarget fromPayload(Map<String, dynamic> data) {
    final route = _readString(data['route']);
    final conversationId = _readString(data['conversationId']);

    if (conversationId != null && conversationId.isNotEmpty) {
      return NotificationTarget(
        location: '/chat?conversationId=${Uri.encodeComponent(conversationId)}',
        analyticsRoute: 'chat',
      );
    }

    if (route == null || route.isEmpty) {
      return const NotificationTarget(
        location: '/home',
        analyticsRoute: 'home',
        showNotFoundMessage: true,
      );
    }

    final normalized = route.trim();

    if (normalized == 'home' || normalized == '/' || normalized == '/home') {
      return const NotificationTarget(
        location: '/home',
        analyticsRoute: 'home',
      );
    }

    if (normalized == 'maps' || normalized == '/maps') {
      return const NotificationTarget(
        location: '/maps',
        analyticsRoute: 'maps',
      );
    }

    if (normalized == 'chat') {
      return const NotificationTarget(
        location: '/chat',
        analyticsRoute: 'chat',
      );
    }

    final uri = Uri.tryParse(normalized.startsWith('/') ? normalized : '/$normalized');
    if (uri == null) {
      return const NotificationTarget(
        location: '/home',
        analyticsRoute: 'unknown',
        showNotFoundMessage: true,
      );
    }

    final path = uri.path;

    if (path.startsWith('/conversations/')) {
      final id = path.substring('/conversations/'.length);
      if (id.isNotEmpty) {
        return NotificationTarget(
          location: '/chat?conversationId=${Uri.encodeComponent(id)}',
          analyticsRoute: 'chat',
        );
      }
    }

    if (path == '/chat' || path.startsWith('/chat/')) {
      final query = uri.hasQuery ? '?${uri.query}' : '';
      return NotificationTarget(
        location: '/chat$query',
        analyticsRoute: 'chat',
      );
    }

    if (path == '/maps' || path.startsWith('/maps/')) {
      final query = uri.hasQuery ? '?${uri.query}' : '';
      return NotificationTarget(
        location: '/maps$query',
        analyticsRoute: 'maps',
      );
    }

    if (path == '/home' || path == '/') {
      return const NotificationTarget(
        location: '/home',
        analyticsRoute: 'home',
      );
    }

    return const NotificationTarget(
      location: '/home',
      analyticsRoute: 'unknown',
      showNotFoundMessage: true,
    );
  }

  static String notificationType(Map<String, dynamic> data) {
    return _readString(data['type']) ?? 'unknown';
  }

  static String? _readString(Object? value) {
    if (value == null) {
      return null;
    }
    final text = value.toString().trim();
    return text.isEmpty ? null : text;
  }
}
