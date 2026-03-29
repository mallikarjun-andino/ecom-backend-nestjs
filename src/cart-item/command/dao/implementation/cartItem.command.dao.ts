// cart.item.command.dao.ts
import { EntityManager, Repository } from 'typeorm';

import { CartItem } from 'src/common/entities';

import {
  IAddCartItemParams,
  ICartItemCommandDao,
  IUpdateCartItemParams,
} from '../interface/cartItem.command.dao.interface';

export class CartItemCommandDao implements ICartItemCommandDao {
  private getRepo(entityManager: EntityManager): Repository<CartItem> {
    return entityManager.getRepository(CartItem);
  }

  async findCartItemById(
    entityManager: EntityManager,
    cart_item_id: string,
  ): Promise<CartItem | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { cart_item_id },
    });
  }

  async findCartItemByCartAndProduct(
    entityManager: EntityManager,
    cart_id: string,
    product_id: string,
  ): Promise<CartItem | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: {
        cart_id,
        product_id,
      },
    });
  }

  async addCartItem(
    entityManager: EntityManager,
    params: IAddCartItemParams,
  ): Promise<CartItem> {
    const repo = this.getRepo(entityManager);
    const cartItem = repo.create({
      cart_id: params.cart_id,
      product_id: params.product_id,
      quantity: params.quantity,
      price: params.price,
    });
    return repo.save(cartItem);
  }

  async updateCartItem(
    entityManager: EntityManager,
    cart_item_id: string,
    params: IUpdateCartItemParams,
  ): Promise<CartItem> {
    const repo = this.getRepo(entityManager);
    await repo.update({ cart_item_id }, { quantity: params.quantity });

    const updated = await repo.findOne({
      where: { cart_item_id },
    });

    if (!updated) {
      throw new Error(
        `Cart item with ID ${cart_item_id} not found after update`,
      );
    }

    return updated;
  }

  async deleteCartItem(
    entityManager: EntityManager,
    cart_item_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({ cart_item_id });
  }
}
