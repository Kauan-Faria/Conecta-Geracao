import 'package:conecta_geracao/features/chat/data/auto_tts_prefs_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('SharedPreferencesAutoTtsPrefsRepository', () {
    test('defaults to true when key is missing', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final repo = SharedPreferencesAutoTtsPrefsRepository(prefs);

      expect(await repo.load(), isTrue);
    });

    test('persists and reloads preference', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final repo = SharedPreferencesAutoTtsPrefsRepository(prefs);

      await repo.save(false);
      expect(await repo.load(), isFalse);
      expect(prefs.getBool(SharedPreferencesAutoTtsPrefsRepository.key), isFalse);

      await repo.save(true);
      expect(await repo.load(), isTrue);
    });
  });
}
