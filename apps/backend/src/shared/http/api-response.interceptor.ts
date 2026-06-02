import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { isPaginatedPayload } from './paginated-response';

interface RequestWithId {
  requestId?: string;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const requestId = request.requestId ?? 'unknown';

    return next.handle().pipe(
      map((value) => {
        if (isPaginatedPayload(value)) {
          const totalPages = Math.ceil(value.total / value.limit) || 0;
          return {
            data: value.items,
            meta: {
              requestId,
              page: value.page,
              limit: value.limit,
              total: value.total,
              totalPages,
            },
          };
        }

        return {
          data: value ?? null,
          meta: { requestId },
        };
      }),
    );
  }
}
