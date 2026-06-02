import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversations_api.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/domain/topic_shortcuts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const offlineSendMessage =
    'Precisa de internet para falar com o assistente';

final conversationsApiProvider = Provider<ConversationsApi>((ref) {
  return ConversationsApi(ref.watch(apiClientProvider));
});

final conversationCacheRepositoryProvider =
    Provider<ConversationCacheRepository>((ref) {
  return SharedPreferencesConversationCacheRepository(
    ref.watch(sharedPreferencesProvider),
  );
});

final cachedChatRepositoryProvider = Provider<CachedChatRepository>((ref) {
  return CachedChatRepository(
    remote: RemoteChatRepository(ref.watch(conversationsApiProvider)),
    cache: ref.watch(conversationCacheRepositoryProvider),
  );
});

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ref.watch(cachedChatRepositoryProvider);
});

class ChatState {
  const ChatState({
    this.conversationId,
    this.conversationStatus = 'in_progress',
    this.messages = const [],
    this.isSending = false,
    this.isLoadingConversation = false,
    this.errorMessage,
    this.requiresAuth = false,
    this.isOffline = false,
    this.visibleMessageLimit = 100,
  });

  final String? conversationId;
  final String conversationStatus;
  final List<ChatMessage> messages;
  final bool isSending;
  final bool isLoadingConversation;
  final String? errorMessage;
  final bool requiresAuth;
  final bool isOffline;
  final int visibleMessageLimit;

  List<ChatMessage> get displayMessages {
    if (!isOffline || messages.length <= visibleMessageLimit) {
      return messages;
    }
    return messages.sublist(messages.length - visibleMessageLimit);
  }

  bool get canShowMoreMessages =>
      isOffline && messages.length > visibleMessageLimit;

  ChatState copyWith({
    String? conversationId,
    String? conversationStatus,
    List<ChatMessage>? messages,
    bool? isSending,
    bool? isLoadingConversation,
    String? errorMessage,
    bool clearError = false,
    bool? requiresAuth,
    bool? isOffline,
    int? visibleMessageLimit,
  }) {
    return ChatState(
      conversationId: conversationId ?? this.conversationId,
      conversationStatus: conversationStatus ?? this.conversationStatus,
      messages: messages ?? this.messages,
      isSending: isSending ?? this.isSending,
      isLoadingConversation:
          isLoadingConversation ?? this.isLoadingConversation,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      requiresAuth: requiresAuth ?? this.requiresAuth,
      isOffline: isOffline ?? this.isOffline,
      visibleMessageLimit: visibleMessageLimit ?? this.visibleMessageLimit,
    );
  }
}

class ChatController extends Notifier<ChatState> {
  @override
  ChatState build() {
    return const ChatState();
  }

  CachedChatRepository get _repository =>
      ref.read(cachedChatRepositoryProvider);

  ConnectivityService get _connectivity =>
      ref.read(connectivityServiceProvider);

  Future<bool> _ensureAuthenticated() async {
    final token = await ref.read(authRepositoryProvider).getIdToken();
    if (token == null) {
      state = state.copyWith(requiresAuth: true, clearError: true);
      return false;
    }
    if (state.requiresAuth) {
      state = state.copyWith(requiresAuth: false);
    }
    return true;
  }

  Future<void> openConversation(String conversationId) async {
    if (!await _ensureAuthenticated()) {
      return;
    }

    state = state.copyWith(
      isLoadingConversation: true,
      clearError: true,
      isOffline: false,
    );

    try {
      final online = await _connectivity.hasConnection();
      if (!online) {
        final cached = await _repository.getCachedConversation(conversationId);
        if (cached == null) {
          state = state.copyWith(
            isLoadingConversation: false,
            errorMessage: 'Esta conversa não está disponível offline.',
          );
          return;
        }
        _applyConversation(cached, isOffline: true);
        return;
      }

      final detail = await _repository.getConversation(conversationId);
      _applyConversation(detail, isOffline: false);
    } on ApiException catch (error) {
      state = state.copyWith(
        isLoadingConversation: false,
        errorMessage: error.userMessage,
      );
    } catch (_) {
      final cached = await _repository.getCachedConversation(conversationId);
      if (cached != null) {
        _applyConversation(cached, isOffline: true);
        return;
      }
      state = state.copyWith(
        isLoadingConversation: false,
        errorMessage: 'Sem conexão. Verifique a internet e tente novamente.',
      );
    }
  }

  void _applyConversation(ConversationDetail detail, {required bool isOffline}) {
    state = ChatState(
      conversationId: detail.id,
      conversationStatus: detail.status,
      messages: detail.messages,
      isOffline: isOffline,
    );
  }

  void showMoreMessages() {
    state = state.copyWith(
      visibleMessageLimit: state.visibleMessageLimit + 50,
    );
  }

  Future<void> refreshConnectivity() async {
    if (!state.isOffline) {
      return;
    }
    final online = await _connectivity.hasConnection();
    if (online) {
      state = state.copyWith(isOffline: false, clearError: true);
    }
  }

  Future<void> startWithTopic(String topicSlug) async {
    if (state.isSending || state.isLoadingConversation) {
      return;
    }

    if (!await _ensureAuthenticated()) {
      return;
    }

    if (state.isOffline || !await _connectivity.hasConnection()) {
      state = state.copyWith(
        isOffline: true,
        errorMessage: offlineSendMessage,
      );
      return;
    }

    final shortcut = topicShortcutForSlug(topicSlug);
    final starterContent =
        shortcut?.starterMessage ?? 'Quero ajuda com este assunto';
    final pendingId = 'pending-${DateTime.now().millisecondsSinceEpoch}';

    state = ChatState(
      isSending: true,
      messages: [
        ChatMessage(
          id: pendingId,
          role: MessageRole.user,
          content: starterContent,
          createdAt: DateTime.now(),
        ),
      ],
    );

    try {
      final conversation = await _repository.createConversation(
        topicSlug: topicSlug,
      );

      state = state.copyWith(
        conversationId: conversation.id,
        conversationStatus: conversation.status,
      );

      final assistantMessage = await _repository.sendMessage(
        conversationId: conversation.id,
        content: starterContent,
      );

      state = state.copyWith(
        messages: [...state.messages, assistantMessage],
        isSending: false,
      );
    } on ApiException catch (error) {
      state = state.copyWith(
        isSending: false,
        messages: const [],
        errorMessage: error.userMessage,
      );
    } catch (_) {
      state = state.copyWith(
        isSending: false,
        messages: const [],
        isOffline: true,
        errorMessage: offlineSendMessage,
      );
    }
  }

  Future<void> sendMessage(String rawContent) async {
    final content = rawContent.trim();
    if (content.isEmpty || state.isSending || state.isLoadingConversation) {
      return;
    }

    if (!await _ensureAuthenticated()) {
      return;
    }

    if (state.isOffline || !await _connectivity.hasConnection()) {
      state = state.copyWith(
        isOffline: true,
        errorMessage: offlineSendMessage,
      );
      return;
    }

    final pendingUserMessage = ChatMessage(
      id: 'pending-${DateTime.now().millisecondsSinceEpoch}',
      role: MessageRole.user,
      content: content,
      createdAt: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, pendingUserMessage],
      isSending: true,
      clearError: true,
    );

    try {
      var conversationId = state.conversationId;
      if (conversationId == null) {
        final conversation = await _repository.createConversation();
        conversationId = conversation.id;
        state = state.copyWith(
          conversationId: conversationId,
          conversationStatus: conversation.status,
        );
      }

      final assistantMessage = await _repository.sendMessage(
        conversationId: conversationId,
        content: content,
      );

      state = state.copyWith(
        messages: [...state.messages, assistantMessage],
        isSending: false,
      );
    } on ApiException catch (error) {
      state = state.copyWith(
        isSending: false,
        errorMessage: error.userMessage,
        messages: state.messages
            .where((m) => m.id != pendingUserMessage.id)
            .toList(),
      );
    } catch (_) {
      state = state.copyWith(
        isSending: false,
        isOffline: true,
        errorMessage: offlineSendMessage,
        messages: state.messages
            .where((m) => m.id != pendingUserMessage.id)
            .toList(),
      );
    }
  }

  Future<void> retryLastMessage(String content) async {
    state = state.copyWith(clearError: true);
    await sendMessage(content);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  void resetForNewConversation() {
    state = const ChatState();
  }
}

final chatControllerProvider =
    NotifierProvider<ChatController, ChatState>(ChatController.new);
