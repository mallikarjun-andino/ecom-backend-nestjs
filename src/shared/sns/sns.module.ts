import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SnsClientProvider } from './sns.client';
import { SnsPublisherFactory } from './sns.publisher';

const SnsPublisherFactoryProvider = {
  provide: SnsPublisherFactory,
  useFactory: (clientProvider: SnsClientProvider): SnsPublisherFactory => {
    const client = clientProvider.getClient();
    return new SnsPublisherFactory(client);
  },
  inject: [SnsClientProvider],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SnsClientProvider, SnsPublisherFactoryProvider],
  exports: [SnsClientProvider, SnsPublisherFactoryProvider],
})
export class SnsModule {}
