import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

import { ISqsListener, SqsListenerClientFromConfig } from '@shared';

import { Constants } from './constants';

export class SampleEvent {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsISO8601()
  at!: string;
}

@Injectable()
export class SampleSqsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(SampleSqsConsumer.name);
  constructor(
    @SqsListenerClientFromConfig(Constants.queueConfigPath)
    private readonly listener: ISqsListener,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Starting SQS listener for SampleEvent');
    this.listener.subscribe(SampleEvent, async (msg, attrs) => {
      this.logger.log(
        `Received message: ${JSON.stringify(msg)} with attributes: ${JSON.stringify(attrs)}`,
      );
    });
    await this.listener.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.listener.stop();
  }
}
