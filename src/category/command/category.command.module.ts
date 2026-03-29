import { Module } from '@nestjs/common';

import { CategoryCommandController } from './controller/category.command.controller';
import { CATEGORY_COMMAND_DAO } from './dao/category.command.dao.token';
import { CategoryCommandDao } from './dao/implementation/category.command.dao';
import { CategoryCommandService } from './service/category.command.service';

@Module({
  providers: [
    {
      provide: CATEGORY_COMMAND_DAO,
      useClass: CategoryCommandDao,
    },
    CategoryCommandService,
  ],

  controllers: [CategoryCommandController],
})
export class CategoryCommandModule {}
