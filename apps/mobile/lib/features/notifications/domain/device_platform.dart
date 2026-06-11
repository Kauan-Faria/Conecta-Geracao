import 'package:flutter/foundation.dart';

enum DevicePlatform { ios, android }

DevicePlatform currentDevicePlatform() {
  switch (defaultTargetPlatform) {
    case TargetPlatform.iOS:
      return DevicePlatform.ios;
    case TargetPlatform.android:
      return DevicePlatform.android;
    default:
      return DevicePlatform.android;
  }
}

extension DevicePlatformApi on DevicePlatform {
  String get apiValue => name;
}
