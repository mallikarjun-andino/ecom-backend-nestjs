// cart.item.query.controller.ts
import { Controller } from '@nestjs/common';

import { CartItemQueryControllerBase } from '@generated/cartItem.query/cartItem.query.controller.base';
import {
  GetCartItemByIdResponseDto,
  GetCartItemsResponseDto,
} from '@generated/cartItem.query/cartitem.query.dto';

import { CartItemQueryService } from '../service/cartItem.query.service';

@Controller()
export class CartItemQueryController extends CartItemQueryControllerBase {
  constructor(private readonly service: CartItemQueryService) {
    super();
  }

  async getCartItems(
    cart_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetCartItemsResponseDto> {
    return this.service.getCartItems(cart_id);
  }

  async getCartItemById(
    cart_id: string,
    cart_item_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetCartItemByIdResponseDto> {
    return this.service.getCartItemById(cart_id, cart_item_id);
  }
}
