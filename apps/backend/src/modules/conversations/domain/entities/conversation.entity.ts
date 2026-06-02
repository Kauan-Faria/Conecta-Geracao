import { ConversationClosedError } from '../errors/domain.errors';
import { ConversationStatus } from '../value-objects/conversation-status.vo';
import { MessageContent } from '../value-objects/message-content.vo';
import { MessageRole } from '../value-objects/message-role.vo';

export interface MessageProps {
  id?: string;
  conversationId: string;
  role: MessageRole;
  content: MessageContent;
  createdAt?: Date;
}

export class Message {
  readonly id?: string;
  readonly conversationId: string;
  readonly role: MessageRole;
  readonly content: MessageContent;
  readonly createdAt: Date;

  private constructor(props: MessageProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.role = props.role;
    this.content = props.content;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: MessageProps): Message {
    return new Message(props);
  }
}

export interface ConversationProps {
  id?: string;
  firebaseUid: string;
  topicSlug?: string | null;
  status?: ConversationStatus;
  currentStep?: number;
  createdAt?: Date;
  updatedAt?: Date;
  messages?: Message[];
}

export class Conversation {
  readonly id?: string;
  readonly firebaseUid: string;
  readonly topicSlug: string | null;
  readonly status: ConversationStatus;
  readonly currentStep: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly messages: Message[];

  private constructor(props: ConversationProps) {
    this.id = props.id;
    this.firebaseUid = props.firebaseUid;
    this.topicSlug = props.topicSlug ?? null;
    this.status = props.status ?? ConversationStatus.inProgress();
    this.currentStep = props.currentStep ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.messages = props.messages ?? [];
  }

  static create(props: ConversationProps): Conversation {
    if (!props.firebaseUid.trim()) {
      throw new Error('firebaseUid é obrigatório');
    }
    return new Conversation(props);
  }

  assertCanReceiveMessage(): void {
    if (!this.status.isInProgress()) {
      throw new ConversationClosedError();
    }
  }

  withMessages(messages: Message[]): Conversation {
    return new Conversation({
      id: this.id,
      firebaseUid: this.firebaseUid,
      topicSlug: this.topicSlug,
      status: this.status,
      currentStep: this.currentStep,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      messages,
    });
  }
}

export type ConversationWithMessages = Conversation & { messages: Message[] };
