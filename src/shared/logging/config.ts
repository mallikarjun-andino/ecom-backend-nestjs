import * as os from 'os';

import { errSerializer, reqSerializer, resSerializer } from './serializers';

/* eslint-disable */
export const pinoHttp = {
  level: process.env.LOG_LEVEL ?? 'debug',
  base: {
    service: process.env.APP_NAME ?? 'catalyst-nestjs',
    pid: process.pid,
    hostname: process.env.HOSTNAME ?? os.hostname(),
  },
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
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
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  ...(process.env.LOG_FORMAT === 'pretty' && {
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
