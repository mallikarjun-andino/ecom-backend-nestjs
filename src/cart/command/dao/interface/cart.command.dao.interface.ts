// cart.command.dao.interface.ts
import { EntityManager } from 'typeorm';

import { Cart } from 'src/common/entities';

export interface ICreateCartParams {
  user_id: string;
}

export interface ICartCommandDao {
  findCartByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Cart | null>;

  findCartById(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<Cart | null>;

  createCart(
    entityManager: EntityManager,
    params: ICreateCartParams,
  ): Promise<Cart>;

  deleteCart(entityManager: EntityManager, cart_id: string): Promise<void>;
}
