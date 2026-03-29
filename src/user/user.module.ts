import { Module } from '@nestjs/common';

import { UserCommandModule } from './command/command.module';
import { UserQueryModule } from './querry/querry.module';

@Module({
  imports: [UserCommandModule, UserQueryModule],
  exports: [UserCommandModule, UserQueryModule],
})
export class UserModule {}
