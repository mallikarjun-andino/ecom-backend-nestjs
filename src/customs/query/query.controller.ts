import { Controller, Get, Logger, Param } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Tenant, TenantContext, Transactional } from '../../shared';
import { TransactionManager } from '../../shared/database/transaction-manager.decorator';

import { QueryService } from './query.service';

@Controller('customs')
export class QueryController {
  private readonly logger = new Logger(QueryController.name);
  constructor(private readonly queryService: QueryService) {}

  @Transactional()
  @Get()
  async findAll(
    @Tenant() tenantContext: TenantContext,
    @TransactionManager() entityManager: EntityManager,
  ): Promise<string[]> {
    this.logger.log(
      `This action returns all customs for tenant ${tenantContext.businessUnit} ${tenantContext.countryCode}`,
    );
    return this.queryService.findAll(entityManager);
  }

  @Transactional()
  @Get(':id')
  async findOne(
    @Tenant() tenantContext: TenantContext,
    @TransactionManager() entityManager: EntityManager,
    @Param('id') id: number,
  ): Promise<string> {
    this.logger.log(
      `This action returns a custom with ID ${id} for tenant ${tenantContext.businessUnit} ${tenantContext.countryCode}`,
    );
    return this.queryService.findOne(id, entityManager);
  }
}
