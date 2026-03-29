// cart.item.query.dao.interface.ts
import { EntityManager } from 'typeorm';

import { CartItem } from 'src/common/entities';

export interface ICartItemQueryDao {
  findCartItemsByCartId(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<CartItem[]>;

  findCartItemById(
    entityManager: EntityManager,
    cart_item_id: string,
  ): Promise<CartItem | null>;

  getCartItemCount(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<number>;

  getCartTotalPrice(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<number>;
}
