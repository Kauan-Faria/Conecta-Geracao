import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/features/chat/domain/checkpoint_detector.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_error_banner.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_hero_header.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_input_bar.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_message_bubble.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_typing_indicator.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/checkpoint_quick_replies.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/topic_shortcuts_grid.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class ChatPage extends ConsumerStatefulWidget {
  const ChatPage({
    this.initialConversationId,
    this.initialTopicSlug,
    this.startNewChat = false,
    super.key,
  });

  final String? initialConversationId;
  final String? initialTopicSlug;
  final bool startNewChat;

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  String? _lastFailedContent;
  String? _loadedConversationId;
  String? _handledLaunchKey;

  @override
  void initState() {
    super.initState();
    _maybeHandleLaunchParams();
  }

  @override
  void didUpdateWidget(ChatPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialConversationId != widget.initialConversationId ||
        oldWidget.initialTopicSlug != widget.initialTopicSlug ||
        oldWidget.startNewChat != widget.startNewChat) {
      _maybeHandleLaunchParams();
    }
  }

  void _maybeHandleLaunchParams() {
    final launchKey =
        '${widget.startNewChat}|${widget.initialTopicSlug}|${widget.initialConversationId}';
    if (launchKey == _handledLaunchKey) {
      return;
    }
    _handledLaunchKey = launchKey;

    if (widget.startNewChat) {
      _loadedConversationId = null;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(chatControllerProvider.notifier).resetForNewConversation();
      });
      return;
    }

    if (widget.initialTopicSlug != null) {
      _loadedConversationId = null;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref
            .read(chatControllerProvider.notifier)
            .startWithTopic(widget.initialTopicSlug!);
      });
      return;
    }

    _maybeOpenConversation();
  }

  void _maybeOpenConversation() {
    final conversationId = widget.initialConversationId;
    if (conversationId == null || conversationId == _loadedConversationId) {
      return;
    }
    _loadedConversationId = conversationId;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(chatControllerProvider.notifier).openConversation(conversationId);
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _sendMessage([String? overrideContent]) async {
    final content = (overrideContent ?? _textController.text).trim();
    if (content.isEmpty) {
      return;
    }

    _lastFailedContent = content;
    if (overrideContent == null) {
      _textController.clear();
    }

    await ref.read(chatControllerProvider.notifier).sendMessage(content);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatControllerProvider);
    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final theme = Theme.of(context);

    ref.listen(chatControllerProvider, (previous, next) {
      if (next.messages.length != (previous?.messages.length ?? 0) ||
          next.isSending != (previous?.isSending ?? false) ||
          next.visibleMessageLimit != (previous?.visibleMessageLimit ?? 0)) {
        _scrollToBottom();
      }
    });

    final showCheckpoints = shouldShowCheckpointQuickReplies(
      messages: chatState.messages,
      isSending: chatState.isSending,
      conversationStatus: chatState.conversationStatus,
    );

    final showTopicShortcuts = isAuthenticated &&
        !chatState.requiresAuth &&
        !chatState.isLoadingConversation &&
        !chatState.isOffline &&
        chatState.messages.isEmpty &&
        !chatState.isSending;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          ChatHeroHeader(
            onOpenHistory: isAuthenticated
                ? () => context.push('/conversations')
                : null,
          ),
          if (chatState.isOffline)
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.xs,
              ),
              child: Text(
                'Modo offline: você pode ler esta conversa, mas não enviar mensagens.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
              ),
            ),
          if (!isAuthenticated || chatState.requiresAuth)
            _GuestAuthBanner(onLogin: () => context.push('/login'))
          else if (chatState.isLoadingConversation)
            const Expanded(
              child: Center(child: CircularProgressIndicator()),
            )
          else
            Expanded(
              child: Column(
                children: [
                  Expanded(
                    child: ListView(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(AppSpacing.md),
                      children: [
                        if (chatState.canShowMoreMessages)
                          Padding(
                            padding: const EdgeInsets.only(
                              bottom: AppSpacing.md,
                            ),
                            child: AppButton(
                              label: 'Ver mensagens anteriores',
                              semanticLabel:
                                  'Carregar mensagens anteriores da conversa',
                              onPressed: () {
                                ref
                                    .read(chatControllerProvider.notifier)
                                    .showMoreMessages();
                              },
                            ),
                          ),
                        if (showTopicShortcuts)
                          TopicShortcutsGrid(
                            onTopicSelected: (shortcut) {
                              ref
                                  .read(chatControllerProvider.notifier)
                                  .startWithTopic(shortcut.slug);
                              _scrollToBottom();
                            },
                          )
                        else if (chatState.messages.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              vertical: AppSpacing.lg,
                            ),
                            child: Text(
                              'Digite sua dúvida abaixo. Por exemplo: '
                              '"Quero enviar um Pix".',
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: AppColors.onSurfaceVariant,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ...chatState.displayMessages.map(
                          (message) => ChatMessageBubble(message: message),
                        ),
                        if (chatState.isSending) const ChatTypingIndicator(),
                        if (chatState.errorMessage != null)
                          ChatErrorBanner(
                            message: chatState.errorMessage!,
                            onRetry: chatState.isOffline
                                ? null
                                : () {
                                    final retryContent =
                                        _lastFailedContent ?? '';
                                    if (retryContent.isNotEmpty) {
                                      ref
                                          .read(
                                            chatControllerProvider.notifier,
                                          )
                                          .retryLastMessage(retryContent);
                                    }
                                  },
                            onDismiss: () {
                              ref
                                  .read(chatControllerProvider.notifier)
                                  .clearError();
                            },
                          ),
                      ],
                    ),
                  ),
                  if (showCheckpoints && !chatState.isOffline)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                      ),
                      child: CheckpointQuickReplies(
                        onSim: () => _sendMessage('Sim'),
                        onNao: () => _sendMessage('Não'),
                      ),
                    ),
                  ChatInputBar(
                    controller: _textController,
                    isSending: chatState.isSending,
                    enabled: !chatState.isOffline,
                    onSend: () => _sendMessage(),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _GuestAuthBanner extends StatelessWidget {
  const _GuestAuthBanner({required this.onLogin});

  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Para conversar com o assistente, entre com sua conta Google.',
              style: theme.textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSpacing.lg),
            AppButton(
              label: 'Entrar com Google',
              semanticLabel: 'Entrar com Google para usar o chat',
              onPressed: onLogin,
            ),
          ],
        ),
      ),
    );
  }
}
