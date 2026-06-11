import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Entrada OTP em caixas individuais com suporte a autofill SMS.
class OtpPinInput extends StatefulWidget {
  const OtpPinInput({
    required this.controller,
    this.length = 6,
    this.onChanged,
    this.onCompleted,
    this.focusNode,
    super.key,
  });

  final TextEditingController controller;
  final int length;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onCompleted;
  final FocusNode? focusNode;

  @override
  State<OtpPinInput> createState() => _OtpPinInputState();
}

class _OtpPinInputState extends State<OtpPinInput> {
  late final FocusNode _focusNode;
  bool _ownsFocusNode = false;

  @override
  void initState() {
    super.initState();
    if (widget.focusNode != null) {
      _focusNode = widget.focusNode!;
    } else {
      _focusNode = FocusNode();
      _ownsFocusNode = true;
    }
    widget.controller.addListener(_handleControllerChanged);
    _focusNode.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    widget.controller.removeListener(_handleControllerChanged);
    if (_ownsFocusNode) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _handleControllerChanged() {
    final digits = _digitsOnly(widget.controller.text);
    if (digits != widget.controller.text) {
      widget.controller.value = TextEditingValue(
        text: digits,
        selection: TextSelection.collapsed(offset: digits.length),
      );
      return;
    }
    widget.onChanged?.call(digits);
    if (digits.length == widget.length) {
      widget.onCompleted?.call(digits);
    }
    setState(() {});
  }

  String _digitsOnly(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    if (digits.length <= widget.length) {
      return digits;
    }
    return digits.substring(0, widget.length);
  }

  @override
  Widget build(BuildContext context) {
    final brand = context.brand;
    final digits = _digitsOnly(widget.controller.text);
    final focusedIndex = digits.length < widget.length
        ? digits.length
        : widget.length - 1;

    return Semantics(
      label: 'Código de ${widget.length} números recebido por SMS',
      textField: true,
      child: GestureDetector(
        onTap: () => _focusNode.requestFocus(),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Opacity(
              opacity: 0,
              child: SizedBox(
                height: AppSpacing.minTouchTarget,
                child: TextField(
                  controller: widget.controller,
                  focusNode: _focusNode,
                  keyboardType: TextInputType.number,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(widget.length),
                  ],
                  maxLength: widget.length,
                  decoration: const InputDecoration(counterText: ''),
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < widget.length; i++) ...[
                  if (i > 0) SizedBox(width: AppSpacing.sm),
                  _PinBox(
                    digit: i < digits.length ? digits[i] : '',
                    isFocused: _focusNode.hasFocus && i == focusedIndex,
                    borderRadius: brand.borderRadius,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PinBox extends StatelessWidget {
  const _PinBox({
    required this.digit,
    required this.isFocused,
    required this.borderRadius,
  });

  final String digit;
  final bool isFocused;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      width: 44,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        border: Border.all(
          color: isFocused ? AppColors.primary : AppColors.border,
          width: isFocused ? 2 : 1,
        ),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: Text(
        digit,
        style: theme.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
