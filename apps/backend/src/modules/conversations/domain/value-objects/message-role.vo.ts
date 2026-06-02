export type MessageRoleValue = 'user' | 'assistant';

export class MessageRole {
  private constructor(public readonly value: MessageRoleValue) {}

  static user(): MessageRole {
    return new MessageRole('user');
  }

  static assistant(): MessageRole {
    return new MessageRole('assistant');
  }

  static from(value: MessageRoleValue): MessageRole {
    return new MessageRole(value);
  }
}
