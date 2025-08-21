import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { TenantContext } from './tenant-context';

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | null => {
    const request: any = ctx.switchToHttp().getRequest();

    const businessUnit: string | undefined =
      request.headers['x-business-unit'] ?? request.headers['business-unit'];
    const countryCode: string | undefined =
      request.headers['x-country-code'] ?? request.headers['country-code'];

    if (businessUnit && countryCode) {
      request.tenantContext = {
        businessUnit,
        countryCode,
      };
      return {
        businessUnit,
        countryCode,
      };
    }
    return null;
  },
);
