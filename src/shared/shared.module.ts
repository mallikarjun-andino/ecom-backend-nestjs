import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { loadEnvConfig } from '../config/config.loader';

import { TENANT_CONFIG_PROVIDER } from './database/interfaces/tenant-config-provider';
import { EnvTenantConfigProvider } from './database/providers/env-tenant-config.provider';
import { CustomExceptionFilter } from './filters/customExceptionFilter';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        loadEnvConfig('database'),
        loadEnvConfig('logging'),
        loadEnvConfig('app'),
      ],
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: TENANT_CONFIG_PROVIDER,
      useFactory: (configService: ConfigService): EnvTenantConfigProvider =>
        new EnvTenantConfigProvider(configService),
      inject: [ConfigService],
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
  exports: [TENANT_CONFIG_PROVIDER],
})
export class SharedModule {}
