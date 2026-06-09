import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class DisplayNameOnboardingPage extends ConsumerStatefulWidget {
  const DisplayNameOnboardingPage({super.key});

  @override
  ConsumerState<DisplayNameOnboardingPage> createState() =>
      _DisplayNameOnboardingPageState();
}

class _DisplayNameOnboardingPageState
    extends ConsumerState<DisplayNameOnboardingPage> {
  final _nameController = TextEditingController();
  String? _fieldError;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _continue() async {
    final name = _nameController.text.trim();
    if (name.length < 2) {
      setState(() => _fieldError = 'Escreva como quer ser chamado');
      return;
    }

    setState(() => _fieldError = null);
    await ref.read(authControllerProvider.notifier).updateDisplayName(name);

    final error = ref.read(authControllerProvider).error;
    if (error is AuthException) {
      setState(() => _fieldError = error.message);
      return;
    }

    if (mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final theme = Theme.of(context);

    return AppScaffold(
      title: 'Como podemos te chamar?',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Escreva seu nome ou apelido. Vamos usar isso para te cumprimentar no app.',
            style: theme.textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          Semantics(
            label: 'Seu nome ou apelido',
            textField: true,
            child: TextField(
              controller: _nameController,
              autofocus: true,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: 'Seu nome ou apelido',
                errorText: _fieldError,
              ),
              onChanged: (_) {
                if (_fieldError != null) {
                  setState(() => _fieldError = null);
                }
              },
            ),
          ),
          SizedBox(height: AppSpacing.xl),
          AppButton(
            label: 'Continuar',
            semanticLabel: 'Continuar com este nome',
            isLoading: authState.isLoading,
            onPressed: authState.isLoading ? null : _continue,
          ),
        ],
      ),
    );
  }
}
