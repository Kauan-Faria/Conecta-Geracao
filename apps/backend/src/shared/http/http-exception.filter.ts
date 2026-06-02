import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface RequestWithId {
  requestId?: string;
}

interface JsonResponse {
  status(code: number): JsonResponse;
  json(body: unknown): void;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<JsonResponse>();
    const request = ctx.getRequest<RequestWithId>();
    const requestId = request.requestId ?? 'unknown';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null && 'error' in body) {
        response.status(status).json({
          ...(body as Record<string, unknown>),
          meta: { requestId },
        });
        return;
      }

      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? 'Erro na requisição.');

      const normalizedMessage = Array.isArray(message) ? message.join('; ') : message;

      response.status(status).json({
        error: {
          code: this.codeFromStatus(status),
          message: normalizedMessage,
        },
        errors: status === HttpStatus.BAD_REQUEST ? this.extractFieldErrors(body) : [],
        meta: { requestId },
      });
      return;
    }

    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
      },
      meta: { requestId },
    });
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'INTERNAL_ERROR';
    }
  }

  private extractFieldErrors(body: unknown): Array<{ field: string; message: string }> {
    if (typeof body !== 'object' || body === null) return [];

    const message = (body as { message?: string | string[] }).message;
    if (!Array.isArray(message)) return [];

    return message.map((entry, index) => ({
      field: `field_${index}`,
      message: entry,
    }));
  }
}
