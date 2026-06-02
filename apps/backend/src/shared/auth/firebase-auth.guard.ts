import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import { FIREBASE_ADMIN } from './firebase-admin.provider';
import type { AuthenticatedUser } from './current-user.decorator';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseApp: App) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser; headers: { authorization?: string } }>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Token de autenticação ausente.' },
      });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Token de autenticação inválido.' },
      });
    }

    try {
      const decoded = await getAuth(this.firebaseApp).verifyIdToken(token);
      request.user = { uid: decoded.uid };
      return true;
    } catch {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Token de autenticação inválido ou expirado.' },
      });
    }
  }
}
