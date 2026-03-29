// cart.item.query.dao.ts
import { EntityManager, Repository } from 'typeorm';

import { CartItem } from 'src/common/entities';

import { ICartItemQueryDao } from '../interface/cartItem.query.dao.interface';

export class CartItemQueryDao implements ICartItemQueryDao {
  private getRepo(entityManager: EntityManager): Repository<CartItem> {
    return entityManager.getRepository(CartItem);
  }

  async findCartItemsByCartId(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<CartItem[]> {
    const repo = this.getRepo(entityManager);
    return repo.find({
      where: { cart_id },
      relations: ['product'], // Include product details
    });
  }

  async findCartItemById(
    entityManager: EntityManager,
    cart_item_id: string,
  ): Promise<CartItem | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { cart_item_id },
      relations: ['product'],
    });
  }

  async getCartItemCount(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<number> {
    const repo = this.getRepo(entityManager);
    const result = (await repo
      .createQueryBuilder('cart_item')
      .select('SUM(cart_item.quantity)', 'total')
      .where('cart_item.cart_id = :cart_id', { cart_id })
      .getRawOne()) as { total: string | null }; // Add type assertion

    return parseInt(result?.total ?? '0', 10); // Use ?? instead of ||
  }

  async getCartTotalPrice(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<number> {
    const repo = this.getRepo(entityManager);
    const result = (await repo
      .createQueryBuilder('cart_item')
      .select('SUM(cart_item.quantity * cart_item.price)', 'total')
      .where('cart_item.cart_id = :cart_id', { cart_id })
      .getRawOne()) as { total: string | null }; // Add type assertion

    return parseFloat(result?.total ?? '0'); // Use ?? instead of ||
  }
}
