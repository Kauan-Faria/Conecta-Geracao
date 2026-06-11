import { InvalidDevicePlatformError } from '../errors/domain.errors';

export type DevicePlatformValue = 'ios' | 'android';

export class DevicePlatform {
  private constructor(public readonly value: DevicePlatformValue) {}

  static create(raw: string): DevicePlatform {
    if (raw === 'ios' || raw === 'android') {
      return new DevicePlatform(raw);
    }
    throw new InvalidDevicePlatformError(raw);
  }
}
