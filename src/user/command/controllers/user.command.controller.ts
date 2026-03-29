import { Controller } from '@nestjs/common';

import { UserCommandControllerBase } from '@generated/user.command/user.command.controller.base';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  DeleteUserResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from '@generated/user.command/user.command.dto';

import { UserCommandService } from '../services/user.command.service';

@Controller()
export class UserCommandController extends UserCommandControllerBase {
  constructor(private readonly service: UserCommandService) {
    super();
  }

  async createUser(
    body: CreateUserRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<CreateUserResponseDto> {
    return this.service.createUser(body);
  }

  async updateUser(
    id: string,
    body: UpdateUserRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<UpdateUserResponseDto> {
    return this.service.updateUser(id, body);
  }

  async deleteUser(
    id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<DeleteUserResponseDto> {
    return this.service.deleteUser(id);
  }
}
