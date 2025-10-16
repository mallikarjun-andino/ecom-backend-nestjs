import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { TenantContext } from './tenant-context';

interface TenantRequest extends FastifyRequest {
  tenantContext?: TenantContext;
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  use(req: TenantRequest, res: FastifyReply, next: () => void): void {
    const businessUnit =
      req.headers['x-business-unit'] ?? req.headers['business-unit'];
    const countryCode =
      req.headers['x-country-code'] ?? req.headers['country-code'];

    this.logger.debug('Setting tenant context', {
      businessUnit,
      countryCode,
      allHeaders: Object.keys(req.headers),
      url: req.url,
    });

    if (businessUnit && countryCode) {
      req.tenantContext = {
        businessUnit,
        countryCode,
      } as TenantContext;
      this.logger.debug('Tenant context set successfully');
    } else {
      this.logger.warn('Missing required tenant headers', {
        businessUnit,
        countryCode,
        availableHeaders: Object.keys(req.headers),
      });
    }

    next();
  }
}
