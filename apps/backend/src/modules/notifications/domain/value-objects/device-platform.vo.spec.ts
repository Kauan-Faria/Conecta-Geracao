import { InvalidDevicePlatformError } from '../errors/domain.errors';
import { DevicePlatform } from './device-platform.vo';

describe('DevicePlatform', () => {
  it('aceita ios e android', () => {
    expect(DevicePlatform.create('ios').value).toBe('ios');
    expect(DevicePlatform.create('android').value).toBe('android');
  });

  it('rejeita plataforma inválida', () => {
    expect(() => DevicePlatform.create('web')).toThrow(InvalidDevicePlatformError);
  });
});
