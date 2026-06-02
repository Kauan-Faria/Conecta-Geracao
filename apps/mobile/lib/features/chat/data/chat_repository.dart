import 'package:conecta_geracao/core/network/api_envelope.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversations_api.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';

abstract class ChatRepository {
  Future<ConversationSummary> createConversation({String? topicSlug});

  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  });

  Future<ConversationDetail> getConversation(String conversationId);

  Future<PaginatedResult<ConversationSummary>> listConversations({
    int page = 1,
    int limit = 20,
  });
}

class RemoteChatRepository implements ChatRepository {
  RemoteChatRepository(this._api);

  final ConversationsApi _api;

  @override
  Future<ConversationSummary> createConversation({String? topicSlug}) {
    return _api.createConversation(topicSlug: topicSlug);
  }

  @override
  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  }) {
    return _api.sendMessage(
      conversationId: conversationId,
      content: content,
    );
  }

  @override
  Future<ConversationDetail> getConversation(String conversationId) {
    return _api.getConversation(conversationId);
  }

  @override
  Future<PaginatedResult<ConversationSummary>> listConversations({
    int page = 1,
    int limit = 20,
  }) {
    return _api.listConversations(page: page, limit: limit);
  }
}

class CachedChatRepository implements ChatRepository {
  CachedChatRepository({
    required this._remote,
    required this._cache,
  });

  final ChatRepository _remote;
  final ConversationCacheRepository _cache;

  @override
  Future<ConversationSummary> createConversation({String? topicSlug}) async {
    final conversation = await _remote.createConversation(topicSlug: topicSlug);
    await _cache.upsertDetail(
      ConversationDetail(
        id: conversation.id,
        topicSlug: conversation.topicSlug,
        status: conversation.status,
        currentStep: conversation.currentStep,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: const [],
      ),
    );
    return conversation;
  }

  @override
  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final message = await _remote.sendMessage(
      conversationId: conversationId,
      content: content,
    );

    final existing = await _cache.loadDetail(conversationId);
    if (existing != null) {
      await _cache.upsertDetail(
        ConversationDetail(
          id: existing.id,
          topicSlug: existing.topicSlug,
          status: existing.status,
          currentStep: existing.currentStep,
          createdAt: existing.createdAt,
          updatedAt: DateTime.now().toUtc(),
          messages: [...existing.messages, message],
        ),
      );
    }

    return message;
  }

  @override
  Future<ConversationDetail> getConversation(String conversationId) async {
    final detail = await _remote.getConversation(conversationId);
    await _cache.upsertDetail(detail);
    return detail;
  }

  @override
  Future<PaginatedResult<ConversationSummary>> listConversations({
    int page = 1,
    int limit = 20,
  }) async {
    final result = await _remote.listConversations(page: page, limit: limit);
    await _cache.upsertSummaries(result.items);
    return result;
  }

  Future<List<ConversationSummary>> listCachedSummaries() {
    return _cache.loadSummaries();
  }

  Future<ConversationDetail?> getCachedConversation(String conversationId) {
    return _cache.loadDetail(conversationId);
  }
}
