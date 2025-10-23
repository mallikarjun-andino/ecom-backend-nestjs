import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ISqsListener,
  SqsListenerFactory,
  SqsListenerOptions,
} from '@shared/sqs/sqs.listener';
import { SqsModule } from '@shared/sqs/sqs.module';
import { sqsListenerToken } from '@shared/sqs/sqs.tokens';

export class SqsQueuesModule {
  static registerQueuesFromConfig(
    items: Array<{ path: string; options?: SqsListenerOptions }>,
  ): DynamicModule {
    const providers = items.map((i) => ({
      provide: sqsListenerToken(i.path),
      useFactory: (
        factory: SqsListenerFactory,
        config: import('@nestjs/config').ConfigService,
      ): ISqsListener => {
        const queueName = config.get<string>(i.path);
        if (!queueName) {
          throw new Error(
            `SQS queue name not found in config at path: ${i.path}`,
          );
        }
        return factory.forQueue(queueName, i.options);
      },
      inject: [SqsListenerFactory, ConfigService],
    }));
    return {
      module: SqsQueuesModule,
      imports: [SqsModule],
      providers: [...providers],
      exports: [...providers],
    };
  }
}
