import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './shared/prisma/prisma.module';

import { AuthModule } from './shared/auth/auth.module';

import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';

import { ConversationsModule } from './modules/conversations/conversations.module';

import { MapsModule } from './modules/maps/maps.module';

import { NotificationsModule } from './modules/notifications/notifications.module';

import { RequestIdMiddleware } from './shared/http/request-id.middleware';

import { ApiResponseInterceptor } from './shared/http/api-response.interceptor';

import { HttpExceptionFilter } from './shared/http/http-exception.filter';



@Module({

  imports: [

    ThrottlerModule.forRoot([

      {

        ttl: 60_000,

        limit: 30,

      },

    ]),

    ScheduleModule.forRoot(),

    PrismaModule,

    AuthModule,

    KnowledgeBaseModule,

    ConversationsModule,

    MapsModule,

    NotificationsModule,

  ],

  providers: [

    {

      provide: APP_INTERCEPTOR,

      useClass: ApiResponseInterceptor,

    },

    {

      provide: APP_FILTER,

      useClass: HttpExceptionFilter,

    },

    {

      provide: APP_GUARD,

      useClass: ThrottlerGuard,

    },

  ],

})

export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer): void {

    consumer.apply(RequestIdMiddleware).forRoutes('*');

  }

}

