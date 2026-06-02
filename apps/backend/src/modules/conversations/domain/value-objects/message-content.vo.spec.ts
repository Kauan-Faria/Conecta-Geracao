import { InvalidMessageContentError } from '../errors/domain.errors';
import { MessageContent } from './message-content.vo';

describe('MessageContent', () => {
  it('aceita conteúdo válido após trim', () => {
    const content = MessageContent.create('  Olá  ');
    expect(content.value).toBe('Olá');
  });

  it('rejeita conteúdo vazio', () => {
    expect(() => MessageContent.create('   ')).toThrow(InvalidMessageContentError);
  });

  it('rejeita conteúdo acima de 4000 caracteres', () => {
    expect(() => MessageContent.create('a'.repeat(4001))).toThrow(InvalidMessageContentError);
  });
});
