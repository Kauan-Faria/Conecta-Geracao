import { Injectable } from '@nestjs/common';
import { EducationalTip } from '../entities/educational-tip.entity';

@Injectable()
export class TipSelectionPolicy {
  selectTipForUser(firebaseUid: string, catalog: EducationalTip[]): EducationalTip {
    if (catalog.length === 0) {
      throw new Error('Catálogo de dicas vazio.');
    }

    const weekNumber = this.getIsoWeekNumber(new Date());
    const hash = this.simpleHash(`${firebaseUid}:${weekNumber}`);
    const index = hash % catalog.length;
    return catalog[index]!;
  }

  private getIsoWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private simpleHash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}
