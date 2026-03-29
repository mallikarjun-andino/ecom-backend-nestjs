import { EntityManager, Repository } from 'typeorm';

import { Cart } from 'src/common/entities';

import {
  ICartCommandDao,
  ICreateCartParams,
} from '../interface/cart.command.dao.interface';

export class CartCommandDao implements ICartCommandDao {
  private getRepo(entityManager: EntityManager): Repository<Cart> {
    return entityManager.getRepository(Cart);
  }

  async findCartByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Cart | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { user_id },
    });
  }

  async findCartById(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<Cart | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { cart_id },
    });
  }

  async createCart(
    entityManager: EntityManager,
    params: ICreateCartParams,
  ): Promise<Cart> {
    const repo = this.getRepo(entityManager);
    const cart = repo.create({
      user_id: params.user_id,
    });
    return repo.save(cart);
  }

  async deleteCart(
    entityManager: EntityManager,
    cart_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({ cart_id });
  }
}
