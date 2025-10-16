import { Module } from '@nestjs/common';

import { SnsTopicsModule } from '@shared';

import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';

@Module({
  imports: [SnsTopicsModule.registerTopics(['test-custom-events'])],
  controllers: [QueryController],
  providers: [QueryService],
})
export class CustomsModule {
  // This module is responsible for handling customs-related commands.
  // It includes controllers and command handlers for creating packages.
}
