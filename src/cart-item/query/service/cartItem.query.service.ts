// cart.item.query.service.ts
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

import {
  GetCartItemByIdResponseDto,
  GetCartItemsResponseDto,
} from '@generated/cartItem.query/cartitem.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { CART_ITEM_QUERY_DAO } from '../dao/cartItem.query.dao.token';
import { ICartItemQueryDao } from '../dao/interface/cartItem.query.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class CartItemQueryService extends TransactionContext {
  private readonly logger = new Logger(CartItemQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(CART_ITEM_QUERY_DAO)
    private readonly cartItemQueryDao: ICartItemQueryDao,
  ) {
    super();
  }

  @Transactional()
  async getCartItems(cart_id: string): Promise<GetCartItemsResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching items for cart: ${cart_id}`);

      const items = await this.cartItemQueryDao.findCartItemsByCartId(
        this.entityManager,
        cart_id,
      );

      if (!items || items.length === 0) {
        this.logger.log(`No items found for cart: ${cart_id}`);
      }

      const totalItems = await this.cartItemQueryDao.getCartItemCount(
        this.entityManager,
        cart_id,
      );

      const totalPrice = await this.cartItemQueryDao.getCartTotalPrice(
        this.entityManager,
        cart_id,
      );

      this.logger.log(`Found ${items.length} items in cart ${cart_id}`);

      return {
        items: items.map((item) => ({
          cart_item_id: item.cart_item_id,
          cart_id: item.cart_id,
          product_id: item.product_id,
          product_name: item.product?.product_name ?? '',
          product_image: item.product?.image ?? [],
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
          created_at: item.created_at.toDateString(),
          updated_at: item.updated_at.toDateString(),
        })),
        cart_id,
        total_items: totalItems,
        total_price: totalPrice,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch items for cart ${cart_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch cart items');
    }
  }

  @Transactional()
  async getCartItemById(
    cart_id: string,
    cart_item_id: string,
  ): Promise<GetCartItemByIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching cart item: ${cart_item_id} for cart: ${cart_id}`);

      const item = await this.cartItemQueryDao.findCartItemById(
        this.entityManager,
        cart_item_id,
      );

      if (!item) {
        this.logger.warn(`Cart item not found: ${cart_item_id}`);
        throw new NotFoundException(
          `Cart item with ID ${cart_item_id} not found`,
        );
      }

      if (item.cart_id !== cart_id) {
        this.logger.warn(
          `Cart item ${cart_item_id} does not belong to cart ${cart_id}`,
        );
        throw new NotFoundException(`Cart item not found in this cart`);
      }

      this.logger.log(`Cart item found: ${cart_item_id}`);

      return {
        cart_item_id: item.cart_item_id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at.toDateString(),
        updated_at: item.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch cart item ${cart_item_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch cart item');
    }
  }
}