import { InvalidFcmTokenError } from '../errors/domain.errors';
import { FcmToken } from './fcm-token.vo';

describe('FcmToken', () => {
  it('aceita token válido após trim', () => {
    const token = FcmToken.create('  abcdefghij  ');
    expect(token.value).toBe('abcdefghij');
  });

  it('rejeita token vazio', () => {
    expect(() => FcmToken.create('   ')).toThrow(InvalidFcmTokenError);
  });

  it('rejeita token curto', () => {
    expect(() => FcmToken.create('short')).toThrow(InvalidFcmTokenError);
  });
});
