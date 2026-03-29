import { Controller } from '@nestjs/common';

import { CartQueryControllerBase } from '@generated/cart.query/cart.query.controller.base';
import { GetCartByUserIdResponseDto } from '@generated/cart.query/cart.query.dto';

import { CartQueryService } from '../service/cart.query.service';

@Controller()
export class CartQueryController extends CartQueryControllerBase {
  constructor(private readonly service: CartQueryService) {
    super();
  }

  async getCartByUserId(
    user_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetCartByUserIdResponseDto> {
    return this.service.getCartByUserId(user_id);
  }
}
