import { Module } from '@nestjs/common';

import { SqsQueuesModule } from '@shared';

import { Constants } from './constants';
import { SampleSqsConsumer } from './sqs-listener.sample';

@Module({
  imports: [
    SqsQueuesModule.registerQueuesFromConfig([
      { path: Constants.queueConfigPath },
    ]),
  ],
  providers: [SampleSqsConsumer],
})
export class SampleSqsListenerModule {}
