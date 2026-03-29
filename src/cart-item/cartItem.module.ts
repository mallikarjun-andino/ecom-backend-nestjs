import { Module } from '@nestjs/common';

import { CartItemCommandModule } from './command/cartItem.command.module';
import { CartItemQueryModule } from './query/cartItem.query.module';

@Module({
  imports: [CartItemCommandModule, CartItemQueryModule],
  exports: [CartItemCommandModule, CartItemQueryModule],
})
export class CartItemModule {}
