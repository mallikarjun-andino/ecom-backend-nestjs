import { Module } from '@nestjs/common';

import { CategoryCommandModule } from './command/category.command.module';
import { CategoryQueryModule } from './query/category.query.module';

@Module({
  imports: [CategoryQueryModule, CategoryCommandModule],
  exports: [CategoryQueryModule, CategoryCommandModule],
})
export class CategoryModule {}
