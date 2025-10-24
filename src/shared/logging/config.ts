import { ConfigService } from '@nestjs/config';
import { trace } from '@opentelemetry/api';
import { stdTimeFunctions } from 'pino';

import { errSerializer, reqSerializer, resSerializer } from './serializers';

/* eslint-disable  */
export function createPinoHttpConfig(configService: ConfigService) {
  const logLevel = configService.get<string>('logging.level') ?? 'debug';
  const appName =
    configService.get<string>('app.meta.name') ?? 'catalyst-nestjs';
  const logFormat = configService.get<string>('logging.format') ?? 'json';

  return {
    level: logLevel,
    base: {
      service: appName,
      pid: process.pid,
    },
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      log: (object) => {
        // Add OpenTelemetry trace context for non-HTTP flows
        // (HTTP requests are auto-instrumented by otel.bootstrap.ts)
        const span = trace.getActiveSpan();
        const traceContext: Record<string, string> = {};

        if (span) {
          const spanContext = span.spanContext();
          traceContext['trace_id'] = spanContext.traceId;
          traceContext['span_id'] = spanContext.spanId;
        }

        if (object.responseTime !== undefined) {
          return {
            ...object,
            ...traceContext,
            responseTime: `${object.responseTime}ms`,
          };
        }
        return {
          ...object,
          ...traceContext,
        };
      },
    },
    serializers: {
      req: reqSerializer,
      res: resSerializer,
      err: errSerializer,
      error: errSerializer,
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers.proxy-authorization',
        'req.headers.token',
        'req.headers.x-api-key',
        'res.headers["set-cookie"]',
        'password',
        'rut',
      ],
      censor: '[REDACTED]',
    },
    timestamp: () => stdTimeFunctions.isoTime(),
    ...(logFormat === 'pretty' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  };
}
