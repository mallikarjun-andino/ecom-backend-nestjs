import { Inject } from '@nestjs/common';

import { sqsListenerToken } from './sqs.tokens';

export function SqsListenerClientFromConfig(
  configPath: string,
): ParameterDecorator {
  return Inject(sqsListenerToken(configPath));
}
