import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { EntityManager } from 'typeorm';

import { DatasourceManager } from '../../shared/database/datasource.manager';
import { Transactional } from '../../shared/transaction/transactional-method.decorator';

import { Message } from './message.entity';

@Injectable({ scope: Scope.REQUEST })
export class QueryService {
  private readonly logger = new Logger(QueryService.name);
  // mandatory to inject request to have request scope and
  // data source manager for annotation to work
  constructor(
    @Inject(REQUEST) private readonly request: FastifyRequest,
    private readonly datasourceManager: DatasourceManager,
  ) {}

  async findAll(): Promise<string[]> {
    this.logger.log('find all customs');
    const results = await this.findAllInTransaction();
    this.logger.log('simulation publishing event');
    return results;
  }

  @Transactional()
  private async findAllInTransaction(
    entityManager?: EntityManager,
  ): Promise<string[]> {
    if (!entityManager) {
      throw new Error('EntityManager is not provided');
    }
    const messages = await entityManager
      .createQueryBuilder(Message, 'm')
      .select('m.message')
      .getRawMany();
    return messages.map((row: { m_message: string }) => row.m_message);
  }

  async findOne(id: number): Promise<string> {
    this.logger.log(`Find a custom of id ${id}`);
    const result = await this.findOneInTransaction(id);
    this.logger.log('simulation publishing event');
    return result;
  }
  @Transactional()
  private async findOneInTransaction(
    id: number,
    entityManager?: EntityManager,
  ): Promise<string> {
    if (!entityManager) {
      throw new Error('EntityManager is not provided');
    }
    const message = await entityManager
      .query('SELECT * FROM messages WHERE id = $1', [id])
      .then((res: Message[]) => res[0]);
    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }
    return message.message;
  }
}
