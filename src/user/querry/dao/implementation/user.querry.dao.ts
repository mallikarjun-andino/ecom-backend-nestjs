import { EntityManager, Repository } from 'typeorm';

import { User } from 'src/common/entities';

import { IUserQueryDao } from '../interface/user.querry.dao.interface';

export class UserQuerryDao implements IUserQueryDao {
  private getRepo(entityManager: EntityManager): Repository<User> {
    return entityManager.getRepository(User);
  }

  getUserByEmail(
    email: string,
    entityManager: EntityManager,
  ): Promise<User | null> {
    return this.getRepo(entityManager).findOne({
      where: { email },
    });
  }

  getAllUsers(entityManager: EntityManager): Promise<User[]> {
    return this.getRepo(entityManager).find();
  }

  getUserById(id: string, entityManager: EntityManager): Promise<User | null> {
    return this.getRepo(entityManager).findOne({
      where: { user_id: id },
    });
  }
}
