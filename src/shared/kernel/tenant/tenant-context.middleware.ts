import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { TenantContext } from './tenant-context';

interface TenantRequest extends Request {
  tenantContext?: TenantContext;
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction): void {
    const businessUnit =
      req.headers['x-business-unit'] ?? req.headers['business-unit'];
    const countryCode =
      req.headers['x-country-code'] ?? req.headers['country-code'];
    req.tenantContext = {
      businessUnit,
      countryCode,
    } as TenantContext;
    next();
  }
}
