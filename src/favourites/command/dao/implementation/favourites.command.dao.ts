// favourites.command.dao.ts
import { EntityManager, Repository } from 'typeorm';

import { Favourites } from 'src/common/entities';

import {
  IFavouritesCommandDao,
  IAddFavouriteParams,
} from '../interface/favourites.command.dao.interface';

export class FavouritesCommandDao implements IFavouritesCommandDao {
  private getRepo(entityManager: EntityManager): Repository<Favourites> {
    return entityManager.getRepository(Favourites);
  }

  async findFavouriteById(
    entityManager: EntityManager,
    favourite_id: string,
  ): Promise<Favourites | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { favourite_id },
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

  async addFavourite(
    entityManager: EntityManager,
    params: IAddFavouriteParams,
  ): Promise<Favourites> {
    const repo = this.getRepo(entityManager);
    const favourite = repo.create({
      user_id: params.user_id,
      product_id: params.product_id,
    });
    return repo.save(favourite);
  }

  async deleteFavourite(
    entityManager: EntityManager,
    favourite_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({ favourite_id });
  }

  async deleteFavouriteByUserAndProduct(
    entityManager: EntityManager,
    user_id: string,
    product_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({
      user_id,
      product_id,
    });
  }
}
