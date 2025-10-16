export const SNS_PUBLISHER_PREFIX = 'SNS_PUBLISHER:';
export const snsPublisherToken = (topic: string): string =>
  `${SNS_PUBLISHER_PREFIX}${topic}`;
