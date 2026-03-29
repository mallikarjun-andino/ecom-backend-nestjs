import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
  HttpException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { GetCartByUserIdResponseDto } from '@generated/cart.query/cart.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { CART_QUERY_DAO } from '../dao/cart.query.dao.token';
import { ICartQueryDao } from '../dao/interface/cart.query.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class CartQueryService extends TransactionContext {
  private readonly logger = new Logger(CartQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(CART_QUERY_DAO) private readonly cartQueryDao: ICartQueryDao,
  ) {
    super();
  }

  @Transactional()
  async getCartByUserId(user_id: string): Promise<GetCartByUserIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to fetch cart for user: ${user_id}`);

      const cart = await this.cartQueryDao.findCartByUserId(
        this.entityManager,
        user_id,
      );

      if (!cart) {
        this.logger.warn(`Cart not found for user: ${user_id}`);
        throw new NotFoundException(`Cart not found for user ${user_id}`);
      }

      this.logger.log(`Cart found: ${cart.cart_id} for user: ${user_id}`);

      return {
        cart_id: cart.cart_id,
        user_id: cart.user_id,
        created_at: cart.created_at.toDateString(),
        updated_at: cart.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch cart for user ${user_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch cart');
    }
  }
}