import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { RequestInterceptor } from '@shared';
import { MigrationService } from '@shared/database/migrations/migration.service';
import { TenantContextMiddleware } from '@shared/kernel/tenant/tenant-context.middleware';
import {
  AppConfig,
  createPinoHttpConfig,
  LoggingConfig,
} from '@shared/logging/config';

import { ActuatorModule } from './actuator/actuator.module';
import { AddressModule } from './address/address.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsModule } from './aws.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cartItem.module';
import { CategoryModule } from './category/category.module';
import { AppConfigModule } from './config.module';
import { ContractFirstModule } from './contract-first/module';
import { CustomsModule } from './customs/module';
import { DemoModule } from './demo/demo.module';
// eslint-disable-next-line import/namespace
import { SampleSqsListenerModule } from './examples/sqs-listener.module.sample';
import { FavouritesModule } from './favourites/favourites.module';
import { ProductModule } from './product/product.module';
import { SharedModule } from './shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AppConfigModule,
    CustomsModule,
    SharedModule,
    LoggerModule.forRootAsync({
      useFactory: (loggingConfig: LoggingConfig, appConfig: AppConfig) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        pinoHttp: createPinoHttpConfig(loggingConfig, appConfig),
      }),
      inject: [LoggingConfig, AppConfig],
    }),
    ActuatorModule,
    DemoModule,
    SampleSqsListenerModule,
    ContractFirstModule,
    AwsModule,
    UserModule,
    ProductModule,
    CategoryModule,
    CartModule,
    CartItemModule,
    AddressModule,
    FavouritesModule,
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
