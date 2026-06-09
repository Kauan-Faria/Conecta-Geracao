import { Message } from '../../domain/entities/conversation.entity';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { MessageRole } from '../../domain/value-objects/message-role.vo';
import { toMessageDto } from './conversation.mapper';

describe('toMessageDto', () => {
  it('inclui metadata.map_action quando presente', () => {
    const message = Message.create({
      id: 'msg-1',
      conversationId: 'conv-1',
      role: MessageRole.assistant(),
      content: MessageContent.create('Vou procurar farmácias.'),
      metadata: {
        map_action: {
          type: 'map_search',
          category: 'pharmacy',
          radiusKm: 5,
        },
      },
    });

    const dto = toMessageDto(message);
    expect(dto.metadata?.map_action).toEqual({
      type: 'map_search',
      category: 'pharmacy',
      radiusKm: 5,
    });
  });

  it('omite metadata quando ausente', () => {
    const message = Message.create({
      id: 'msg-1',
      conversationId: 'conv-1',
      role: MessageRole.assistant(),
      content: MessageContent.create('Olá'),
    });

    const dto = toMessageDto(message);
    expect(dto.metadata).toBeUndefined();
  });
});
