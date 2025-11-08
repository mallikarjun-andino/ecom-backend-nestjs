import { SQSClient } from '@aws-sdk/client-sqs';
import { Global, Module } from '@nestjs/common';

import { SqsClientProvider } from '@shared';

import { COMMON_SQS_CLIENT } from './constants/tokens';

@Global()
@Module({
  providers: [
    SqsClientProvider,
    {
      provide: COMMON_SQS_CLIENT,
      useFactory: (sqsClientProvider: SqsClientProvider): SQSClient =>
        sqsClientProvider.getClient(),
      inject: [SqsClientProvider],
    },
  ],
  exports: [COMMON_SQS_CLIENT],
})
export class AwsModule {}
