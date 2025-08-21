import { stdSerializers } from 'pino';

/* eslint-disable */
export function reqSerializer(req: any) {
  return {
    id: req.id,
    method: req.method,
    url: req.url,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent'],
      'content-length': req.headers['content-length'],
      'content-type': req.headers['content-type'],
    },
    remoteAddress: req.remoteAddress,
    remotePort: req.remotePort,
  };
}

export function resSerializer(res: any) {
  return {
    statusCode: res.statusCode,
    headers: res.getHeaders
      ? res.getHeaders()
      : {
          'content-type': res._headers
            ? res._headers['content-type']
            : undefined,
          'content-length': res._headers
            ? res._headers['content-length']
            : undefined,
        },
  };
}

export function errSerializer(err: any) {
  return stdSerializers.err(err);
}
