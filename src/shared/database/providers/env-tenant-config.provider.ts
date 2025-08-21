import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DatabaseConfig } from '../interfaces/tenant-config';
import { ITenantConfigProvider } from '../interfaces/tenant-config-provider';

@Injectable()
export class EnvTenantConfigProvider implements ITenantConfigProvider {
  constructor(private readonly configService: ConfigService) {}

  getConfigFor(
    businessUnit: string,
    countryCode: string,
  ): Promise<DatabaseConfig> {
    const key = this.buildKey(businessUnit, countryCode);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dbConfig = this.configService.get(`database.databases.${key}`);
    if (!dbConfig) {
      return Promise.reject(
        new Error(`No database config found for key: ${key}`),
      );
    }
    return Promise.resolve(this.convert(dbConfig));
  }

  getAllConfigs(): Promise<DatabaseConfig[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dbConfigs = this.configService.get('database.databases');
    if (!dbConfigs) {
      return Promise.reject(new Error('No database configs found'));
    }
    const configs: DatabaseConfig[] = Object.values(dbConfigs).map((config) =>
      this.convert(config),
    );
    return Promise.resolve(configs);
  }

  refresh?(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private buildKey(businessUnit: string, countryCode: string): string {
    return `${businessUnit.toLowerCase()}-${countryCode.toLowerCase()}`;
  }

  private convert(dbConfig): DatabaseConfig {
    /* eslint-disable */
    return {
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      schema: dbConfig.schema,
      isActive: dbConfig.isActive ?? true,
      connectionPoolConfig: {
        max: dbConfig.connectionPoolConfig?.max ?? 10,
        min: dbConfig.connectionPoolConfig?.min ?? 1,
        idleTimeoutMillis:
          dbConfig.connectionPoolConfig?.idleTimeoutMillis ?? 30000,
        connectionTimeoutMillis:
          dbConfig.connectionPoolConfig?.connectionTimeoutMillis ?? 2000,
      },
    } as DatabaseConfig;
  }
}
