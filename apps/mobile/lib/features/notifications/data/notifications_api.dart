import 'package:conecta_geracao/core/network/api_client.dart';

import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';



abstract class NotificationsRemotePort {

  Future<void> registerDeviceToken({

    required String token,

    required DevicePlatform platform,

  });



  Future<void> deactivateDeviceToken({required String token});



  Future<NotificationPreferenceResponse> getPreference();



  Future<NotificationPreferenceResponse> updatePreference({

    required bool enabled,

  });

}



class NotificationPreferenceResponse {

  const NotificationPreferenceResponse({

    required this.enabled,

    required this.updatedAt,

  });



  final bool enabled;

  final DateTime updatedAt;

}



class NotificationsApi implements NotificationsRemotePort {

  NotificationsApi(this._client);



  final ApiClient _client;



  static const _basePath = '/api/v1/notifications';



  @override

  Future<void> registerDeviceToken({

    required String token,

    required DevicePlatform platform,

  }) async {

    await _client.put(

      '$_basePath/device-token',

      body: {'token': token, 'platform': platform.apiValue},

    );

  }



  @override

  Future<void> deactivateDeviceToken({required String token}) async {

    await _client.delete('$_basePath/device-token', body: {'token': token});

  }



  @override

  Future<NotificationPreferenceResponse> getPreference() async {

    final body = await _client.get('$_basePath/preferences');

    return _parsePreference(body);

  }



  @override

  Future<NotificationPreferenceResponse> updatePreference({

    required bool enabled,

  }) async {

    final body = await _client.put(

      '$_basePath/preferences',

      body: {'enabled': enabled},

    );

    return _parsePreference(body);

  }



  NotificationPreferenceResponse _parsePreference(Map<String, dynamic> body) {

    return NotificationPreferenceResponse(

      enabled: body['enabled'] as bool? ?? true,

      updatedAt: DateTime.tryParse(body['updatedAt'] as String? ?? '') ??

          DateTime.now().toUtc(),

    );

  }

}

