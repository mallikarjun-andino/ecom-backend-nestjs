import { EntityManager } from 'typeorm';

import { User } from 'src/common/entities';

export interface CreateUserData {
  userName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface IUserCommandDao {
  findUniqueUser(
    entityManager: EntityManager,
    uniqueFields: {
      userName: string;
      email: string;
      phoneNumber?: string;
    },
  ): Promise<User | null>;

  createUser(entityManager: EntityManager, data: CreateUserData): Promise<User>;

  findUniqueUserById(
    entityManager: EntityManager,
    id: string,
  ): Promise<User | null>;

  updateUser(
    entityManager: EntityManager,
    id: string,
    data: {
      user_name?: string;
      phone_number?: string;
    },
  ): Promise<User | null>;

  deleteUser(entityManager: EntityManager, id: string): Promise<void>;
}
