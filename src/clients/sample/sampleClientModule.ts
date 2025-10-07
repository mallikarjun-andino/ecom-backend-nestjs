import { HttpModule, HttpService } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ICircuitHttpClient } from '../../shared';
import { createCircuitBreakerClient } from '../../shared/http/circuit.factory';
import { SAMPLE_HTTP_CLIENT } from '../clients.token';

import { SampleClient } from './sample.client';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('clients.sample.baseUrl'),
        timeout: configService.get<number>('clients.sample.timeout') ?? 10000,
        headers: { 'Content-Type': 'application/json' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    SampleClient,
    {
      provide: SAMPLE_HTTP_CLIENT,
      useFactory: (
        httpService: HttpService,
        configService: ConfigService,
      ): ICircuitHttpClient => {
        const logger = new Logger('SampleHttpClientCircuitBreaker');
        const breakerOptions = {
          timeout:
            configService.get<number>(
              'clients.sample.circuitBreaker.timeout',
            ) ?? 10000, // If our function takes longer than 10 seconds, trigger a failure
          errorThresholdPercentage:
            configService.get<number>(
              'clients.sample.circuitBreaker.errorThresholdPercentage',
            ) ?? 50, // When 50% of requests fail, trip the circuit
          resetTimeout:
            configService.get<number>(
              'clients.sample.circuitBreaker.resetTimeout',
            ) ?? 30000, // After 30 seconds, try again.
          rollingCountTimeout:
            configService.get<number>(
              'clients.sample.circuitBreaker.rollingCountTimeout',
            ) ?? 10000, // The duration of the statistical rolling window, in milliseconds. Default is 10000 (10 seconds).
          rollingCountBuckets:
            configService.get<number>(
              'clients.sample.circuitBreaker.rollingCountBuckets',
            ) ?? 10, // Number of buckets the rolling window is divided into. Default is 10.
          volumeThreshold:
            configService.get<number>(
              'clients.sample.circuitBreaker.volumeThreshold',
            ) ?? 5, // Minimum number of requests before tripping. Default is 5.
        };
        return createCircuitBreakerClient(httpService, breakerOptions, logger);
      },
      inject: [HttpService, ConfigService],
    },
  ],
  exports: [SampleClient],
})
export class SampleClientModule {}
