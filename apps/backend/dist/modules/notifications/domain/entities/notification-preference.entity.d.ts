export interface NotificationPreferenceProps {
    firebaseUid: string;
    enabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class NotificationPreference {
    readonly firebaseUid: string;
    readonly enabled: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static createDefault(firebaseUid: string): NotificationPreference;
    static reconstitute(props: NotificationPreferenceProps): NotificationPreference;
    updateEnabled(enabled: boolean): NotificationPreference;
}
