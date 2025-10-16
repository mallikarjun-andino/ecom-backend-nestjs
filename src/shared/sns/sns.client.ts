import { SNSClient } from '@aws-sdk/client-sns';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SnsClientProvider {
  private client?: SNSClient;

  constructor(private readonly config?: ConfigService) {}

  getClient(): SNSClient {
    if (!this.client) {
      const region =
        this.config?.get<string>('aws.region') ??
        process.env.AWS_REGION ??
        'us-east-1';
      const useStatic = this.config?.get<boolean>(
        'aws.sns.useStaticCredentials',
      );
      const accessKeyId = this.config?.get<string>('aws.sns.accessKeyId');
      const secretAccessKey = this.config?.get<string>(
        'aws.sns.secretAccessKey',
      );
      const sessionToken = this.config?.get<string>('aws.sns.sessionToken');
      const endpoint = this.config?.get<string>('aws.sns.endpoint');

      // Prefer explicit credentials when configured; otherwise, default chain
      if (useStatic && accessKeyId && secretAccessKey) {
        this.client = new SNSClient({
          region,
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey,
            sessionToken,
          },
        });
      } else {
        this.client = new SNSClient({ region, endpoint });
      }
    }
    return this.client;
  }
}
