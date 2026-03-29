// address.command.dao.ts
import { EntityManager, Repository } from 'typeorm';

import { Address } from 'src/common/entities';

import {
  IAddAddressParams,
  IAddressCommandDao,
  IUpdateAddressParams,
} from '../interface/address.command.dao.interface';

export class AddressCommandDao implements IAddressCommandDao {
  private getRepo(entityManager: EntityManager): Repository<Address> {
    return entityManager.getRepository(Address);
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

  async findAddressesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address[]> {
    const repo = this.getRepo(entityManager);
    return repo.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }

  async addAddress(
    entityManager: EntityManager,
    params: IAddAddressParams,
  ): Promise<Address> {
    const repo = this.getRepo(entityManager);
    const address = repo.create({
      user_id: params.user_id,
      address: params.address,
      is_default: params.is_default,
    });
    return repo.save(address);
  }

  async updateAddress(
    entityManager: EntityManager,
    address_id: string,
    params: IUpdateAddressParams,
  ): Promise<Address> {
    const repo = this.getRepo(entityManager);
    await repo.update({ address_id }, { address: params.address });

    const updated = await repo.findOne({
      where: { address_id },
    });

    if (!updated) {
      throw new Error(`Address with ID ${address_id} not found after update`);
    }

    return updated;
  }

  async setDefaultAddress(
    entityManager: EntityManager,
    address_id: string,
    user_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.update({ address_id, user_id }, { is_default: true });
  }

  async unsetDefaultAddress(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.update({ user_id, is_default: true }, { is_default: false });
  }

  async deleteAddress(
    entityManager: EntityManager,
    address_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({ address_id });
  }
}
