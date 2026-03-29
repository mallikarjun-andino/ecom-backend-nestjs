// cart.query.dao.ts
import { EntityManager, Repository } from 'typeorm';

import { Cart } from 'src/common/entities';

import { ICartQueryDao } from '../interface/cart.query.dao.interface';

export class CartQueryDao implements ICartQueryDao {
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
}
