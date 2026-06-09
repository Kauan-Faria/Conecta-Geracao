import 'package:flutter/material.dart';

enum PoiCategory {
  pharmacy,
  healthPost,
  hospital,
  bank,
  postOffice,
  supermarket;

  String get apiValue => switch (this) {
    PoiCategory.pharmacy => 'pharmacy',
    PoiCategory.healthPost => 'health_post',
    PoiCategory.hospital => 'hospital',
    PoiCategory.bank => 'bank',
    PoiCategory.postOffice => 'post_office',
    PoiCategory.supermarket => 'supermarket',
  };

  String get label => switch (this) {
    PoiCategory.pharmacy => 'Farmácia',
    PoiCategory.healthPost => 'UBS',
    PoiCategory.hospital => 'Hospital/UPA',
    PoiCategory.bank => 'Banco/Lotérica',
    PoiCategory.postOffice => 'Correios',
    PoiCategory.supermarket => 'Supermercado',
  };

  IconData get icon => switch (this) {
    PoiCategory.pharmacy => Icons.local_pharmacy,
    PoiCategory.healthPost => Icons.medical_services_outlined,
    PoiCategory.hospital => Icons.local_hospital_outlined,
    PoiCategory.bank => Icons.account_balance_outlined,
    PoiCategory.postOffice => Icons.local_post_office_outlined,
    PoiCategory.supermarket => Icons.shopping_cart_outlined,
  };

  static PoiCategory? fromApiValue(String? raw) {
    if (raw == null || raw.isEmpty) {
      return null;
    }
    for (final category in PoiCategory.values) {
      if (category.apiValue == raw) {
        return category;
      }
    }
    return null;
  }
}
