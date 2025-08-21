import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { ActuatorModule } from './actuator/actuator.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomsModule } from './customs/module';
import { DataModule } from './data.module';
import { TransactionalInterceptor } from './shared';
import { MigrationService } from './shared/database/migrations/migration.service';
import { TenantContextMiddleware } from './shared/kernel/tenant/tenant-context.middleware';
import { pinoHttp } from './shared/logging/config';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    CustomsModule,
    SharedModule,
    LoggerModule.forRoot({
      pinoHttp,
    }),
    ActuatorModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionalInterceptor,
    },
    MigrationService,
    Reflector,
  ],
  exports: [MigrationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
