"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.requestId ?? 'unknown';
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            if (typeof body === 'object' && body !== null && 'error' in body) {
                response.status(status).json({
                    ...body,
                    meta: { requestId },
                });
                return;
            }
            const message = typeof body === 'string'
                ? body
                : (body.message ?? 'Erro na requisição.');
            const normalizedMessage = Array.isArray(message) ? message.join('; ') : message;
            response.status(status).json({
                error: {
                    code: this.codeFromStatus(status),
                    message: normalizedMessage,
                },
                errors: status === common_1.HttpStatus.BAD_REQUEST ? this.extractFieldErrors(body) : [],
                meta: { requestId },
            });
            return;
        }
        this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
            },
            meta: { requestId },
        });
    }
    codeFromStatus(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'VALIDATION_ERROR';
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case common_1.HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case common_1.HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case common_1.HttpStatus.CONFLICT:
                return 'CONFLICT';
            case common_1.HttpStatus.TOO_MANY_REQUESTS:
                return 'RATE_LIMITED';
            default:
                return 'INTERNAL_ERROR';
        }
    }
    extractFieldErrors(body) {
        if (typeof body !== 'object' || body === null)
            return [];
        const message = body.message;
        if (!Array.isArray(message))
            return [];
        return message.map((entry, index) => ({
            field: `field_${index}`,
            message: entry,
        }));
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map