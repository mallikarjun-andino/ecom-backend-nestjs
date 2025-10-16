import { Inject } from '@nestjs/common';

import { snsPublisherToken } from './sns.tokens';

export function SnsPublisherClient(topicArnOrName: string): ParameterDecorator {
  return Inject(snsPublisherToken(topicArnOrName));
}
