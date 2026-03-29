import { Module } from '@nestjs/common';

import { CategoryQueryController } from './controlller/category.query.controller';
import { CATEGORY_QUERY_DAO } from './dao/category.query.dao.token';
import { CategoryQuerryDao } from './dao/implementation/category.querry.dao';
import { CategoryQueryService } from './service/category.query.service';

@Module({
  providers: [
    {
      provide: CATEGORY_QUERY_DAO,
      useClass: CategoryQuerryDao,
    },
    CategoryQueryService,
  ],
  controllers: [CategoryQueryController],
})
export class CategoryQueryModule {}
