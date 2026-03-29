import { Module } from '@nestjs/common';

import { ProductCommandModule } from './command/command.module';
import { ProductQueryModule } from './query/query.module';

@Module({
  imports: [ProductCommandModule, ProductQueryModule],
  exports: [ProductCommandModule, ProductQueryModule],
})
export class ProductModule {}
