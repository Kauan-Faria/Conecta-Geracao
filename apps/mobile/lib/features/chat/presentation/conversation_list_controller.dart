import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConversationListItem {
  const ConversationListItem({
    required this.summary,
    this.previewMessages = const [],
  });

  final ConversationSummary summary;
  final List<ChatMessage> previewMessages;
}

class ConversationListState {
  const ConversationListState({
    this.items = const [],
    this.page = 0,
    this.hasMore = true,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.isOfflineList = false,
  });

  final List<ConversationListItem> items;
  final int page;
  final bool hasMore;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;
  final bool isOfflineList;

  ConversationListState copyWith({
    List<ConversationListItem>? items,
    int? page,
    bool? hasMore,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    bool clearError = false,
    bool? isOfflineList,
  }) {
    return ConversationListState(
      items: items ?? this.items,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      isOfflineList: isOfflineList ?? this.isOfflineList,
    );
  }
}

class ConversationListController extends Notifier<ConversationListState> {
  static const _pageSize = 20;

  @override
  ConversationListState build() {
    Future.microtask(loadInitial);
    return const ConversationListState(isLoading: true);
  }

  CachedChatRepository get _repository =>
      ref.read(cachedChatRepositoryProvider);

  ConnectivityService get _connectivity =>
      ref.read(connectivityServiceProvider);

  Future<void> loadInitial() async {
    state = const ConversationListState(isLoading: true);

    if (!await _connectivity.hasConnection()) {
      await _loadFromCache();
      return;
    }

    try {
      final result = await _repository.listConversations(
        page: 1,
        limit: _pageSize,
      );
      state = ConversationListState(
        items: await _toListItems(result.items),
        page: 1,
        hasMore: result.hasMore,
      );
    } on ApiException catch (error) {
      final cached = await _repository.listCachedSummaries();
      if (cached.isEmpty) {
        state = ConversationListState(
          errorMessage: error.userMessage,
          hasMore: false,
        );
        return;
      }
      await _loadFromCache();
    } catch (_) {
      await _loadFromCache();
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore ||
        !state.hasMore ||
        state.isLoading ||
        state.isOfflineList) {
      return;
    }

    state = state.copyWith(isLoadingMore: true, clearError: true);

    try {
      final nextPage = state.page + 1;
      final result = await _repository.listConversations(
        page: nextPage,
        limit: _pageSize,
      );
      final newItems = await _toListItems(result.items);
      state = state.copyWith(
        items: [...state.items, ...newItems],
        page: nextPage,
        hasMore: result.hasMore,
        isLoadingMore: false,
      );
    } on ApiException catch (error) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: error.userMessage,
      );
    } catch (_) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: 'Sem conexão. Mostrando conversas salvas neste aparelho.',
        isOfflineList: true,
      );
    }
  }

  Future<void> _loadFromCache() async {
    final cached = await _repository.listCachedSummaries();
    state = ConversationListState(
      items: await _toListItems(cached),
      page: 1,
      hasMore: false,
      isOfflineList: true,
    );
  }

  Future<List<ConversationListItem>> _toListItems(
    List<ConversationSummary> summaries,
  ) async {
    final items = <ConversationListItem>[];
    for (final summary in summaries) {
      final cached = await _repository.getCachedConversation(summary.id);
      items.add(
        ConversationListItem(
          summary: summary,
          previewMessages: cached?.messages ?? const [],
        ),
      );
    }
    return items;
  }

  Future<void> refresh() => loadInitial();
}

final conversationListControllerProvider = NotifierProvider<
    ConversationListController, ConversationListState>(
  ConversationListController.new,
);
