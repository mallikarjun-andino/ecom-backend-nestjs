// favourites.query.dao.interface.ts
import { EntityManager } from 'typeorm';

import { Favourites } from 'src/common/entities';

export interface IFavouritesQueryDao {
  findFavouritesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Favourites[]>;

  findFavouriteById(
    entityManager: EntityManager,
    favourite_id: string,
  ): Promise<Favourites | null>;

  findFavouriteByUserAndProduct(
    entityManager: EntityManager,
    user_id: string,
    product_id: string,
  ): Promise<Favourites | null>;

  countFavouritesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<number>;
}
