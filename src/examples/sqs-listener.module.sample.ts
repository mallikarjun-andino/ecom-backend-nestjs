import { SQSClient } from '@aws-sdk/client-sqs';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcknowledgementMode,
  SqsMessageListenerContainer,
} from '@snow-tzu/nest-sqs-listener';

import { COMMON_SQS_CLIENT } from '../constants/tokens';

import { Constants, SAMPLE_CONTAINER } from './constants';
import { SampleEvent } from './sample.event';
import { SampleSqsConsumer } from './sqs-listener.sample';

@Module({
  providers: [
    SampleSqsConsumer,
    {
      provide: SAMPLE_CONTAINER,
      useFactory: (
        configService: ConfigService,
        listener: SampleSqsConsumer,
        sqsClient: SQSClient,
      ): SqsMessageListenerContainer<SampleEvent> => {
        const logger = new Logger('SampleContainer');
        logger.log('Creating sample event Container');

        const container = new SqsMessageListenerContainer<SampleEvent>(
          sqsClient,
        );

        container.configure((options) => {
          options
            .queueNames(
              configService.get(Constants.queueConfigPath) ?? 'dummy-queue',
            )
            .pollTimeout(20)
            .autoStartup(true)
            .acknowledgementMode(AcknowledgementMode.ON_SUCCESS)
            .maxConcurrentMessages(10)
            .maxMessagesPerPoll(10);
        });
        container.setMessageListener(listener);

        container.setId('SampleEventListener');
        logger.log('Sample Event Container configured successfully');
        return container;
      },
      inject: [ConfigService, SampleSqsConsumer, COMMON_SQS_CLIENT],
    },
  ],
  exports: [SAMPLE_CONTAINER],
})
export class SampleSqsListenerModule {}
