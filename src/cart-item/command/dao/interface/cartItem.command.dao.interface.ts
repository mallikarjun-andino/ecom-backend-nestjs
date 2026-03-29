// cart.item.command.dao.interface.ts
import { EntityManager } from 'typeorm';

import { CartItem } from 'src/common/entities';

export interface IAddCartItemParams {
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface IUpdateCartItemParams {
  quantity: number;
}

export interface ICartItemCommandDao {
  findCartItemById(
    entityManager: EntityManager,
    cart_item_id: string,
  ): Promise<CartItem | null>;

  findCartItemByCartAndProduct(
    entityManager: EntityManager,
    cart_id: string,
    product_id: string,
  ): Promise<CartItem | null>;

  addCartItem(
    entityManager: EntityManager,
    params: IAddCartItemParams,
  ): Promise<CartItem>;

  updateCartItem(
    entityManager: EntityManager,
    cart_item_id: string,
    params: IUpdateCartItemParams,
  ): Promise<CartItem>;

  deleteCartItem(
    entityManager: EntityManager,
    cart_item_id: string,
  ): Promise<void>;
}
