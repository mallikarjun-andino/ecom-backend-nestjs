// favourites.command.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
  HttpException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
  AddFavouriteRequestDto,
  AddFavouriteResponseDto,
  RemoveFavouriteResponseDto,
  RemoveFavouriteByUserProductResponseDto,
} from '@generated/favourites.command/favourites.command.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { FAVOURITES_COMMAND_DAO } from '../dao/favourites.command.dao.token';
import { IFavouritesCommandDao } from '../dao/interface/favourites.command.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class FavouritesCommandService extends TransactionContext {
  private readonly logger = new Logger(FavouritesCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(FAVOURITES_COMMAND_DAO)
    private readonly favouritesCommandDao: IFavouritesCommandDao,
  ) {
    super();
  }

  @Transactional()
  async addFavourite(
    dto: AddFavouriteRequestDto,
  ): Promise<AddFavouriteResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(
        `Attempting to add favourite for user: ${dto.user_id}, product: ${dto.product_id}`,
      );

      // Check if favourite already exists
      const existingFavourite =
        await this.favouritesCommandDao.findFavouriteByUserAndProduct(
          this.entityManager,
          dto.user_id,
          dto.product_id,
        );

      if (existingFavourite) {
        this.logger.warn(
          `Favourite already exists for user: ${dto.user_id}, product: ${dto.product_id}`,
        );
        throw new ConflictException('Product already in favourites');
      }

      // Add favourite
      const favourite = await this.favouritesCommandDao.addFavourite(
        this.entityManager,
        {
          user_id: dto.user_id,
          product_id: dto.product_id,
        },
      );

      this.logger.log(`Favourite added: ${favourite.favourite_id}`);

      return {
        favourite_id: favourite.favourite_id,
        user_id: favourite.user_id,
        product_id: favourite.product_id,
        created_at: favourite.created_at.toDateString(),
        updated_at: favourite.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to add favourite: ${error.message}`);
      
      if (error.code === '23503') {
        if (error.message.includes('user_id')) {
          throw new NotFoundException(`User with ID ${dto.user_id} not found`);
        }
        if (error.message.includes('product_id')) {
          throw new NotFoundException(`Product with ID ${dto.product_id} not found`);
        }
      }
      if (error.code === '23505') {
        throw new ConflictException('Product already in favourites');
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add favourite');
    }
  }

  @Transactional()
  async removeFavourite(
    favourite_id: string,
  ): Promise<RemoveFavouriteResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to remove favourite: ${favourite_id}`);

      // Check if favourite exists
      const existingFavourite = await this.favouritesCommandDao.findFavouriteById(
        this.entityManager,
        favourite_id,
      );

      if (!existingFavourite) {
        this.logger.warn(`Favourite not found: ${favourite_id}`);
        throw new NotFoundException(
          `Favourite with ID ${favourite_id} not found`,
        );
      }

      // Delete favourite
      await this.favouritesCommandDao.deleteFavourite(
        this.entityManager,
        favourite_id,
      );

      this.logger.log(`Favourite removed: ${favourite_id}`);

      return {
        message: 'Favourite removed successfully',
        favourite_id,
      };
    } catch (error) {
      this.logger.error(`Failed to remove favourite ${favourite_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove favourite');
    }
  }

  @Transactional()
  async removeFavouriteByUserAndProduct(
    user_id: string,
    product_id: string,
  ): Promise<RemoveFavouriteByUserProductResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(
        `Attempting to remove favourite for user: ${user_id}, product: ${product_id}`,
      );

      // Check if favourite exists
      const existingFavourite =
        await this.favouritesCommandDao.findFavouriteByUserAndProduct(
          this.entityManager,
          user_id,
          product_id,
        );

      if (!existingFavourite) {
        this.logger.warn(
          `Favourite not found for user: ${user_id}, product: ${product_id}`,
        );
        throw new NotFoundException(
          `Favourite not found for user ${user_id} and product ${product_id}`,
        );
      }

      // Delete favourite
      await this.favouritesCommandDao.deleteFavouriteByUserAndProduct(
        this.entityManager,
        user_id,
        product_id,
      );

      this.logger.log(
        `Favourite removed for user: ${user_id}, product: ${product_id}`,
      );

      return {
        message: 'Favourite removed successfully',
        user_id,
        product_id,
      };
    } catch (error) {
      this.logger.error(`Failed to remove favourite for user ${user_id}, product ${product_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove favourite');
    }
  }
}