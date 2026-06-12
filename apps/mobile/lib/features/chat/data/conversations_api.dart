import 'package:conecta_geracao/core/network/api_client.dart';
import 'package:conecta_geracao/core/network/api_envelope.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';

class GuestMessageTurn {
  const GuestMessageTurn({required this.role, required this.content});

  final String role;
  final String content;

  Map<String, dynamic> toJson() => {'role': role, 'content': content};
}

class GuestAssistantReply {
  const GuestAssistantReply({
    required this.id,
    required this.content,
    required this.currentStep,
    required this.createdAt,
    this.topicSlug,
    this.message,
  });

  final String id;
  final String content;
  final int currentStep;
  final String? topicSlug;
  final DateTime createdAt;
  final ChatMessage? message;

  factory GuestAssistantReply.fromJson(Map<String, dynamic> json) {
    return GuestAssistantReply(
      id: json['id'] as String,
      content: json['content'] as String,
      currentStep: json['currentStep'] as int? ?? 0,
      topicSlug: json['topicSlug'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      message: ChatMessage.fromJson(json),
    );
  }
}

class ConversationsApi {
  ConversationsApi(this._client);

  final ApiClient _client;

  static const _basePath = '/api/v1/conversations';

  Future<ConversationSummary> createConversation({String? topicSlug}) async {
    final body = topicSlug == null ? null : {'topicSlug': topicSlug};
    final json = await _client.post(_basePath, body: body);
    return ConversationSummary.fromJson(unwrapData(json));
  }

  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final json = await _client.post(
      '$_basePath/$conversationId/messages',
      body: {'content': content},
    );
    return ChatMessage.fromJson(unwrapData(json));
  }

  Future<ConversationDetail> getConversation(String conversationId) async {
    final json = await _client.get('$_basePath/$conversationId');
    return ConversationDetail.fromJson(unwrapData(json));
  }

  Future<GuestAssistantReply> sendGuestMessage({
    required String content,
    String? topicSlug,
    int currentStep = 0,
    List<GuestMessageTurn> messageHistory = const <GuestMessageTurn>[],
  }) async {
    final json = await _client.post(
      '/api/v1/guest/chat/messages',
      body: {
        'content': content,
        'currentStep': currentStep,
        'topicSlug': ?topicSlug,
        if (messageHistory.isNotEmpty)
          'messageHistory': messageHistory.map((m) => m.toJson()).toList(),
      },
    );
    return GuestAssistantReply.fromJson(unwrapData(json));
  }

  Future<PaginatedResult<ConversationSummary>> listConversations({
    int page = 1,
    int limit = 20,
  }) async {
    final json = await _client.get('$_basePath?page=$page&limit=$limit');
    final meta = unwrapMeta(json);
    final items = unwrapDataList(json)
        .whereType<Map<String, dynamic>>()
        .map(ConversationSummary.fromJson)
        .toList();

    return PaginatedResult(
      items: items,
      page: meta?['page'] as int? ?? page,
      limit: meta?['limit'] as int? ?? limit,
      total: meta?['total'] as int? ?? items.length,
    );
  }
}
