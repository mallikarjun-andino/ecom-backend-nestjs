// address.query.module.ts
import { Module } from '@nestjs/common';

import { AddressQueryController } from './controller/address.query.controller';
import { ADDRESS_QUERY_DAO } from './dao/address.query.dao.token';
import { AddressQueryDao } from './dao/implementation/address.query.dao';
import { AddressQueryService } from './service/address.query.service';

@Module({
  providers: [
    {
      provide: ADDRESS_QUERY_DAO,
      useClass: AddressQueryDao,
    },
    AddressQueryService,
  ],
  controllers: [AddressQueryController],
})
export class AddressQueryModule {}
