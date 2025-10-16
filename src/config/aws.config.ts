import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION ?? 'us-east-1',
  sns: {
    useStaticCredentials:
      (process.env.SNS_USE_STATIC_CREDENTIALS ?? '').toLowerCase() === 'true' ||
      (!!process.env.SNS_ACCESS_KEY_ID && !!process.env.SNS_SECRET_ACCESS_KEY),
    accessKeyId: process.env.SNS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SNS_SECRET_ACCESS_KEY,
    sessionToken: process.env.SNS_SESSION_TOKEN,
    endpoint: process.env.SNS_ENDPOINT,
  },
}));
