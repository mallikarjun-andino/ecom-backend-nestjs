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
  CreateCartRequestDto,
  CreateCartResponseDto,
  DeleteCartResponseDto,
} from '@generated/cart.command/cart.command.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { CART_COMMAND_DAO } from '../dao/cart.command.dao.token';
import { ICartCommandDao } from '../dao/interface/cart.command.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class CartCommandService extends TransactionContext {
  private readonly logger = new Logger(CartCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(CART_COMMAND_DAO) private readonly cartCommandDao: ICartCommandDao,
  ) {
    super();
  }

  @Transactional()
  async createCart(dto: CreateCartRequestDto): Promise<CreateCartResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to create cart for user: ${dto.user_id}`);

      const existingCart = await this.cartCommandDao.findCartByUserId(
        this.entityManager,
        dto.user_id,
      );

      if (existingCart) {
        this.logger.warn(`User already has cart: ${dto.user_id}`);
        throw new ConflictException('User already has an active cart');
      }

      // Create the cart
      const cart = await this.cartCommandDao.createCart(this.entityManager, {
        user_id: dto.user_id,
      });

      this.logger.log(`Cart created: ${cart.cart_id} for user: ${cart.user_id}`);

      return {
        cart_id: cart.cart_id,
        user_id: cart.user_id,
        created_at: cart.created_at.toDateString(),
        updated_at: cart.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create cart for user ${dto.user_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create cart');
    }
  }

  @Transactional()
  async deleteCart(cart_id: string): Promise<DeleteCartResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to delete cart: ${cart_id}`);

      // Check if cart exists
      const cart = await this.cartCommandDao.findCartById(
        this.entityManager,
        cart_id,
      );

      if (!cart) {
        this.logger.warn(`Cart not found: ${cart_id}`);
        throw new NotFoundException(`Cart with ID ${cart_id} not found`);
      }

      // Delete cart - database cascade will handle cart items
      await this.cartCommandDao.deleteCart(this.entityManager, cart_id);

      this.logger.log(`Cart deleted: ${cart_id}`);

      return {
        message: 'Cart deleted successfully',
        cart_id,
      };
    } catch (error) {
      this.logger.error(`Failed to delete cart ${cart_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete cart');
    }
  }
}