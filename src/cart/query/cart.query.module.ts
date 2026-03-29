import { Module } from '@nestjs/common';

import { CartQueryController } from './controller/cart.query.controller';
import { CART_QUERY_DAO } from './dao/cart.query.dao.token';
import { CartQueryDao } from './dao/implementation/cart.query.dao';
import { CartQueryService } from './service/cart.query.service';

@Module({
  providers: [
    {
      provide: CART_QUERY_DAO,
      useClass: CartQueryDao,
    },
    CartQueryService,
  ],
  controllers: [CartQueryController],
})
export class CartQueryModule {}
