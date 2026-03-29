import { Module } from '@nestjs/common';

import { ProductQueryController } from './controller/product.query.controller';
import { ProductQueryDao } from './dao/implementation/product.query.dao';
import { PRODUCT_QUERY_DAO } from './dao/product.querry.dao.token';
import { ProductQueryService } from './service/product.query.service';

@Module({
  providers: [
    {
      provide: PRODUCT_QUERY_DAO,
      useClass: ProductQueryDao,
    },
    ProductQueryService,
  ],
  controllers: [ProductQueryController],
})
export class ProductQueryModule {}
