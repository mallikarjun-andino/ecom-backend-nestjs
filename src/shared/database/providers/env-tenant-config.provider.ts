import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DatabaseConnectionsConfig } from '@shared/database/providers/database.connnection.config';

import { DatabaseConfig } from '../interfaces/tenant-config';
import { ITenantConfigProvider } from '../interfaces/tenant-config-provider';

@Injectable()
export class EnvTenantConfigProvider implements ITenantConfigProvider {
  constructor(
    private readonly databaseConnectionsConfig: DatabaseConnectionsConfig,
    private readonly configService: ConfigService,
  ) {}

  getConfigFor(
    businessUnit: string,
    countryCode: string,
  ): Promise<DatabaseConfig> {
    const key = this.buildKey(businessUnit, countryCode);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dbConfig = this.configService.get(`database.databases.${key}`);
    // eslint-disable-next-line no-console
    console.log(
      `Fetching database config : ${this.configService.get(`database`)}`,
    );
    if (!dbConfig) {
      return Promise.reject(
        new Error(`No database config found for key: ${key}`),
      );
    }
    return Promise.resolve(dbConfig as DatabaseConfig);
  }

  getAllConfigs(): Promise<DatabaseConfig[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dbConfigs = this.databaseConnectionsConfig.getConnections();
    if (!dbConfigs) {
      return Promise.reject(new Error('No database configs found'));
    }
    return Promise.resolve(dbConfigs as DatabaseConfig[]);
  }

  refresh?(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private buildKey(businessUnit: string, countryCode: string): string {
    return `${businessUnit.toLowerCase()}-${countryCode.toLowerCase()}`;
  }
}
