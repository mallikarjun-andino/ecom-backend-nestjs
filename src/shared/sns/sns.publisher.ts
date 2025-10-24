import {
  CreateTopicCommand,
  PublishCommand,
  SNSClient,
} from '@aws-sdk/client-sns';
import { Logger } from '@nestjs/common';
import {
  context as otContext,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

import { TenantContextStorage } from '../kernel/tenant/tenant-context.storage';
import {
  TENANT_HEADER_BUSINESS_UNIT,
  TENANT_HEADER_COUNTRY_CODE,
  TENANT_PROPERTY_BUSINESS_UNIT,
  TENANT_PROPERTY_COUNTRY_CODE,
} from '../kernel/tenant/tenant.constants';

export type SnsMessageAttributes = Record<string, string>;

export interface ISnsPublisher {
  publish(payload: unknown, attributes?: SnsMessageAttributes): Promise<void>;
}

function isArn(topic: string): boolean {
  return topic.startsWith('arn:aws:sns:');
}

type MessageAttributes = Record<
  string,
  {
    DataType: 'String';
    StringValue: string;
  }
>;

function toMessageAttributes(
  attrs: Record<string, string> | undefined,
): MessageAttributes {
  const out: Record<string, { DataType: 'String'; StringValue: string }> = {};
  if (!attrs) {
    return out;
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) {
      continue;
    }
    out[k] = { DataType: 'String', StringValue: String(v) };
  }
  return out;
}

function getTraceAttributes(): Record<string, string> {
  const span = trace.getActiveSpan();
  if (!span) {
    return {} as Record<string, string>;
  }
  const sc = span.spanContext();
  const flagsHex = (sc.traceFlags ?? 1).toString(16).padStart(2, '0');
  const traceparent = `00-${sc.traceId}-${sc.spanId}-${flagsHex}`;
  return {
    traceId: sc.traceId,
    spanId: sc.spanId,
    traceFlags: flagsHex,
    traceparent,
  } as Record<string, string>;
}

function getTenantAttributes(): Record<string, string> {
  const tenantContext = TenantContextStorage.get();
  if (!tenantContext) {
    return {} as Record<string, string>;
  }
  return {
    [TENANT_HEADER_BUSINESS_UNIT]: tenantContext[TENANT_PROPERTY_BUSINESS_UNIT],
    [TENANT_HEADER_COUNTRY_CODE]: tenantContext[TENANT_PROPERTY_COUNTRY_CODE],
  } as Record<string, string>;
}

export class SnsPublisher implements ISnsPublisher {
  private readonly topic: string;
  private static nameToArnCache = new Map<string, string>();
  private readonly logger: Logger = new Logger(SnsPublisher.name);

  constructor(
    private readonly client: SNSClient,
    topicArnOrName: string,
  ) {
    this.topic = topicArnOrName;
  }

  private async resolveTopicArn(): Promise<string> {
    if (isArn(this.topic)) {
      return this.topic;
    }
    const cached = SnsPublisher.nameToArnCache.get(this.topic);
    if (cached) {
      return cached;
    }

    const created = await this.client.send(
      new CreateTopicCommand({ Name: this.topic }),
    );
    this.logger.debug('Created/Found SNS topic');
    if (!created.TopicArn) {
      throw new Error('Failed to resolve SNS TopicArn');
    }
    SnsPublisher.nameToArnCache.set(this.topic, created.TopicArn);
    return created.TopicArn;
  }

  async publish(
    payload: unknown,
    attributes?: SnsMessageAttributes,
  ): Promise<void> {
    const span = trace.getTracer('sns-publisher').startSpan('sns.publish');
    return await otContext.with(otContext.active(), async () => {
      try {
        const TopicArn = await this.resolveTopicArn();
        const traceAttributes = getTraceAttributes();
        const tenantAttributes = getTenantAttributes();
        const mergedAttrs = {
          ...traceAttributes,
          ...tenantAttributes,
          ...(attributes ?? {}),
        };
        const MessageAttributes = toMessageAttributes(mergedAttrs);
        const Message = JSON.stringify(payload);
        await this.client.send(
          new PublishCommand({ TopicArn, Message, MessageAttributes }),
        );
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw err;
      } finally {
        span.end();
      }
    });
  }
}

export class SnsPublisherFactory {
  constructor(private readonly client: SNSClient) {}
  forTopic(topicArnOrName: string): ISnsPublisher {
    return new SnsPublisher(this.client, topicArnOrName);
  }
}
