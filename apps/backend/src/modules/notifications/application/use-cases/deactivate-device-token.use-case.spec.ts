import { DeactivateDeviceTokenUseCase } from './deactivate-device-token.use-case';

describe('DeactivateDeviceTokenUseCase', () => {
  it('inativa token do usuário', async () => {
    const deviceTokens = {
      deactivateByFirebaseUidAndToken: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new DeactivateDeviceTokenUseCase(deviceTokens as never);
    const result = await useCase.execute('user-a', 'abcdefghij123456');

    expect(result.ok).toBe(true);
    expect(deviceTokens.deactivateByFirebaseUidAndToken).toHaveBeenCalledWith(
      'user-a',
      'abcdefghij123456',
    );
  });

  it('retorna erro para token inválido', async () => {
    const useCase = new DeactivateDeviceTokenUseCase({
      deactivateByFirebaseUidAndToken: jest.fn(),
    } as never);

    const result = await useCase.execute('user-a', 'x');
    expect(result.ok).toBe(false);
  });
});
