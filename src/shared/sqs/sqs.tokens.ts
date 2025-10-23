export const SQS_LISTENER_PREFIX = 'SQS_LISTENER:';
export const sqsListenerToken = (key: string): string =>
  `${SQS_LISTENER_PREFIX}${key}`;
