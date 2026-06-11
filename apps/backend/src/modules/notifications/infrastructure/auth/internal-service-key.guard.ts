import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getInternalServiceKey } from '../../domain/config/notification.config';

@Injectable()
export class InternalServiceKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { 'x-internal-service-key'?: string };
    }>();
    const provided = request.headers['x-internal-service-key'];
    const expected = getInternalServiceKey();

    if (!expected || !provided || provided !== expected) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Credencial interna inválida ou ausente.' },
      });
    }

    return true;
  }
}
