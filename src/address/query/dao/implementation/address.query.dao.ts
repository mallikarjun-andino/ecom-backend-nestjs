import { EntityManager, Repository } from 'typeorm';

import { Address } from 'src/common/entities';

import { IAddressQueryDao } from '../interface/address.query.dao.interface';

export class AddressQueryDao implements IAddressQueryDao {
  private getRepo(entityManager: EntityManager): Repository<Address> {
    return entityManager.getRepository(Address);
  }

  async findAddressesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address[]> {
    const repo = this.getRepo(entityManager);
    return repo.find({
      where: { user_id },
      order: {
        is_default: 'DESC', // Default addresses first
        created_at: 'DESC',
      },
    });
  }

  async findAddressById(
    entityManager: EntityManager,
    address_id: string,
  ): Promise<Address | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { address_id },
    });
  }

  async findDefaultAddressByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: {
        user_id,
        is_default: true,
      },
    });
  }

  async countAddressesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<number> {
    const repo = this.getRepo(entityManager);
    return repo.count({
      where: { user_id },
    });
  }
}
