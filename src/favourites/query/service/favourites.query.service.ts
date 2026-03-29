// favourites.query.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
  GetFavouritesByUserIdResponseDto,
  GetFavouriteByIdResponseDto,
  IsFavouritedResponseDto,
} from '@generated/favourites.query/favourites.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { FAVOURITES_QUERY_DAO } from '../dao/favourites.query.dao.token';
import { IFavouritesQueryDao } from '../dao/interface/favourites.query.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class FavouritesQueryService extends TransactionContext {
  private readonly logger = new Logger(FavouritesQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(FAVOURITES_QUERY_DAO)
    private readonly favouritesQueryDao: IFavouritesQueryDao,
  ) {
    super();
  }

  @Transactional()
  async getFavouritesByUserId(
    user_id: string,
  ): Promise<GetFavouritesByUserIdResponseDto> {
    const countryCode = this.request.tenantContext?.countryCode;
    if (!countryCode) {
      this.logger.error('Country code is missing from tenant context');
      throw new BadRequestException('Country code is required');
    }

    this.logger.log(`Fetching favourites for user: ${user_id}`);

    const favourites = await this.favouritesQueryDao.findFavouritesByUserId(
      this.entityManager,
      user_id,
    );

    const totalFavourites =
      await this.favouritesQueryDao.countFavouritesByUserId(
        this.entityManager,
        user_id,
      );

    this.logger.log(
      `Found ${favourites.length} favourites for user: ${user_id}`,
    );

    return {
      items: favourites.map((fav) => ({
        favourite_id: fav.favourite_id,
        user_id: fav.user_id,
        product_id: fav.product_id,
        product_name: fav.product?.product_name ?? '',
        product_price: fav.product?.price ?? 0,
        product_image: fav.product?.image ?? [],
        created_at: fav.created_at.toDateString(),
        updated_at: fav.updated_at.toDateString(),
      })),
      user_id,
      total_favourites: totalFavourites,
    };
  }

  @Transactional()
  async getFavouriteById(
    favourite_id: string,
  ): Promise<GetFavouriteByIdResponseDto> {
    const countryCode = this.request.tenantContext?.countryCode;
    if (!countryCode) {
      this.logger.error('Country code is missing from tenant context');
      throw new BadRequestException('Country code is required');
    }

    this.logger.log(`Fetching favourite by ID: ${favourite_id}`);

    const favourite = await this.favouritesQueryDao.findFavouriteById(
      this.entityManager,
      favourite_id,
    );

    if (!favourite) {
      this.logger.warn(`Favourite not found: ${favourite_id}`);
      throw new NotFoundException(
        `Favourite with ID ${favourite_id} not found`,
      );
    }

    this.logger.log(`Favourite found: ${favourite_id}`);

    return {
      favourite_id: favourite.favourite_id,
      user_id: favourite.user_id,
      product_id: favourite.product_id,
      product_name: favourite.product?.product_name ?? '',
      product_price: favourite.product?.price ?? 0,
      product_image: favourite.product?.image ?? [],
      created_at: favourite.created_at.toDateString(),
      updated_at: favourite.updated_at.toDateString(),
    };
  }

  @Transactional()
  async isFavourited(
    user_id: string,
    product_id: string,
  ): Promise<IsFavouritedResponseDto> {
    const countryCode = this.request.tenantContext?.countryCode;
    if (!countryCode) {
      this.logger.error('Country code is missing from tenant context');
      throw new BadRequestException('Country code is required');
    }

    this.logger.log(
      `Checking if product ${product_id} is favourited by user ${user_id}`,
    );

    const favourite =
      await this.favouritesQueryDao.findFavouriteByUserAndProduct(
        this.entityManager,
        user_id,
        product_id,
      );

    const isFavourited = !!favourite;

    this.logger.log(
      `Product ${product_id} favourited by user ${user_id}: ${isFavourited}`,
    );

    return {
      is_favourited: isFavourited,
      user_id,
      product_id,
      favourite_id: favourite?.favourite_id ?? undefined,
    };
  }
}
