export const FCM_PERMANENT_ERROR_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

export const FCM_RETRYABLE_ERROR_CODES = new Set([
  'messaging/internal-error',
  'messaging/server-unavailable',
  'messaging/quota-exceeded',
  'messaging/unknown-error',
]);

export const FCM_RETRY_DELAYS_MS = [1000, 2000, 4000];

export function truncateToken(token: string): string {
  if (token.length <= 8) return '***';
  return `${token.slice(0, 8)}...`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
