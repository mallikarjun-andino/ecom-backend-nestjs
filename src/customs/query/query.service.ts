import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Message } from './message.entity';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);
  async findAll(entityManager: EntityManager): Promise<string[]> {
    const messages = await entityManager
      .createQueryBuilder(Message, 'm')
      .select('m.message')
      .getRawMany();
    return messages.map((row: { m_message: string }) => row.m_message);
  }

  async findOne(id: number, entityManager: EntityManager): Promise<string> {
    const message = await entityManager
      .query('SELECT * FROM messages WHERE id = $1', [id])
      .then((res: Message[]) => res[0]);
    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }
    return message.message;
  }
}
