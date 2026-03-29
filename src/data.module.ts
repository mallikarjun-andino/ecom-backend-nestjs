import { Global, Module } from '@nestjs/common';

import { DatasourceManager } from '@shared/database/datasource.manager';
import {
  ITenantConfigProvider,
  TENANT_CONFIG_PROVIDER,
} from '@shared/database/interfaces/tenant-config-provider';

import {
  Address,
  Cart,
  CartItem,
  Category,
  Favourites,
  Order,
  OrderItem,
  Product,
  User,
} from './common/entities';
import { Message } from './customs/query/message.entity';
import { SharedModule } from './shared.module';

@Global()
@Module({
  imports: [SharedModule],
  providers: [
    {
      provide: DatasourceManager,
      useFactory: (
        tenantConfigProvider: ITenantConfigProvider,
      ): DatasourceManager =>
        new DatasourceManager(tenantConfigProvider, [
          Message,
          Address,
          Cart,
          CartItem,
          Category,
          Favourites,
          Order,
          OrderItem,
          Product,
          User,
        ]),
      inject: [TENANT_CONFIG_PROVIDER],
    },
  ],
  exports: [DatasourceManager],
})
export class DataModule {}
