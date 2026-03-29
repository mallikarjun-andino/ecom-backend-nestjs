import { Module } from '@nestjs/common';

import { CartItemQueryController } from './controller/cartItem.query.controller';
import { CART_ITEM_QUERY_DAO } from './dao/cartItem.query.dao.token';
import { CartItemQueryDao } from './dao/implementation/cartItem.query.dao';
import { CartItemQueryService } from './service/cartItem.query.service';

@Module({
  providers: [
    {
      provide: CART_ITEM_QUERY_DAO,
      useClass: CartItemQueryDao,
    },
    CartItemQueryService,
  ],
  controllers: [CartItemQueryController],
})
export class CartItemQueryModule {}
