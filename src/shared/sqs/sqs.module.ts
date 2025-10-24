import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatasourceManager } from '../database/datasource.manager';

import { SqsClientProvider } from './sqs.client';
import { SqsListenerFactory, SqsListenerOptions } from './sqs.listener';

const SqsListenerFactoryProvider = {
  provide: SqsListenerFactory,
  useFactory: (
    clientProvider: SqsClientProvider,
    config: ConfigService,
    datasourceManager: DatasourceManager,
  ): SqsListenerFactory => {
    const defaults: SqsListenerOptions = {
      waitTimeSeconds: config.get<number>('aws.sqs.defaultWaitTimeSeconds', 20),
      maxNumberOfMessages: config.get<number>(
        'aws.sqs.defaultMaxNumberOfMessages',
        10,
      ),
      visibilityTimeout: config.get<number>(
        'aws.sqs.defaultVisibilityTimeout',
        30,
      ),
      concurrency: 1,
      validate: true,
      onInvalid: 'dlq',
    };
    const client = clientProvider.getClient();
    return new SqsListenerFactory(client, defaults, datasourceManager);
  },
  inject: [SqsClientProvider, ConfigService, DatasourceManager],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SqsClientProvider, SqsListenerFactoryProvider],
  exports: [SqsClientProvider, SqsListenerFactoryProvider],
})
export class SqsModule {}
