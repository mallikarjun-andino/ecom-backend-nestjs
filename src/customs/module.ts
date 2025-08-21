import { Module } from '@nestjs/common';

import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';

@Module({
  controllers: [QueryController],
  providers: [QueryService],
})
export class CustomsModule {
  // This module is responsible for handling customs-related commands.
  // It includes controllers and command handlers for creating packages.
}
