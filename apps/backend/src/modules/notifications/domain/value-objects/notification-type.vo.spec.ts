import { NotificationType } from './notification-type.vo';

describe('NotificationType', () => {
  it('cria tipos válidos', () => {
    expect(NotificationType.reminder().value).toBe('reminder');
    expect(NotificationType.create('ai_response').value).toBe('ai_response');
    expect(NotificationType.create('tip').value).toBe('tip');
    expect(NotificationType.create('campaign').value).toBe('campaign');
  });

  it('rejeita tipo inválido', () => {
    expect(() => NotificationType.create('invalid')).toThrow();
  });
});
