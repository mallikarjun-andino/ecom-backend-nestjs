import { Module } from '@nestjs/common';

import { ProductCommandController } from './controller/product.commad.controller';
import { ProductCommandDao } from './dao/implementation/product.command.dao';
import { PRODUCT_COMMAND_DAO } from './dao/product.command.dao.token';
import { ProductCommandService } from './service/product.command.service';

@Module({
  providers: [
    {
      provide: PRODUCT_COMMAND_DAO,
      useClass: ProductCommandDao,
    },
    ProductCommandService,
  ],
  controllers: [ProductCommandController],
})
export class ProductCommandModule {}
