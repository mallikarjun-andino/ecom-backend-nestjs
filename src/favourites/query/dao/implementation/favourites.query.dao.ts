// favourites.query.dao.ts
import { EntityManager, Repository } from 'typeorm';

import { Favourites } from 'src/common/entities';

import { IFavouritesQueryDao } from '../interface/favourites.query.dao.interface';

export class FavouritesQueryDao implements IFavouritesQueryDao {
  private getRepo(entityManager: EntityManager): Repository<Favourites> {
    return entityManager.getRepository(Favourites);
  }

  async findFavouritesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<Favourites[]> {
    const repo = this.getRepo(entityManager);
    return repo.find({
      where: { user_id },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  async findFavouriteById(
    entityManager: EntityManager,
    favourite_id: string,
  ): Promise<Favourites | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { favourite_id },
      relations: ['product'],
    });
  }

  async findFavouriteByUserAndProduct(
    entityManager: EntityManager,
    user_id: string,
    product_id: string,
  ): Promise<Favourites | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: {
        user_id,
        product_id,
      },
    });
  }

  async countFavouritesByUserId(
    entityManager: EntityManager,
    user_id: string,
  ): Promise<number> {
    const repo = this.getRepo(entityManager);
    return repo.count({
      where: { user_id },
    });
  }
}
