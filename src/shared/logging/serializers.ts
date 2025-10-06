import { stdSerializers } from 'pino';

/* eslint-disable */
export function reqSerializer(req: any) {
  const tenantContext = {
    businessUnit: req.headers['x-business-unit'],
    countryCode: req.headers['x-country-code'],
  };
  return {
    id: req.id,
    ...tenantContext,
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
