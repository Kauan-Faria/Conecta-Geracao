import { EducationalTip } from '../entities/educational-tip.entity';
export declare class TipSelectionPolicy {
    selectTipForUser(firebaseUid: string, catalog: EducationalTip[]): EducationalTip;
    private getIsoWeekNumber;
    private simpleHash;
}
