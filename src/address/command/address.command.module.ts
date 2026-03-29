// address.command.module.ts
import { Module } from '@nestjs/common';

import { AddressCommandController } from './controller/address.command.controller';
import { ADDRESS_COMMAND_DAO } from './dao/address.command.dao.token';
import { AddressCommandDao } from './dao/implementation/address.command.dao';
import { AddressCommandService } from './service/address.command.service';

@Module({
  providers: [
    {
      provide: ADDRESS_COMMAND_DAO,
      useClass: AddressCommandDao,
    },
    AddressCommandService,
  ],
  controllers: [AddressCommandController],
})
export class AddressCommandModule {}
