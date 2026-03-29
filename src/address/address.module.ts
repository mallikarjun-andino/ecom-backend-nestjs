import { Module } from '@nestjs/common';

import { AddressCommandModule } from './command/address.command.module';
import { AddressQueryModule } from './query/address.query.module';

@Module({
  imports: [AddressCommandModule, AddressQueryModule],
  exports: [AddressCommandModule, AddressQueryModule],
})
export class AddressModule {}
