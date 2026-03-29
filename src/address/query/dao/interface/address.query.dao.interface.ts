import { EntityManager } from 'typeorm';

import { Address } from 'src/common/entities';

export interface IAddressQueryDao {
  findAddressesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address[]>;

  findAddressById(
    entityManager: EntityManager,
    address_id: string,
  ): Promise<Address | null>;

  findDefaultAddressByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address | null>;

  countAddressesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<number>;
}
