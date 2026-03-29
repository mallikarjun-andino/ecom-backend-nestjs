import { Controller } from '@nestjs/common';

import { CartItemCommandControllerBase } from '@generated/cartItem.command/cartItem.command.controller.base';
import {
  AddCartItemRequestDto,
  AddCartItemResponseDto,
  DeleteCartItemResponseDto,
  UpdateCartItemRequestDto,
  UpdateCartItemResponseDto,
} from '@generated/cartItem.command/cartitem.command.dto';

import { CartItemCommandService } from '../service/cartItem.command.service';

@Controller()
export class CartItemCommandController extends CartItemCommandControllerBase {
  constructor(private readonly service: CartItemCommandService) {
    super();
  }

  async addCartItem(
    cart_id: string,
    body: AddCartItemRequestDto,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<AddCartItemResponseDto> {
    return this.service.addCartItem(cart_id, body);
  }

  async updateCartItem(
    cart_id: string,
    cart_item_id: string,
    body: UpdateCartItemRequestDto,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<UpdateCartItemResponseDto> {
    return this.service.updateCartItem(cart_id, cart_item_id, body);
  }

  async deleteCartItem(
    cart_id: string,
    cart_item_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<DeleteCartItemResponseDto> {
    return this.service.deleteCartItem(cart_id, cart_item_id);
  }
}
