import 'package:flutter/foundation.dart';



class NotificationAnalytics {

  const NotificationAnalytics();



  void permissionGranted() {

    _log('notification_permission_granted');

  }



  void permissionDenied() {

    _log('notification_permission_denied');

  }



  void tokenRegistered() {

    _log('notification_token_registered');

  }



  void notificationOpened({

    required String type,

    required String route,

  }) {

    _log('notification_opened', {'type': type, 'route': route});

  }



  void _log(String event, [Map<String, String>? params]) {

    if (kDebugMode) {

      if (params == null || params.isEmpty) {

        debugPrint('[NotificationAnalytics] $event');

        return;

      }

      debugPrint('[NotificationAnalytics] $event params=$params');

    }

  }

}

