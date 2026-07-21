import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/tutorials/domain/tutorial.dart';
import 'package:conecta_geracao/features/tutorials/domain/tutorials_catalog.dart';
import 'package:conecta_geracao/features/tutorials/presentation/widgets/tutorial_video_player.dart';
import 'package:flutter/material.dart';

/// Aba "Tutoriais": lista rolável de vídeos-tutoriais do YouTube reproduzidos
/// inline. O conteúdo vem do catálogo estático [tutorialsCatalog].
class TutorialsPage extends StatelessWidget {
  const TutorialsPage({this.tutorials = tutorialsCatalog, super.key});

  final List<Tutorial> tutorials;

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Tutoriais',
      body: tutorials.isEmpty
          ? const _EmptyTutorials()
          : ListView.separated(
              itemCount: tutorials.length,
              separatorBuilder: (_, _) => SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                return _TutorialCard(tutorial: tutorials[index]);
              },
            ),
    );
  }
}

class _TutorialCard extends StatelessWidget {
  const _TutorialCard({required this.tutorial});

  final Tutorial tutorial;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

    return Container(
      decoration: BoxDecoration(
        color: brand.cardBackground,
        borderRadius: BorderRadius.circular(brand.borderRadius),
        border: Border.all(color: brand.cardBorder),
      ),
      padding: EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            tutorial.title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: AppSpacing.sm),
          TutorialVideoPlayer(youtubeUrl: tutorial.youtubeUrl),
        ],
      ),
    );
  }
}

class _EmptyTutorials extends StatelessWidget {
  const _EmptyTutorials();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.ondemand_video_outlined,
            size: 48,
            color: theme.colorScheme.onSurfaceVariant,
          ),
          SizedBox(height: AppSpacing.md),
          Text(
            'Nenhum tutorial disponível no momento.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
