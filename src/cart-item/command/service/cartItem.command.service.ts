// cart.item.command.service.ts
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
  AddCartItemRequestDto,
  AddCartItemResponseDto,
  UpdateCartItemRequestDto,
  UpdateCartItemResponseDto,
  DeleteCartItemResponseDto,
} from '@generated/cartItem.command/cartItem.command.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { CART_ITEM_COMMAND_DAO } from '../dao/cartItem.command.dao.token';
import { ICartItemCommandDao } from '../dao/interface/cartItem.command.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class CartItemCommandService extends TransactionContext {
  private readonly logger = new Logger(CartItemCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(CART_ITEM_COMMAND_DAO)
    private readonly cartItemCommandDao: ICartItemCommandDao,
  ) {
    super();
  }

  @Transactional()
  async addCartItem(
    cart_id: string,
    dto: AddCartItemRequestDto,
  ): Promise<AddCartItemResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to add item to cart: ${cart_id}`);

      // Check if item already exists in cart
      const existingItem =
        await this.cartItemCommandDao.findCartItemByCartAndProduct(
          this.entityManager,
          cart_id,
          dto.product_id,
        );

      if (existingItem) {
        this.logger.warn(
          `Item already exists in cart: ${cart_id} - ${dto.product_id}`,
        );
        throw new ConflictException(
          'Item already exists in cart. Use update endpoint to change quantity.',
        );
      }

      // TODO: Fetch product price from Product service
      // For now, using a placeholder. You'll need to inject ProductQueryDao
      const productPrice = 1299.99; // This should come from product service

      const cartItem = await this.cartItemCommandDao.addCartItem(
        this.entityManager,
        {
          cart_id,
          product_id: dto.product_id,
          quantity: dto.quantity,
          price: productPrice,
        },
      );

      this.logger.log(`Item added to cart: ${cartItem.cart_item_id}`);

      return {
        cart_item_id: cartItem.cart_item_id,
        cart_id: cartItem.cart_id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        created_at: cartItem.created_at.toDateString(),
        updated_at: cartItem.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to add item to cart ${cart_id}: ${error.message}`);
      
      if (error.code === '23503') {
        throw new NotFoundException(`Product with ID ${dto.product_id} not found`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add item to cart');
    }
  }

  @Transactional()
  async updateCartItem(
    cart_id: string,
    cart_item_id: string,
    dto: UpdateCartItemRequestDto,
  ): Promise<UpdateCartItemResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to update cart item: ${cart_item_id}`);

      // Check if cart item exists
      const existingItem = await this.cartItemCommandDao.findCartItemById(
        this.entityManager,
        cart_item_id,
      );

      if (!existingItem) {
        this.logger.warn(`Cart item not found: ${cart_item_id}`);
        throw new NotFoundException(
          `Cart item with ID ${cart_item_id} not found`,
        );
      }

      // Verify the cart item belongs to the cart
      if (existingItem.cart_id !== cart_id) {
        this.logger.warn(
          `Cart item ${cart_item_id} does not belong to cart ${cart_id}`,
        );
        throw new NotFoundException(`Cart item not found in this cart`);
      }

      const updatedItem = await this.cartItemCommandDao.updateCartItem(
        this.entityManager,
        cart_item_id,
        { quantity: dto.quantity },
      );

      this.logger.log(
        `Cart item updated: ${cart_item_id} - new quantity: ${dto.quantity}`,
      );

      return {
        cart_item_id: updatedItem.cart_item_id,
        cart_id: updatedItem.cart_id,
        product_id: updatedItem.product_id,
        quantity: updatedItem.quantity,
        price: updatedItem.price,
        updated_at: updatedItem.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update cart item ${cart_item_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update cart item');
    }
  }

  @Transactional()
  async deleteCartItem(
    cart_id: string,
    cart_item_id: string,
  ): Promise<DeleteCartItemResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to delete cart item: ${cart_item_id}`);

      // Check if cart item exists
      const existingItem = await this.cartItemCommandDao.findCartItemById(
        this.entityManager,
        cart_item_id,
      );

      if (!existingItem) {
        this.logger.warn(`Cart item not found: ${cart_item_id}`);
        throw new NotFoundException(
          `Cart item with ID ${cart_item_id} not found`,
        );
      }

      // Verify the cart item belongs to the cart
      if (existingItem.cart_id !== cart_id) {
        this.logger.warn(
          `Cart item ${cart_item_id} does not belong to cart ${cart_id}`,
        );
        throw new NotFoundException(`Cart item not found in this cart`);
      }

      await this.cartItemCommandDao.deleteCartItem(
        this.entityManager,
        cart_item_id,
      );

      this.logger.log(`Cart item deleted: ${cart_item_id}`);

      return {
        message: 'Cart item removed successfully',
        cart_item_id,
        cart_id,
      };
    } catch (error) {
      this.logger.error(`Failed to delete cart item ${cart_item_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete cart item');
    }
  }
}