import { EntityManager } from 'typeorm';

import { User } from 'src/common/entities';

export interface IUserQueryDao {
  getUserById(id: string, entityManager: EntityManager): Promise<User | null>;

  getUserByEmail(
    email: string,
    entityManager: EntityManager,
  ): Promise<User | null>;

  getAllUsers(entityManager: EntityManager): Promise<User[]>;
}
