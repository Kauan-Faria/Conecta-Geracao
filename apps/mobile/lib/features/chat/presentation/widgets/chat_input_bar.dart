import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/chat/domain/voice_listening_state.dart';
import 'package:conecta_geracao/features/chat/presentation/voice_input_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChatInputBar extends ConsumerStatefulWidget {
  const ChatInputBar({
    required this.controller,
    required this.onSend,
    required this.isSending,
    this.enabled = true,
    super.key,
  });

  final TextEditingController controller;
  final VoidCallback onSend;
  final bool isSending;
  final bool enabled;

  @override
  ConsumerState<ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends ConsumerState<ChatInputBar> {
  String? _lastAppliedFieldText;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;
    final voiceState = ref.watch(voiceInputControllerProvider);
    final isListening = voiceState.isListening;
    final voiceEnabled =
        widget.enabled && !widget.isSending && voiceState.isPlatformSupported;

    ref.listen<VoiceInputState>(voiceInputControllerProvider, (
      previous,
      next,
    ) {
      if (next.isListening ||
          (previous?.isListening == true && next.transcript.isNotEmpty)) {
        final text = next.fieldText;
        if (text != _lastAppliedFieldText) {
          _lastAppliedFieldText = text;
          widget.controller.value = TextEditingValue(
            text: text,
            selection: TextSelection.collapsed(offset: text.length),
          );
        }
      }

      final message = next.feedbackMessage;
      if (message != null && message != previous?.feedbackMessage) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(message)));
        ref.read(voiceInputControllerProvider.notifier).clearFeedback();
      }
    });

    final buttonLabel = voiceButtonLabel(voiceState.status);
    final semanticLabel = voiceState.isPlatformSupported
        ? voiceButtonSemanticLabel(voiceState.status)
        : VoiceInputMessages.androidOnlySoon;
    final icon = isListening ? Icons.stop : Icons.mic;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(top: BorderSide(color: brand.divider)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Semantics(
              textField: true,
              label: 'Digite sua mensagem',
              child: TextField(
                controller: widget.controller,
                enabled: widget.enabled && !widget.isSending,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: widget.enabled ? (_) => widget.onSend() : null,
                decoration: InputDecoration(
                  hintText: 'Digite sua mensagem...',
                  hintStyle: theme.textTheme.bodyLarge?.copyWith(
                    color: AppColors.onSurfaceMuted,
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm + 4,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(brand.borderRadius + 8),
                    borderSide: BorderSide.none,
                  ),
                ),
                style: theme.textTheme.bodyLarge,
              ),
            ),
          ),
          SizedBox(width: AppSpacing.sm),
          Semantics(
            button: true,
            enabled: widget.enabled && !widget.isSending,
            label: semanticLabel,
            child: SizedBox(
              height: AppSpacing.minTouchTarget,
              child: FilledButton.icon(
                onPressed: !widget.enabled || widget.isSending
                    ? null
                    : () => _onVoicePressed(voiceEnabled: voiceEnabled),
                icon: Icon(icon, size: 20),
                label: Text(buttonLabel),
                style: FilledButton.styleFrom(
                  backgroundColor: isListening ? AppColors.error : null,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  minimumSize: const Size(
                    AppSpacing.minTouchTarget,
                    AppSpacing.minTouchTarget,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(brand.borderRadius + 8),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _onVoicePressed({required bool voiceEnabled}) async {
    if (!voiceEnabled) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          const SnackBar(content: Text(VoiceInputMessages.androidOnlySoon)),
        );
      return;
    }

    _lastAppliedFieldText = null;
    await ref
        .read(voiceInputControllerProvider.notifier)
        .toggle(currentFieldText: widget.controller.text);
  }
}
