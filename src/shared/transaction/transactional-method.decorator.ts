import { Logger } from '@nestjs/common';

import { DatasourceManager } from '../database/datasource.manager';
import { TenantContext } from '../kernel/tenant/tenant-context';

import { TransactionContext } from './transaction-context';

/* eslint-disable */
function getTenantContext(instance: any, logger: Logger): TenantContext {
  logger.debug('Attempting to get tenant context', {
    hasRequest: !!instance.request,
    requestKeys: instance.request
      ? Object.keys(instance.request).slice(0, 10)
      : [],
    hasTenantContext: !!instance.request?.tenantContext,
    headers: instance.request?.headers
      ? {
          'x-business-unit': instance.request.headers['x-business-unit'],
          'x-country-code': instance.request.headers['x-country-code'],
          'business-unit': instance.request.headers['business-unit'],
          'country-code': instance.request.headers['country-code'],
        }
      : 'No headers',
  });

  // First, try to get from the tenantContext property set by middleware
  let tenantContext = instance.request?.tenantContext;

  // If not found, try to extract directly from headers
  if (!tenantContext && instance.request?.headers) {
    const businessUnit =
      instance.request.headers['x-business-unit'] ??
      instance.request.headers['business-unit'];
    const countryCode =
      instance.request.headers['x-country-code'] ??
      instance.request.headers['country-code'];

    if (businessUnit && countryCode) {
      logger.debug('Extracting tenant context from headers directly');
      tenantContext = { businessUnit, countryCode } as TenantContext;
      // Set it on the request for future use
      instance.request.tenantContext = tenantContext;
    }
  }

  if (!tenantContext) {
    logger.error('Missing tenant context for transactional operation', {
      hasRequest: !!instance.request,
      requestType: instance.request?.constructor?.name,
      availableProperties: instance.request
        ? Object.keys(instance.request).slice(0, 20)
        : [],
      headers: instance.request?.headers || 'No headers',
    });
    throw new Error(
      'Missing tenant context for transactional operation. Ensure x-business-unit and x-country-code headers are provided.',
    );
  }

  logger.debug('Successfully retrieved tenant context', tenantContext);
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
