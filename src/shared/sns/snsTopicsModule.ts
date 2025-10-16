import { DynamicModule } from '@nestjs/common';

import { SnsModule } from '@shared/sns/sns.module';
import { SnsPublisherFactory } from '@shared/sns/sns.publisher';
import { snsPublisherToken } from '@shared/sns/sns.tokens';

export class SnsTopicsModule {
  static registerTopics(topics: string[]): DynamicModule {
    const topicProviders = topics.map((t) => ({
      provide: snsPublisherToken(t),
      useFactory: (factory: SnsPublisherFactory) => factory.forTopic(t),
      inject: [SnsPublisherFactory],
    }));
    return {
      module: SnsTopicsModule,
      imports: [SnsModule],
      providers: [...topicProviders],
      exports: [...topicProviders],
    };
  }
}
