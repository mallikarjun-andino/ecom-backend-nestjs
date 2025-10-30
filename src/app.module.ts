import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { RequestInterceptor } from '@shared';
import { MigrationService } from '@shared/database/migrations/migration.service';
import { TenantContextMiddleware } from '@shared/kernel/tenant/tenant-context.middleware';
import { createPinoHttpConfig } from '@shared/logging/config';
import { SharedModule } from '@shared/shared.module';

import { ActuatorModule } from './actuator/actuator.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractFirstModule } from './contract-first/module';
import { CustomsModule } from './customs/module';
import { DemoModule } from './demo/demo.module';
import { SampleSqsListenerModule } from './examples/sqs-listener.module.sample';

@Module({
  imports: [
    CustomsModule,
    SharedModule,
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        pinoHttp: createPinoHttpConfig(configService),
      }),
      inject: [ConfigService],
    }),
    ActuatorModule,
    DemoModule,
    SampleSqsListenerModule,
    ContractFirstModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
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
