import { Module } from '@nestjs/common';

import { CartCommandModule } from './command/cart.command.module';
import { CartQueryModule } from './query/cart.query.module';

@Module({
  imports: [CartCommandModule, CartQueryModule],
  exports: [CartCommandModule, CartQueryModule],
})
export class CartModule {}
