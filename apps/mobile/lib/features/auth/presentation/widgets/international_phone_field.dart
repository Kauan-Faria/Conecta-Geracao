import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/auth/domain/phone_country.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/country_code_selector.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Campo de telefone internacional com seletor de país integrado.
class InternationalPhoneField extends StatelessWidget {
  const InternationalPhoneField({
    required this.controller,
    required this.selectedCountry,
    required this.onCountryChanged,
    this.onChanged,
    super.key,
  });

  final TextEditingController controller;
  final PhoneCountry selectedCountry;
  final ValueChanged<PhoneCountry> onCountryChanged;
  final ValueChanged<String>? onChanged;

  InputBorder _outlineBorder(
    BuildContext context, {
    Color? color,
    double width = 1,
  }) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(context.brand.borderRadius),
      borderSide: BorderSide(color: color ?? AppColors.border, width: width),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Digite seu número de telefone:',
          style: theme.textTheme.labelMedium?.copyWith(
            color: AppColors.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: AppSpacing.sm),
        Semantics(
          label:
              'Número de telefone, país ${selectedCountry.namePt}, código ${selectedCountry.dialCodeDisplay}',
          textField: true,
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CountryCodeSelector(
                  selectedCountry: selectedCountry,
                  onCountryChanged: onCountryChanged,
                ),
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextField(
                    controller: controller,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(
                        selectedCountry.maxNationalDigits,
                      ),
                      _PhoneCountryInputFormatter(selectedCountry),
                    ],
                    decoration: InputDecoration(
                      hintText: selectedCountry.displayMask,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.md,
                      ),
                      border: _outlineBorder(context),
                      enabledBorder: _outlineBorder(context),
                      focusedBorder: _outlineBorder(
                        context,
                        color: AppColors.primary,
                        width: 2,
                      ),
                    ),
                    onChanged: onChanged,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _PhoneCountryInputFormatter extends TextInputFormatter {
  const _PhoneCountryInputFormatter(this.country);

  final PhoneCountry country;

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final formatted = country.formatDisplay(newValue.text);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
