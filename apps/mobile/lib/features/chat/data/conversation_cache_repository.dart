import 'dart:convert';

import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class ConversationCacheRepository {
  Future<List<ConversationSummary>> loadSummaries();

  Future<ConversationDetail?> loadDetail(String conversationId);

  Future<void> upsertDetail(ConversationDetail detail);

  Future<void> upsertSummaries(List<ConversationSummary> summaries);
}

class SharedPreferencesConversationCacheRepository
    implements ConversationCacheRepository {
  SharedPreferencesConversationCacheRepository(this._prefs);

  final SharedPreferences _prefs;

  static const cacheKey = 'cached_conversations_v1';
  static const maxCachedConversations = 10;

  @override
  Future<List<ConversationSummary>> loadSummaries() async {
    final details = await _loadAllDetails();
    return details
        .map(
          (detail) => ConversationSummary(
            id: detail.id,
            topicSlug: detail.topicSlug,
            status: detail.status,
            currentStep: detail.currentStep,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt,
          ),
        )
        .toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  }

  @override
  Future<ConversationDetail?> loadDetail(String conversationId) async {
    final details = await _loadAllDetails();
    for (final detail in details) {
      if (detail.id == conversationId) {
        return detail;
      }
    }
    return null;
  }

  @override
  Future<void> upsertDetail(ConversationDetail detail) async {
    final details = await _loadAllDetails();
    final withoutCurrent =
        details.where((item) => item.id != detail.id).toList();
    withoutCurrent.insert(0, detail);
    await _saveDetails(withoutCurrent.take(maxCachedConversations).toList());
  }

  @override
  Future<void> upsertSummaries(List<ConversationSummary> summaries) async {
    final existing = await _loadAllDetails();
    final byId = {for (final item in existing) item.id: item};

    for (final summary in summaries) {
      final current = byId[summary.id];
      if (current == null) {
        byId[summary.id] = ConversationDetail(
          id: summary.id,
          topicSlug: summary.topicSlug,
          status: summary.status,
          currentStep: summary.currentStep,
          createdAt: summary.createdAt,
          updatedAt: summary.updatedAt,
          messages: const [],
        );
      } else {
        byId[summary.id] = ConversationDetail(
          id: summary.id,
          topicSlug: summary.topicSlug,
          status: summary.status,
          currentStep: summary.currentStep,
          createdAt: summary.createdAt,
          updatedAt: summary.updatedAt,
          messages: current.messages,
        );
      }
    }

    final merged = byId.values.toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    await _saveDetails(merged.take(maxCachedConversations).toList());
  }

  Future<List<ConversationDetail>> _loadAllDetails() async {
    final raw = _prefs.getString(cacheKey);
    if (raw == null || raw.isEmpty) {
      return [];
    }

    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .whereType<Map<String, dynamic>>()
        .map(ConversationDetail.fromJson)
        .toList();
  }

  Future<void> _saveDetails(List<ConversationDetail> details) async {
    final encoded = jsonEncode(details.map((item) => item.toJson()).toList());
    await _prefs.setString(cacheKey, encoded);
  }
}
