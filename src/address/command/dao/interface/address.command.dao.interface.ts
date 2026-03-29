// address.command.dao.interface.ts
import { EntityManager } from 'typeorm';

import { Address } from 'src/common/entities';

export interface IAddAddressParams {
  user_id: string;
  address: string;
  is_default: boolean;
}

export interface IUpdateAddressParams {
  address: string;
}

export interface IAddressCommandDao {
  findAddressById(
    entityManager: EntityManager,
    address_id: string,
  ): Promise<Address | null>;

  findDefaultAddressByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address | null>;

  findAddressesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Address[]>;

  addAddress(
    entityManager: EntityManager,
    params: IAddAddressParams,
  ): Promise<Address>;

  updateAddress(
    entityManager: EntityManager,
    address_id: string,
    params: IUpdateAddressParams,
  ): Promise<Address>;

  setDefaultAddress(
    entityManager: EntityManager,
    address_id: string,
    user_id: string,
  ): Promise<void>;

  unsetDefaultAddress(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<void>;

  deleteAddress(
    entityManager: EntityManager,
    address_id: string,
  ): Promise<void>;
}
