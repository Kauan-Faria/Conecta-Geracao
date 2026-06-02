import 'package:conecta_geracao/core/formatters/conversation_date_formatter.dart';
import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/chat/domain/topic_display_label.dart';
import 'package:conecta_geracao/features/chat/domain/topic_shortcuts.dart';
import 'package:conecta_geracao/features/chat/presentation/conversation_list_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  static const _recentLimit = 4;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final listState = isAuthenticated
        ? ref.watch(conversationListControllerProvider)
        : const ConversationListState();
    final recentItems = listState.items.take(_recentLimit).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.sm,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: const _HomeHeader(),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _HomeHeroSection(
                      onHelpTap: () => context.go('/chat?new=true'),
                    ),
                    SizedBox(height: AppSpacing.xl),
                    Text(
                      'O que você quer fazer?',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.onSurface,
                      ),
                    ),
                    SizedBox(height: AppSpacing.md),
                    _HomeQuickActionsGrid(
                      onTopicTap: (slug) => context.go('/chat?topic=$slug'),
                    ),
                    SizedBox(height: AppSpacing.xl),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Verificações recentes',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.onSurface,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push('/conversations'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.sm,
                            ),
                            minimumSize: const Size(
                              AppSpacing.minTouchTarget,
                              AppSpacing.minTouchTarget,
                            ),
                          ),
                          child: const Text('Ver todas'),
                        ),
                      ],
                    ),
                    SizedBox(height: AppSpacing.sm),
                    _RecentConversationsCard(
                      isLoading: listState.isLoading,
                      items: recentItems,
                      onOpenConversation: (id) =>
                          context.go('/chat?conversationId=$id'),
                    ),
                    SizedBox(height: AppSpacing.lg),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader();

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/icons/logo.png',
      height: 36,
      alignment: Alignment.centerLeft,
      semanticLabel: 'Logo ConectaGeração',
    );
  }
}

class _HomeHeroSection extends StatelessWidget {
  const _HomeHeroSection({required this.onHelpTap});

  final VoidCallback onHelpTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Antes de fazer algo importante...',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.onSurface,
            height: 1.3,
          ),
        ),
        SizedBox(height: AppSpacing.xs),
        Text(
          'Confira rapidamente e evite erros.',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
        ),
        SizedBox(height: AppSpacing.lg),
        Semantics(
          button: true,
          label: 'Quero ajuda agora',
          child: SizedBox(
            height: AppSpacing.minTouchTarget,
            child: FilledButton(
              onPressed: onHelpTap,
              style: FilledButton.styleFrom(
                backgroundColor: colorScheme.primary,
                foregroundColor: colorScheme.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(brand.borderRadius),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Quero ajuda agora',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(width: AppSpacing.xs),
                  Icon(Icons.chevron_right, size: 20),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _HomeQuickActionsGrid extends StatelessWidget {
  const _HomeQuickActionsGrid({required this.onTopicTap});

  final ValueChanged<String> onTopicTap;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.sm,
      crossAxisSpacing: AppSpacing.sm,
      childAspectRatio: 1.8,
      children: [
        for (final shortcut in mvpTopicShortcuts)
          _HomeQuickActionCard(
            shortcut: shortcut,
            onTap: () => onTopicTap(shortcut.slug),
          ),
      ],
    );
  }
}

class _HomeQuickActionCard extends StatelessWidget {
  const _HomeQuickActionCard({
    required this.shortcut,
    required this.onTap,
  });

  final TopicShortcut shortcut;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

    return Semantics(
      button: true,
      label: 'Iniciar conversa: ${shortcut.actionLabel}',
      child: Material(
        color: brand.cardBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(brand.borderRadius),
          side: BorderSide(color: brand.cardBorder),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(brand.borderRadius),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              minHeight: AppSpacing.minTouchTarget,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.sm,
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      shortcut.icon,
                      color: AppColors.primary,
                      size: 22,
                      semanticLabel: shortcut.actionLabel,
                    ),
                  ),
                  SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      shortcut.actionLabel,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.onSurface,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right,
                    color: AppColors.onSurfaceVariant,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RecentConversationsCard extends StatelessWidget {
  const _RecentConversationsCard({
    required this.isLoading,
    required this.items,
    required this.onOpenConversation,
  });

  final bool isLoading;
  final List<ConversationListItem> items;
  final ValueChanged<String> onOpenConversation;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

    if (isLoading) {
      return const SizedBox(
        height: 120,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (items.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: brand.cardBackground,
          borderRadius: BorderRadius.circular(brand.borderRadius),
          border: Border.all(color: brand.cardBorder),
        ),
        child: Text(
          'Suas conversas recentes aparecerão aqui.',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: brand.cardBackground,
        borderRadius: BorderRadius.circular(brand.borderRadius),
        border: Border.all(color: brand.cardBorder),
      ),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0) Divider(height: 1, color: brand.divider),
            _RecentConversationTile(
              item: items[i],
              onTap: () => onOpenConversation(items[i].summary.id),
            ),
          ],
        ],
      ),
    );
  }
}

class _RecentConversationTile extends StatelessWidget {
  const _RecentConversationTile({
    required this.item,
    required this.onTap,
  });

  final ConversationListItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title = conversationListTitle(
      topicSlug: item.summary.topicSlug,
      messages: item.previewMessages,
    );
    final dateLabel = formatRecentConversationDate(item.summary.updatedAt);

    return Semantics(
      button: true,
      label: 'Abrir conversa $title, $dateLabel',
      child: ListTile(
        minVerticalPadding: AppSpacing.md,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
        ),
        title: Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          dateLabel,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
        ),
        trailing: const Icon(
          Icons.chevron_right,
          color: AppColors.onSurfaceVariant,
        ),
        onTap: onTap,
      ),
    );
  }
}
