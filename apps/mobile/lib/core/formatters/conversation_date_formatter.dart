String formatRecentConversationDate(DateTime value) {
  final local = value.toLocal();
  final now = DateTime.now();
  final time =
      '${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';

  if (_isSameDay(local, now)) {
    return 'Hoje, $time';
  }

  final yesterday = now.subtract(const Duration(days: 1));
  if (_isSameDay(local, yesterday)) {
    return 'Ontem, $time';
  }

  final day = local.day.toString().padLeft(2, '0');
  final month = local.month.toString().padLeft(2, '0');
  return '$day/$month, $time';
}

bool _isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}
