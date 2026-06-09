"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./shared/prisma/prisma.module");
const auth_module_1 = require("./shared/auth/auth.module");
const knowledge_base_module_1 = require("./modules/knowledge-base/knowledge-base.module");
const conversations_module_1 = require("./modules/conversations/conversations.module");
const maps_module_1 = require("./modules/maps/maps.module");
const request_id_middleware_1 = require("./shared/http/request-id.middleware");
const api_response_interceptor_1 = require("./shared/http/api-response.interceptor");
const http_exception_filter_1 = require("./shared/http/http-exception.filter");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60_000,
                    limit: 30,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            knowledge_base_module_1.KnowledgeBaseModule,
            conversations_module_1.ConversationsModule,
            maps_module_1.MapsModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: api_response_interceptor_1.ApiResponseInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map