import { Logger } from '@nestjs/common';

import { DatasourceManager } from '../database/datasource.manager';
import { TenantContext } from '../kernel/tenant/tenant-context';

import { TransactionContext } from './transaction-context';

/* eslint-disable */
function getTenantContext(instance: any, logger: Logger): TenantContext {
  const tenantContext = instance.request?.tenantContext;
  if (!tenantContext) {
    logger.error('Missing tenant context for transactional operation');
    throw new Error('Missing tenant context for transactional operation');
  }
  return tenantContext;
}

function getDatasourceManager(
  instance: any,
  logger: Logger,
): DatasourceManager {
  const datasourceManager: DatasourceManager =
    instance.datasourceManager || instance.dataSourceManager;
  if (!datasourceManager) {
    logger.error('DatasourceManager not found on service instance');
    throw new Error('DatasourceManager not found on service instance');
  }
  return datasourceManager;
}

function injectEntityManagerIfNeeded(
  target: any,
  propertyKey: string,
  args: any[],
  entityManager: any,
) {
  const paramTypes =
    Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
  const entityManagerIndex = paramTypes.findIndex(
    (t: any) => t && t.name === 'EntityManager',
  );
  if (entityManagerIndex !== -1) {
    args[entityManagerIndex] = entityManager;
  }
}

async function setupQueryRunner(
  datasourceManager: DatasourceManager,
  tenantContext: TenantContext,
) {
  const dataSource = await datasourceManager.getDataSource(
    tenantContext.businessUnit,
    tenantContext.countryCode,
  );
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.query(`SET search_path TO ${tenantContext.countryCode}`);
  await queryRunner.startTransaction();
  return queryRunner;
}

async function executeInTransaction(
  logger: Logger,
  queryRunner: any,
  transactionContext: typeof TransactionContext,
  originalMethod: Function,
  instance: any,
  args: any[],
  target: any,
  propertyKey: string,
) {
  try {
    injectEntityManagerIfNeeded(target, propertyKey, args, queryRunner.manager);
    const result = await transactionContext.run(
      queryRunner.manager,
      async () => {
        return await originalMethod.apply(instance, args);
      },
    );
    await queryRunner.commitTransaction();
    logger.debug('Transaction committed successfully');
    return result;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    logger.error('Transaction rolled back due to error', err);
    throw err;
  } finally {
    await queryRunner.release();
    logger.debug('QueryRunner released');
  }
}

export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const logger = new Logger('TransactionalAnnotation');
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('Transactional decorator can only be applied to methods');
    }
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const tenantContext = getTenantContext(this, logger);
      const datasourceManager = getDatasourceManager(this, logger);
      const queryRunner = await setupQueryRunner(
        datasourceManager,
        tenantContext,
      );
      return executeInTransaction(
        logger,
        queryRunner,
        TransactionContext,
        originalMethod,
        this,
        args,
        target,
        propertyKey,
      );
    };
  };
}
