// address.command.controller.ts
import { Controller } from '@nestjs/common';

import { AddressCommandControllerBase } from '@generated/address.command/address.command.controller.base';
import {
  AddAddressRequestDto,
  AddAddressResponseDto,
  UpdateAddressRequestDto,
  UpdateAddressResponseDto,
  SetDefaultAddressResponseDto,
  DeleteAddressResponseDto,
} from '@generated/address.command/address.command.dto';

import { AddressCommandService } from '../service/address.command.service';

@Controller()
export class AddressCommandController extends AddressCommandControllerBase {
  constructor(private readonly service: AddressCommandService) {
    super();
  }

  async addAddress(
    body: AddAddressRequestDto,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<AddAddressResponseDto> {
    return this.service.addAddress(body);
  }

  async updateAddress(
    address_id: string,
    body: UpdateAddressRequestDto,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<UpdateAddressResponseDto> {
    return this.service.updateAddress(address_id, body);
  }

  async setDefaultAddress(
    address_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<SetDefaultAddressResponseDto> {
    return this.service.setDefaultAddress(address_id);
  }

  async deleteAddress(
    address_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<DeleteAddressResponseDto> {
    return this.service.deleteAddress(address_id);
  }
}
