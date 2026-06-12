import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/auth/domain/phone_country.dart';
import 'package:flutter/material.dart';

/// Seletor compacto de país (bandeira + DDI) com bottom sheet pesquisável.
class CountryCodeSelector extends StatelessWidget {
  const CountryCodeSelector({
    required this.selectedCountry,
    required this.onCountryChanged,
    super.key,
  });

  final PhoneCountry selectedCountry;
  final ValueChanged<PhoneCountry> onCountryChanged;

  Future<void> _openCountryPicker(BuildContext context) async {
    final picked = await showModalBottomSheet<PhoneCountry>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) =>
          _CountryPickerSheet(selectedCountry: selectedCountry),
    );

    if (picked != null) {
      onCountryChanged(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

    return Semantics(
      button: true,
      label:
          'País selecionado: ${selectedCountry.namePt}, código ${selectedCountry.dialCodeDisplay}',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _openCountryPicker(context),
          borderRadius: BorderRadius.circular(brand.borderRadius),
          child: Container(
            constraints: const BoxConstraints(
              minHeight: AppSpacing.minTouchTarget,
            ),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(brand.borderRadius),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _CountryFlag(country: selectedCountry),
                SizedBox(width: AppSpacing.xs),
                Text(
                  selectedCountry.dialCodeDisplay,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(width: AppSpacing.xs),
                Icon(
                  Icons.arrow_drop_down,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CountryFlag extends StatelessWidget {
  const _CountryFlag({required this.country});

  final PhoneCountry country;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      excludeSemantics: true,
      child: Text(
        country.flagEmoji,
        style: const TextStyle(fontSize: 20),
        semanticsLabel: country.isoCode,
      ),
    );
  }
}

class _CountryPickerSheet extends StatefulWidget {
  const _CountryPickerSheet({required this.selectedCountry});

  final PhoneCountry selectedCountry;

  @override
  State<_CountryPickerSheet> createState() => _CountryPickerSheetState();
}

class _CountryPickerSheetState extends State<_CountryPickerSheet> {
  final _searchController = TextEditingController();
  List<PhoneCountry> _filtered = PhoneCountry.all;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_applyFilter);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _applyFilter() {
    setState(() {
      _filtered = PhoneCountry.search(_searchController.text);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SafeArea(
        child: SizedBox(
          height: MediaQuery.sizeOf(context).height * 0.75,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.md,
                  AppSpacing.sm,
                ),
                child: Text(
                  'Selecione o país',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar país ou código',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(
                        context.brand.borderRadius,
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Expanded(
                child: _filtered.isEmpty
                    ? Center(
                        child: Text(
                          'Nenhum país encontrado',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      )
                    : ListView.separated(
                        itemCount: _filtered.length,
                        separatorBuilder: (_, _) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final country = _filtered[index];
                          final isSelected =
                              country.isoCode == widget.selectedCountry.isoCode;

                          return Semantics(
                            button: true,
                            selected: isSelected,
                            label: country.accessibilityLabel,
                            child: ListTile(
                              minVerticalPadding: AppSpacing.sm,
                              leading: _CountryFlag(country: country),
                              title: Text(country.namePt),
                              trailing: Text(
                                country.dialCodeDisplay,
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              selected: isSelected,
                              onTap: () => Navigator.of(context).pop(country),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
