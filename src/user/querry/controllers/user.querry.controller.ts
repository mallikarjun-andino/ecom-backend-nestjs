import { Controller } from '@nestjs/common';

import { UserQueryControllerBase } from '@generated/user.query/user.query.controller.base';
import {
  GetAllUsersResponseDto,
  GetUserByEmailResponseDto,
  GetUserByIdResponseDto,
} from '@generated/user.query/user.query.dto';

import { UserQueryService } from '../services/user.querry.service';

@Controller()
export class UserQueryController extends UserQueryControllerBase {
  constructor(private readonly service: UserQueryService) {
    super();
  }

  async getUserById(
    id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<GetUserByIdResponseDto> {
    return this.service.getUserById(id);
  }

  async getUserByEmail(
    email: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<GetUserByEmailResponseDto> {
    return this.service.getUserByEmail(email);
  }

  async getAllUsers(
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<GetAllUsersResponseDto> {
    return this.service.getAllUsers();
  }
}
