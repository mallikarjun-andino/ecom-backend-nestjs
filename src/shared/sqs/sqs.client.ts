import { SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqsClientProvider {
  private client?: SQSClient;

  constructor(private readonly config?: ConfigService) {}

  getClient(): SQSClient {
    if (!this.client) {
      const region =
        this.config?.get<string>('aws.region') ??
        process.env.AWS_REGION ??
        'us-east-1';
      const useStatic = this.config?.get<boolean>(
        'aws.sqs.useStaticCredentials',
      );
      const accessKeyId = this.config?.get<string>('aws.sqs.accessKeyId');
      const secretAccessKey = this.config?.get<string>(
        'aws.sqs.secretAccessKey',
      );
      const sessionToken = this.config?.get<string>('aws.sqs.sessionToken');
      const endpoint = this.config?.get<string>('aws.sqs.endpoint');

      if (useStatic && accessKeyId && secretAccessKey) {
        this.client = new SQSClient({
          region,
          endpoint,
          credentials: { accessKeyId, secretAccessKey, sessionToken },
        });
      } else {
        this.client = new SQSClient({ region, endpoint });
      }
    }
    return this.client;
  }
}
