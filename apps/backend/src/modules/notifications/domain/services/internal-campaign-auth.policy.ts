import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getInternalServiceKey } from '../config/notification.config';

@Injectable()
export class InternalCampaignAuthPolicy {
  assertAuthorized(serviceKey: string | undefined): void {
    const expected = getInternalServiceKey();
    if (!expected || !serviceKey || serviceKey !== expected) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Credencial interna inválida ou ausente.' },
      });
    }
  }
}
