export const REPLY_MODES = ['rag', 'clarify', 'general'] as const;

export type ReplyMode = (typeof REPLY_MODES)[number];

export function isReplyMode(value: unknown): value is ReplyMode {
  return typeof value === 'string' && (REPLY_MODES as readonly string[]).includes(value);
}
