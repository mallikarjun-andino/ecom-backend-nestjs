import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export const TransactionManager = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): EntityManager => {
    // eslint-disable-next-line
    const request: any = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!request.queryRunner?.manager) {
      throw new Error(
        'EntityManager must be provided in transactional context',
      );
    }
    // eslint-disable-next-line
    return request.queryRunner.manager;
  },
);
