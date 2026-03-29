import { Controller } from '@nestjs/common';

import { CartCommandControllerBase } from '@generated/cart.command/cart.command.controller.base';
import {
  CreateCartRequestDto,
  CreateCartResponseDto,
  DeleteCartResponseDto,
} from '@generated/cart.command/cart.command.dto';

import { CartCommandService } from '../service/cart.command.service';

@Controller()
export class CartCommandController extends CartCommandControllerBase {
  constructor(private readonly service: CartCommandService) {
    super();
  }

  async createCart(
    body: CreateCartRequestDto,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<CreateCartResponseDto> {
    return this.service.createCart(body);
  }

  async deleteCart(
    cart_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<DeleteCartResponseDto> {
    return this.service.deleteCart(cart_id);
  }
}
