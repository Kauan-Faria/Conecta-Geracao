import 'package:conecta_geracao/core/network/api_envelope.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';

class FakeChatRepository implements ChatRepository {
  FakeChatRepository({
    this.onCreate,
    this.onSend,
    this.onGet,
    this.onList,
    this.assistantReply = 'Ótimo! Vamos conferir juntos?',
  });

  final Future<ConversationSummary> Function()? onCreate;
  final Future<ChatMessage> Function(String conversationId, String content)?
  onSend;
  final Future<ConversationDetail> Function(String conversationId)? onGet;
  final Future<PaginatedResult<ConversationSummary>> Function({
    int page,
    int limit,
  })?
  onList;
  final String assistantReply;

  int createCalls = 0;
  int sendCalls = 0;
  int getCalls = 0;
  int listCalls = 0;
  String? lastSentContent;
  String? lastCreateTopicSlug;

  @override
  Future<ConversationSummary> createConversation({String? topicSlug}) async {
    createCalls++;
    lastCreateTopicSlug = topicSlug;
    if (onCreate != null) {
      return onCreate!();
    }
    return ConversationSummary(
      id: 'conv-test-1',
      topicSlug: topicSlug,
      status: 'in_progress',
      currentStep: 0,
      createdAt: DateTime.utc(2026, 6, 1),
      updatedAt: DateTime.utc(2026, 6, 1),
    );
  }

  @override
  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    sendCalls++;
    lastSentContent = content;
    if (onSend != null) {
      return onSend!(conversationId, content);
    }
    return ChatMessage(
      id: 'msg-assistant-$sendCalls',
      role: MessageRole.assistant,
      content: assistantReply,
      createdAt: DateTime.utc(2026, 6, 1, 10, 0, sendCalls),
    );
  }

  @override
  Future<ConversationDetail> getConversation(String conversationId) async {
    getCalls++;
    if (onGet != null) {
      return onGet!(conversationId);
    }
    return ConversationDetail(
      id: conversationId,
      topicSlug: 'fazer-pix',
      status: 'in_progress',
      currentStep: 1,
      createdAt: DateTime.utc(2026, 6, 1),
      updatedAt: DateTime.utc(2026, 6, 1, 12),
      messages: [
        ChatMessage(
          id: 'msg-1',
          role: MessageRole.user,
          content: 'Quero enviar um pix',
          createdAt: DateTime.utc(2026, 6, 1, 10),
        ),
        ChatMessage(
          id: 'msg-2',
          role: MessageRole.assistant,
          content: 'Vamos passo a passo.',
          createdAt: DateTime.utc(2026, 6, 1, 10, 1),
        ),
      ],
    );
  }

  @override
  Future<PaginatedResult<ConversationSummary>> listConversations({
    int page = 1,
    int limit = 20,
  }) async {
    listCalls++;
    if (onList != null) {
      return onList!(page: page, limit: limit);
    }
    final items = [
      ConversationSummary(
        id: 'conv-test-1',
        topicSlug: 'fazer-pix',
        status: 'in_progress',
        currentStep: 1,
        createdAt: DateTime.utc(2026, 6, 1),
        updatedAt: DateTime.utc(2026, 6, 1, 12),
      ),
    ];
    return PaginatedResult(
      items: items,
      page: page,
      limit: limit,
      total: items.length,
    );
  }
}
