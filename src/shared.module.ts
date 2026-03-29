import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { loadEnvConfig } from '@shared/config/config.loader';
import { TENANT_CONFIG_PROVIDER } from '@shared/database/interfaces/tenant-config-provider';
import { DatabaseConnectionsConfig } from '@shared/database/providers/database.connnection.config';
import { EnvTenantConfigProvider } from '@shared/database/providers/env-tenant-config.provider';
import { CustomExceptionFilter } from '@shared/filters/custom.exception.filter';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadEnvConfig('database')],
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: TENANT_CONFIG_PROVIDER,
      useFactory: (
        databaseConnectionsConfig: DatabaseConnectionsConfig,
        configService: ConfigService,
      ): EnvTenantConfigProvider =>
        new EnvTenantConfigProvider(databaseConnectionsConfig, configService),
      inject: [DatabaseConnectionsConfig, ConfigService],
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
  exports: [TENANT_CONFIG_PROVIDER],
})
export class SharedModule {}
