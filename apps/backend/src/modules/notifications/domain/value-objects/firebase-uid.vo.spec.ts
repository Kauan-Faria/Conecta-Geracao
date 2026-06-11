import { InvalidFirebaseUidError } from '../errors/domain.errors';
import { FirebaseUid } from './firebase-uid.vo';

describe('FirebaseUid', () => {
  it('aceita uid não vazio', () => {
    expect(FirebaseUid.create('user-123').value).toBe('user-123');
  });

  it('rejeita uid vazio', () => {
    expect(() => FirebaseUid.create('  ')).toThrow(InvalidFirebaseUidError);
  });
});
