import { EntityManager } from 'typeorm';

import { Cart } from 'src/common/entities';

export interface ICartQueryDao {
  findCartByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Cart | null>;
}
