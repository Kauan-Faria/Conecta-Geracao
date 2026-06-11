import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('currentDevicePlatform returns ios on iOS target', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.iOS;
    addTearDown(() => debugDefaultTargetPlatformOverride = null);

    expect(currentDevicePlatform(), DevicePlatform.ios);
    expect(currentDevicePlatform().apiValue, 'ios');
  });

  test('currentDevicePlatform returns android on Android target', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    addTearDown(() => debugDefaultTargetPlatformOverride = null);

    expect(currentDevicePlatform(), DevicePlatform.android);
    expect(currentDevicePlatform().apiValue, 'android');
  });
}
