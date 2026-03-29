import { Module } from '@nestjs/common';

import { UserCommandController } from './controllers/user.command.controller';
import { UserCommandDao } from './dao/implementation/user.command.dao';
import { USER_COMMAND_DAO } from './dao/user.command.dao.token';
import { UserCommandService } from './services/user.command.service';

@Module({
  providers: [
    {
      provide: USER_COMMAND_DAO,
      useClass: UserCommandDao,
    },
    UserCommandService,
  ],
  controllers: [UserCommandController],
})
export class UserCommandModule {}
