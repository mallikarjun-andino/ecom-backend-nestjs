import { Module } from '@nestjs/common';

import { CartCommandController } from './controller/cart.command.controller';
import { CART_COMMAND_DAO } from './dao/cart.command.dao.token';
import { CartCommandDao } from './dao/implementation/cart.command.dao';
import { CartCommandService } from './service/cart.command.service';

@Module({
  providers: [
    {
      provide: CART_COMMAND_DAO,
      useClass: CartCommandDao,
    },
    CartCommandService,
  ],
  controllers: [CartCommandController],
})
export class CartCommandModule {}
