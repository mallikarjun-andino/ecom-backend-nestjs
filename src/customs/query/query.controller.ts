import { Controller, Get, Logger, Param } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Transactional } from '../../shared';
import { TransactionManager } from '../../shared/database/transaction-manager.decorator';

import { QueryService } from './query.service';

@Controller('customs')
export class QueryController {
  private readonly logger = new Logger(QueryController.name);
  constructor(private readonly queryService: QueryService) {}

  @Transactional()
  @Get()
  async findAll(
    @TransactionManager() entityManager: EntityManager,
  ): Promise<string[]> {
    this.logger.log('finding all customs');
    return this.queryService.findAll(entityManager);
  }

  @Transactional()
  @Get(':id')
  async findOne(
    @TransactionManager() entityManager: EntityManager,
    @Param('id') id: number,
  ): Promise<string> {
    this.logger.log(`finding a custom with ID ${id}`);
    return this.queryService.findOne(id, entityManager);
  }
}
