import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';

abstract class GuestHistoryRepository {
  Future<List<String>> loadHistory();

  Future<void> saveHistory(List<String> entries);

  Future<void> clearIfExpired(GuestSessionRepository sessionRepository);
}

/// Guest history is not persisted between app visits.
class InMemoryGuestHistoryRepository implements GuestHistoryRepository {
  List<String> _entries = const [];

  @override
  Future<List<String>> loadHistory() async => List.unmodifiable(_entries);

  @override
  Future<void> saveHistory(List<String> entries) async {
    _entries = List.unmodifiable(entries);
  }

  @override
  Future<void> clearIfExpired(GuestSessionRepository sessionRepository) async {
    if (!sessionRepository.isGuestSessionActive()) {
      _entries = const [];
    }
  }
}
