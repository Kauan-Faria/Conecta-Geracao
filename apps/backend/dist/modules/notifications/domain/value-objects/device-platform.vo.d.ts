export type DevicePlatformValue = 'ios' | 'android';
export declare class DevicePlatform {
    readonly value: DevicePlatformValue;
    private constructor();
    static create(raw: string): DevicePlatform;
}
