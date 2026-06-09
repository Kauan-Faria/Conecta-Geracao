import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/chat/domain/topic_display_label.dart';
import 'package:conecta_geracao/features/chat/presentation/conversation_list_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class ConversationListPage extends ConsumerStatefulWidget {
  const ConversationListPage({super.key});

  @override
  ConsumerState<ConversationListPage> createState() =>
      _ConversationListPageState();
}

class _ConversationListPageState extends ConsumerState<ConversationListPage> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) {
      return;
    }
    final maxScroll = _scrollController.position.maxScrollExtent;
    final current = _scrollController.position.pixels;
    if (current >= maxScroll - 200) {
      ref.read(conversationListControllerProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final listState = ref.watch(conversationListControllerProvider);
    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final theme = Theme.of(context);

    if (!isAuthenticated) {
      return AppScaffold(
        title: 'Minhas conversas',
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Entre com seu celular para ver suas conversas salvas.',
              style: theme.textTheme.bodyLarge,
            ),
            SizedBox(height: AppSpacing.lg),
            AppButton(
              label: 'Entrar com celular',
              semanticLabel: 'Entrar com celular para ver conversas',
              onPressed: () => context.push('/login'),
            ),
          ],
        ),
      );
    }

    return AppScaffold(
      title: 'Minhas conversas',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (listState.isOfflineList)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Text(
                'Sem internet. Mostrando conversas salvas neste aparelho.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
              ),
            ),
          if (listState.errorMessage != null)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Text(
                listState.errorMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.error,
                ),
              ),
            ),
          Expanded(child: _buildBody(context, listState, theme)),
        ],
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    ConversationListState listState,
    ThemeData theme,
  ) {
    if (listState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (listState.items.isEmpty) {
      return Center(
        child: Text(
          'Você ainda não tem conversas salvas.',
          style: theme.textTheme.bodyLarge,
          textAlign: TextAlign.center,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () =>
          ref.read(conversationListControllerProvider.notifier).refresh(),
      child: ListView.separated(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: listState.items.length + (listState.isLoadingMore ? 1 : 0),
        separatorBuilder: (_, _) => const Divider(height: 1),
        itemBuilder: (context, index) {
          if (index >= listState.items.length) {
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final item = listState.items[index];
          final title = conversationListTitle(
            topicSlug: item.summary.topicSlug,
            messages: item.previewMessages,
          );

          return Semantics(
            button: true,
            label:
                'Conversa $title, atualizada em ${_formatDate(item.summary.updatedAt)}',
            child: ListTile(
              minVerticalPadding: AppSpacing.md,
              title: Text(title, style: theme.textTheme.titleMedium),
              subtitle: Text(
                _formatDate(item.summary.updatedAt),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                context.go('/chat?conversationId=${item.summary.id}');
              },
            ),
          );
        },
      ),
    );
  }

  String _formatDate(DateTime value) {
    final local = value.toLocal();
    final day = local.day.toString().padLeft(2, '0');
    final month = local.month.toString().padLeft(2, '0');
    final year = local.year;
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '$day/$month/$year $hour:$minute';
  }
}
