import 'package:conecta_geracao/features/auth/domain/brazil_phone_formatter.dart';

enum PhoneMaskType { brazil, northAmerica, portugal, generic }

/// País suportado no seletor internacional de telefone.
class PhoneCountry {
  const PhoneCountry({
    required this.isoCode,
    required this.namePt,
    required this.dialCode,
    required this.flagEmoji,
    required this.displayMask,
    required this.minNationalDigits,
    required this.maxNationalDigits,
    this.maskType = PhoneMaskType.generic,
  });

  final String isoCode;
  final String namePt;
  final String dialCode;
  final String flagEmoji;
  final String displayMask;
  final int minNationalDigits;
  final int maxNationalDigits;
  final PhoneMaskType maskType;

  String get dialCodeDisplay => '+$dialCode';

  String get accessibilityLabel => '$namePt, código mais $dialCode';

  static PhoneCountry get defaultCountry => brazil;

  static final PhoneCountry brazil = PhoneCountry(
    isoCode: 'BR',
    namePt: 'Brasil',
    dialCode: '55',
    flagEmoji: '🇧🇷',
    displayMask: '(00) 00000-0000',
    minNationalDigits: 10,
    maxNationalDigits: 11,
    maskType: PhoneMaskType.brazil,
  );

  static final List<PhoneCountry> _catalog = [
    brazil,
    PhoneCountry(
      isoCode: 'US',
      namePt: 'Estados Unidos',
      dialCode: '1',
      flagEmoji: '🇺🇸',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'CA',
      namePt: 'Canadá',
      dialCode: '1',
      flagEmoji: '🇨🇦',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'MX',
      namePt: 'México',
      dialCode: '52',
      flagEmoji: '🇲🇽',
      displayMask: '00 0000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'GT',
      namePt: 'Guatemala',
      dialCode: '502',
      flagEmoji: '🇬🇹',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'BZ',
      namePt: 'Belize',
      dialCode: '501',
      flagEmoji: '🇧🇿',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 7,
    ),
    PhoneCountry(
      isoCode: 'SV',
      namePt: 'El Salvador',
      dialCode: '503',
      flagEmoji: '🇸🇻',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'HN',
      namePt: 'Honduras',
      dialCode: '504',
      flagEmoji: '🇭🇳',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'NI',
      namePt: 'Nicarágua',
      dialCode: '505',
      flagEmoji: '🇳🇮',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'CR',
      namePt: 'Costa Rica',
      dialCode: '506',
      flagEmoji: '🇨🇷',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'PA',
      namePt: 'Panamá',
      dialCode: '507',
      flagEmoji: '🇵🇦',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'CU',
      namePt: 'Cuba',
      dialCode: '53',
      flagEmoji: '🇨🇺',
      displayMask: '000 000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'HT',
      namePt: 'Haiti',
      dialCode: '509',
      flagEmoji: '🇭🇹',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'DO',
      namePt: 'República Dominicana',
      dialCode: '1',
      flagEmoji: '🇩🇴',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'JM',
      namePt: 'Jamaica',
      dialCode: '1',
      flagEmoji: '🇯🇲',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'TT',
      namePt: 'Trinidad e Tobago',
      dialCode: '1',
      flagEmoji: '🇹🇹',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'BB',
      namePt: 'Barbados',
      dialCode: '1',
      flagEmoji: '🇧🇧',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'BS',
      namePt: 'Bahamas',
      dialCode: '1',
      flagEmoji: '🇧🇸',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'AG',
      namePt: 'Antígua e Barbuda',
      dialCode: '1',
      flagEmoji: '🇦🇬',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'DM',
      namePt: 'Dominica',
      dialCode: '1',
      flagEmoji: '🇩🇲',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'GD',
      namePt: 'Granada',
      dialCode: '1',
      flagEmoji: '🇬🇩',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'KN',
      namePt: 'São Cristóvão e Névis',
      dialCode: '1',
      flagEmoji: '🇰🇳',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'LC',
      namePt: 'Santa Lúcia',
      dialCode: '1',
      flagEmoji: '🇱🇨',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'VC',
      namePt: 'São Vicente e Granadinas',
      dialCode: '1',
      flagEmoji: '🇻🇨',
      displayMask: '(000) 000-0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
      maskType: PhoneMaskType.northAmerica,
    ),
    PhoneCountry(
      isoCode: 'AR',
      namePt: 'Argentina',
      dialCode: '54',
      flagEmoji: '🇦🇷',
      displayMask: '00 0000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'BO',
      namePt: 'Bolívia',
      dialCode: '591',
      flagEmoji: '🇧🇴',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'CL',
      namePt: 'Chile',
      dialCode: '56',
      flagEmoji: '🇨🇱',
      displayMask: '0 0000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'CO',
      namePt: 'Colômbia',
      dialCode: '57',
      flagEmoji: '🇨🇴',
      displayMask: '000 000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'EC',
      namePt: 'Equador',
      dialCode: '593',
      flagEmoji: '🇪🇨',
      displayMask: '00 000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'GY',
      namePt: 'Guiana',
      dialCode: '592',
      flagEmoji: '🇬🇾',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 7,
    ),
    PhoneCountry(
      isoCode: 'PY',
      namePt: 'Paraguai',
      dialCode: '595',
      flagEmoji: '🇵🇾',
      displayMask: '000 000 000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'PE',
      namePt: 'Peru',
      dialCode: '51',
      flagEmoji: '🇵🇪',
      displayMask: '000 000 000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'SR',
      namePt: 'Suriname',
      dialCode: '597',
      flagEmoji: '🇸🇷',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 7,
    ),
    PhoneCountry(
      isoCode: 'UY',
      namePt: 'Uruguai',
      dialCode: '598',
      flagEmoji: '🇺🇾',
      displayMask: '0000 0000',
      minNationalDigits: 8,
      maxNationalDigits: 8,
    ),
    PhoneCountry(
      isoCode: 'VE',
      namePt: 'Venezuela',
      dialCode: '58',
      flagEmoji: '🇻🇪',
      displayMask: '000 000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'PT',
      namePt: 'Portugal',
      dialCode: '351',
      flagEmoji: '🇵🇹',
      displayMask: '000 000 000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
      maskType: PhoneMaskType.portugal,
    ),
    PhoneCountry(
      isoCode: 'DE',
      namePt: 'Alemanha',
      dialCode: '49',
      flagEmoji: '🇩🇪',
      displayMask: '000 000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 11,
    ),
    PhoneCountry(
      isoCode: 'IT',
      namePt: 'Itália',
      dialCode: '39',
      flagEmoji: '🇮🇹',
      displayMask: '000 000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'ES',
      namePt: 'Espanha',
      dialCode: '34',
      flagEmoji: '🇪🇸',
      displayMask: '000 000 000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'FR',
      namePt: 'França',
      dialCode: '33',
      flagEmoji: '🇫🇷',
      displayMask: '0 00 00 00 00',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'GB',
      namePt: 'Reino Unido',
      dialCode: '44',
      flagEmoji: '🇬🇧',
      displayMask: '0000 000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'IE',
      namePt: 'Irlanda',
      dialCode: '353',
      flagEmoji: '🇮🇪',
      displayMask: '00 000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'NL',
      namePt: 'Países Baixos',
      dialCode: '31',
      flagEmoji: '🇳🇱',
      displayMask: '0 0000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'BE',
      namePt: 'Bélgica',
      dialCode: '32',
      flagEmoji: '🇧🇪',
      displayMask: '000 00 00 00',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'CH',
      namePt: 'Suíça',
      dialCode: '41',
      flagEmoji: '🇨🇭',
      displayMask: '00 000 00 00',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'LU',
      namePt: 'Luxemburgo',
      dialCode: '352',
      flagEmoji: '🇱🇺',
      displayMask: '000 000 000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'JP',
      namePt: 'Japão',
      dialCode: '81',
      flagEmoji: '🇯🇵',
      displayMask: '00 0000 0000',
      minNationalDigits: 10,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'KR',
      namePt: 'Coreia do Sul',
      dialCode: '82',
      flagEmoji: '🇰🇷',
      displayMask: '00 0000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 10,
    ),
    PhoneCountry(
      isoCode: 'IL',
      namePt: 'Israel',
      dialCode: '972',
      flagEmoji: '🇮🇱',
      displayMask: '00 000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'AO',
      namePt: 'Angola',
      dialCode: '244',
      flagEmoji: '🇦🇴',
      displayMask: '000 000 000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'MZ',
      namePt: 'Moçambique',
      dialCode: '258',
      flagEmoji: '🇲🇿',
      displayMask: '00 000 0000',
      minNationalDigits: 9,
      maxNationalDigits: 9,
    ),
    PhoneCountry(
      isoCode: 'CV',
      namePt: 'Cabo Verde',
      dialCode: '238',
      flagEmoji: '🇨🇻',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 7,
    ),
    PhoneCountry(
      isoCode: 'GW',
      namePt: 'Guiné-Bissau',
      dialCode: '245',
      flagEmoji: '🇬🇼',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 7,
    ),
    PhoneCountry(
      isoCode: 'ST',
      namePt: 'São Tomé e Príncipe',
      dialCode: '239',
      flagEmoji: '🇸🇹',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 7,
    ),
    PhoneCountry(
      isoCode: 'TL',
      namePt: 'Timor-Leste',
      dialCode: '670',
      flagEmoji: '🇹🇱',
      displayMask: '000 0000',
      minNationalDigits: 7,
      maxNationalDigits: 8,
    ),
  ];

  static List<PhoneCountry> get all => List.unmodifiable(_catalog);

  static List<PhoneCountry> search(String query) {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) {
      return all;
    }

    final digitsOnly = normalized.replaceAll(RegExp(r'\D'), '');

    return all
        .where((country) {
          if (country.namePt.toLowerCase().contains(normalized)) {
            return true;
          }
          if (digitsOnly.isNotEmpty &&
              country.dialCode.startsWith(digitsOnly)) {
            return true;
          }
          if (normalized.startsWith('+') &&
              country.dialCode.startsWith(normalized.substring(1))) {
            return true;
          }
          return false;
        })
        .toList(growable: false);
  }

  static PhoneCountry? findByIsoCode(String isoCode) {
    for (final country in _catalog) {
      if (country.isoCode == isoCode) {
        return country;
      }
    }
    return null;
  }

  String formatDisplay(String input) {
    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) {
      return '';
    }

    switch (maskType) {
      case PhoneMaskType.brazil:
        return BrazilPhoneFormatter.formatDisplay(digits);
      case PhoneMaskType.northAmerica:
        return _formatNorthAmerica(digits);
      case PhoneMaskType.portugal:
        return _formatPortugal(digits);
      case PhoneMaskType.generic:
        final capped = digits.length > maxNationalDigits
            ? digits.substring(0, maxNationalDigits)
            : digits;
        return _formatGeneric(capped);
    }
  }

  String? toE164(String input) {
    if (maskType == PhoneMaskType.brazil) {
      return BrazilPhoneFormatter.toE164(input);
    }

    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length < minNationalDigits ||
        digits.length > maxNationalDigits) {
      return null;
    }
    return '+$dialCode$digits';
  }

  bool isComplete(String input) => toE164(input) != null;

  bool get isBrazil => isoCode == 'BR';

  static String _formatNorthAmerica(String digits) {
    if (digits.length <= 3) {
      return digits.isEmpty ? '' : '($digits';
    }
    if (digits.length <= 6) {
      return '(${digits.substring(0, 3)}) ${digits.substring(3)}';
    }
    final capped = digits.length > 10 ? digits.substring(0, 10) : digits;
    return '(${capped.substring(0, 3)}) ${capped.substring(3, 6)}-${capped.substring(6)}';
  }

  static String _formatPortugal(String digits) {
    final capped = digits.length > 9 ? digits.substring(0, 9) : digits;
    if (capped.length <= 3) {
      return capped;
    }
    if (capped.length <= 6) {
      return '${capped.substring(0, 3)} ${capped.substring(3)}';
    }
    return '${capped.substring(0, 3)} ${capped.substring(3, 6)} ${capped.substring(6)}';
  }

  static String _formatGeneric(String digits) {
    final capped = digits;
    final buffer = StringBuffer();
    for (var i = 0; i < capped.length; i++) {
      if (i > 0 && i % 3 == 0) {
        buffer.write(' ');
      }
      buffer.write(capped[i]);
    }
    return buffer.toString();
  }
}
