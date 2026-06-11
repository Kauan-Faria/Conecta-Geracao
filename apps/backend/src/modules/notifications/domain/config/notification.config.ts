export function getInactivityThresholdHours(): number {
  const raw = Number.parseInt(process.env.NOTIFICATION_INACTIVITY_HOURS ?? '24', 10);
  if (Number.isNaN(raw)) return 24;
  return Math.min(168, Math.max(1, raw));
}

export function getReminderCooldownHours(): number {
  const raw = Number.parseInt(process.env.NOTIFICATION_REMINDER_COOLDOWN_HOURS ?? '24', 10);
  if (Number.isNaN(raw)) return 24;
  return Math.min(168, Math.max(1, raw));
}

export function getNotificationJobBatchLimit(): number {
  const raw = Number.parseInt(process.env.NOTIFICATION_JOB_BATCH_LIMIT ?? '500', 10);
  if (Number.isNaN(raw)) return 500;
  return Math.min(5000, Math.max(1, raw));
}

export function isFcmEnabled(): boolean {
  return process.env.FCM_ENABLED === 'true';
}

export function getTipWeeklyDays(): number {
  const raw = Number.parseInt(process.env.NOTIFICATION_TIP_WEEKLY_DAYS ?? '7', 10);
  if (Number.isNaN(raw)) return 7;
  return Math.min(30, Math.max(1, raw));
}

export function getCampaignBatchLimit(): number {
  const raw = Number.parseInt(process.env.NOTIFICATION_CAMPAIGN_BATCH_LIMIT ?? '500', 10);
  if (Number.isNaN(raw)) return 500;
  return Math.min(5000, Math.max(1, raw));
}

export function getTipJobBatchLimit(): number {
  const raw = Number.parseInt(process.env.NOTIFICATION_TIP_JOB_BATCH_LIMIT ?? '1000', 10);
  if (Number.isNaN(raw)) return 1000;
  return Math.min(5000, Math.max(1, raw));
}

export function getInternalServiceKey(): string | undefined {
  return process.env.NOTIFICATIONS_INTERNAL_SERVICE_KEY?.trim() || undefined;
}
