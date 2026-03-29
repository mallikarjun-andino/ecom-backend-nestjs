import { Module } from '@nestjs/common';

import { UserQueryController } from './controllers/user.querry.controller';
import { UserQuerryDao } from './dao/implementation/user.querry.dao';
import { USER_QUERY_DAO } from './dao/user.querry.dao.token';
import { UserQueryService } from './services/user.querry.service';

@Module({
  providers: [
    {
      provide: USER_QUERY_DAO,
      useClass: UserQuerryDao,
    },
    UserQueryService,
  ],
  controllers: [UserQueryController],
})
export class UserQueryModule {}
