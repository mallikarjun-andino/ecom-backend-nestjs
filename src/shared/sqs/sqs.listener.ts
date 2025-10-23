import {
  DeleteMessageCommand,
  GetQueueUrlCommand,
  Message as SqsMessage,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Logger } from '@nestjs/common';
import {
  context as otContext,
  propagation,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

export type SqsMessageAttributes = Record<string, string>;
export type ClassType<T> = { new (...args: any[]): T };

export interface ISqsListener {
  subscribe<T>(
    type: ClassType<T> | undefined,
    handler: (
      body: T,
      attrs: SqsMessageAttributes,
      raw: SqsMessage,
    ) => Promise<void>,
  ): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface SqsListenerOptions {
  waitTimeSeconds?: number;
  maxNumberOfMessages?: number;
  visibilityTimeout?: number;
  concurrency?: number;
  validate?: boolean;
  onInvalid?: 'dlq' | 'drop';
}

function isQueueUrl(nameOrUrl: string): boolean {
  return nameOrUrl.startsWith('https://');
}

function toAttrRecord(
  attrs?: SqsMessage['MessageAttributes'],
): SqsMessageAttributes {
  const out: Record<string, string> = {};
  if (!attrs) {
    return out;
  }
  for (const [k, v] of Object.entries(attrs)) {
    const s =
      v?.StringValue ??
      (v?.BinaryValue
        ? Buffer.from(v.BinaryValue as any).toString('utf8')
        : undefined);
    if (s !== undefined) {
      out[k] = String(s);
    }
  }
  return out;
}

const getter = {
  keys: (carrier: Record<string, string>) => Object.keys(carrier),
  get: (carrier: Record<string, string>, key: string) => carrier[key],
};

class InvalidMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMessageError';
  }
}

function formatValidationErrors(errors: ValidationError[]): string {
  const recurse = (err: ValidationError, path: string[]): string[] => {
    const key = [...path, err.property].filter(Boolean).join('.');
    const current = err.constraints
      ? Object.values(err.constraints).map((c) => `${key}: ${c}`)
      : [];
    const children = (err.children ?? []).flatMap((ch) =>
      recurse(ch, [...path, err.property]),
    );
    return [...current, ...children];
  };
  return errors.flatMap((e) => recurse(e, [])).join('; ');
}

export class SqsListener implements ISqsListener {
  private readonly logger = new Logger(SqsListener.name);
  private readonly queue: string;
  private queueUrl?: string;
  private handler?: (
    body: any,
    attrs: SqsMessageAttributes,
    raw: SqsMessage,
  ) => Promise<void>;
  private type?: ClassType<any>;
  private running = false;
  private pollers: Promise<void>[] = [];

  constructor(
    private readonly client: SQSClient,
    queueUrlOrName: string,
    private readonly options: SqsListenerOptions,
  ) {
    this.queue = queueUrlOrName;
  }

  subscribe<T>(
    type: ClassType<T> | undefined,
    handler: (
      body: T,
      attrs: SqsMessageAttributes,
      raw: SqsMessage,
    ) => Promise<void>,
  ): void {
    this.type = type;
    this.handler = handler;
  }

  async start(): Promise<void> {
    if (!this.handler) {
      throw new Error('No handler registered via subscribe()');
    }
    this.running = true;
    this.queueUrl = await this.resolveQueueUrl();
    const concurrency = Math.max(1, this.options.concurrency ?? 1);
    this.logger.log(
      `Starting SQS listener for ${this.queueUrl} with concurrency ${concurrency}`,
    );
    for (let i = 0; i < concurrency; i++) {
      this.pollers.push(this.pollLoop());
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    await Promise.allSettled(this.pollers);
    this.pollers = [];
  }

  private async resolveQueueUrl(): Promise<string> {
    if (isQueueUrl(this.queue)) {
      return this.queue;
    }
    const res = await this.client.send(
      new GetQueueUrlCommand({ QueueName: this.queue }),
    );
    if (!res.QueueUrl) {
      throw new Error(`Unable to resolve queue URL for ${this.queue}`);
    }
    return res.QueueUrl;
  }

  private async pollLoop(): Promise<void> {
    const waitTimeSeconds = this.options.waitTimeSeconds ?? 20;
    const maxNumberOfMessages = this.options.maxNumberOfMessages ?? 10;
    const visibilityTimeout = this.options.visibilityTimeout;

    while (this.running) {
      try {
        const resp = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: maxNumberOfMessages,
            WaitTimeSeconds: waitTimeSeconds,
            VisibilityTimeout: visibilityTimeout,
            MessageAttributeNames: ['All'],
          }),
        );
        const messages = resp.Messages ?? [];
        for (const m of messages) {
          await this.handleOne(m);
        }
      } catch (err) {
        this.logger.error(`SQS poll error`, err);
      }
    }
  }

  private async handleOne(m: SqsMessage): Promise<void> {
    const attrs = toAttrRecord(m.MessageAttributes);
    const tracer = trace.getTracer('sqs-listener');
    let ctx = otContext.active();

    if (attrs.traceparent) {
      ctx = propagation.extract(ctx, attrs, getter as any);
    }

    const span = tracer.startSpan('sqs.consume', undefined, ctx);
    try {
      // Parse body
      const body: any = m.Body ? JSON.parse(m.Body) : undefined;

      const typed = this.type
        ? plainToInstance(this.type, body, { enableImplicitConversion: true })
        : body;

      const shouldValidate = !!this.type && (this.options.validate ?? true);
      if (shouldValidate) {
        const errors = validateSync(typed as object, {
          whitelist: true,
          forbidNonWhitelisted: false,
        });
        if (errors.length > 0) {
          throw new InvalidMessageError(
            `Validation failed: ${formatValidationErrors(errors)}`,
          );
        }
      }

      await otContext.with(trace.setSpan(ctx, span), async () => {
        await this.handler?.(typed, attrs, m);
      });

      if (m.ReceiptHandle && this.queueUrl) {
        await this.client.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: m.ReceiptHandle,
          }),
        );
      }
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      this.logger.error(
        `SQS message handling error for message ${JSON.stringify(m.Body)}`,
        (err as Error).stack,
      );

      // For invalid messages, optionally drop to avoid poison-pill retries
      if (
        err instanceof InvalidMessageError &&
        this.options.onInvalid === 'drop' &&
        m.ReceiptHandle &&
        this.queueUrl
      ) {
        await this.client.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: m.ReceiptHandle,
          }),
        );
        this.logger.warn('Dropped invalid SQS message');
      }
    } finally {
      span.end();
    }
  }
}

export class SqsListenerFactory {
  constructor(
    private readonly client: SQSClient,
    private readonly defaults: SqsListenerOptions,
  ) {}
  forQueue(queueUrlOrName: string, options?: SqsListenerOptions): ISqsListener {
    const opts: SqsListenerOptions = { ...this.defaults, ...(options ?? {}) };
    return new SqsListener(this.client, queueUrlOrName, opts);
  }
}
