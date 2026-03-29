// favourites.command.dao.interface.ts
import { EntityManager } from 'typeorm';

import { Favourites } from 'src/common/entities';

export interface IAddFavouriteParams {
  user_id: string;
  product_id: string;
}

export interface IFavouritesCommandDao {
  findFavouriteById(
    entityManager: EntityManager,
    favourite_id: string,
  ): Promise<Favourites | null>;

  findFavouriteByUserAndProduct(
    entityManager: EntityManager,
    user_id: string,
    product_id: string,
  ): Promise<Favourites | null>;

  findFavouritesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Favourites[]>;

  addFavourite(
    entityManager: EntityManager,
    params: IAddFavouriteParams,
  ): Promise<Favourites>;

  deleteFavourite(
    entityManager: EntityManager,
    favourite_id: string,
  ): Promise<void>;

  deleteFavouriteByUserAndProduct(
    entityManager: EntityManager,
    user_id: string,
    product_id: string,
  ): Promise<void>;
}
