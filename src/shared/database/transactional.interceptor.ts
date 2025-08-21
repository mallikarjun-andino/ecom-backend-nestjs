import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, lastValueFrom, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TenantContext } from '../kernel/tenant/tenant-context';

import { DatasourceManager } from './datasource.manager';
import { TRANSACTIONAL_KEY } from './transactional.decorator';

@Injectable()
export class TransactionalInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionalInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly datasourceManager: DatasourceManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isTransactional = this.reflector.get<boolean>(
      TRANSACTIONAL_KEY,
      context.getHandler(),
    );
    if (!isTransactional) {
      return next.handle();
    }

    // eslint-disable-next-line
    const request: any = context.switchToHttp().getRequest();
    // eslint-disable-next-line
    const tenantContext: TenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new Error('Missing tenant context for transactional operation');
    }

    return from(
      this.datasourceManager.getDataSource(
        tenantContext.businessUnit,
        tenantContext.countryCode,
      ),
    ).pipe(
      switchMap(async (dataSource) => {
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.query(
          `SET search_path TO ${tenantContext.countryCode}`,
        );
        await queryRunner.startTransaction();
        // eslint-disable-next-line
        request.queryRunner = queryRunner;
        try {
          const result: unknown = await lastValueFrom(next.handle());
          await queryRunner.commitTransaction();
          return result;
        } catch (err) {
          await queryRunner.rollbackTransaction();
          this.logger.error('Transaction rolled back due to error', err);
          throw err;
        } finally {
          await queryRunner.release();
        }
      }),
    );
  }
}
