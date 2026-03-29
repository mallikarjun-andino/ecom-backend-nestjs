import { EntityManager, Repository } from 'typeorm';

import { User } from 'src/common/entities';

import {
  CreateUserData,
  IUserCommandDao,
} from '../interface/user.command.dao.interface';

export class UserCommandDao implements IUserCommandDao {
  private getRepo(entityManager: EntityManager): Repository<User> {
    return entityManager.getRepository(User);
  }

  async findUniqueUser(
    entityManager: EntityManager,
    uniqueFields: {
      userName: string;
      email: string;
      phoneNumber?: string;
    },
  ): Promise<User | null> {
    return this.getRepo(entityManager).findOne({
      where: [
        { user_name: uniqueFields.userName },
        { email: uniqueFields.email },
        { phone_number: uniqueFields.phoneNumber },
      ],
    });
  }

  async createUser(
    entityManager: EntityManager,
    data: CreateUserData,
  ): Promise<User> {
    const repo = this.getRepo(entityManager);
    const user = repo.create({
      user_name: data.userName,
      email: data.email,
      password: data.password,
      phone_number: data.phoneNumber,
    });
    return repo.save(user);
  }

  async findUniqueUserById(
    entityManager: EntityManager,
    id: string,
  ): Promise<User | null> {
    return this.getRepo(entityManager).findOne({
      where: { user_id: id },
    });
  }

  async updateUser(
    entityManager: EntityManager,
    id: string,
    data: { user_name?: string; phone_number?: string },
  ): Promise<User | null> {
    const repo = this.getRepo(entityManager);
    await repo.update(
      { user_id: id },
      {
        user_name: data.user_name,
        phone_number: data.phone_number,
      },
    );
    return repo.findOne({ where: { user_id: id } });
  }

  async deleteUser(entityManager: EntityManager, id: string): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({ user_id: id });
  }
}
