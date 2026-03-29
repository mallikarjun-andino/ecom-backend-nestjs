import { Module } from '@nestjs/common';

import { CartItemCommandController } from './controller/cartItem.command.contoller';
import { CART_ITEM_COMMAND_DAO } from './dao/cartItem.command.dao.token';
import { CartItemCommandDao } from './dao/implementation/cartItem.command.dao';
import { CartItemCommandService } from './service/cartItem.command.service';

@Module({
  providers: [
    {
      provide: CART_ITEM_COMMAND_DAO,
      useClass: CartItemCommandDao,
    },
    CartItemCommandService,
  ],
  controllers: [CartItemCommandController],
})
export class CartItemCommandModule {}
