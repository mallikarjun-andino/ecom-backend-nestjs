// address.query.controller.ts
import { Controller } from '@nestjs/common';

import { AddressQueryControllerBase } from '@generated/address.query/address.query.controller.base';
import {
  GetAddressesByUserIdResponseDto,
  GetAddressByIdResponseDto,
  GetDefaultAddressResponseDto,
} from '@generated/address.query/address.query.dto';

import { AddressQueryService } from '../service/address.query.service';

@Controller()
export class AddressQueryController extends AddressQueryControllerBase {
  constructor(private readonly service: AddressQueryService) {
    super();
  }

  async getAddressesByUserId(
    user_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetAddressesByUserIdResponseDto> {
    return this.service.getAddressesByUserId(user_id);
  }

  async getAddressById(
    address_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetAddressByIdResponseDto> {
    return this.service.getAddressById(address_id);
  }

  async getDefaultAddress(
    user_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetDefaultAddressResponseDto> {
    return this.service.getDefaultAddress(user_id);
  }
}
