import { Controller } from '@nestjs/common';

import { CategoryCommandControllerBase } from '@generated/category.command/category.command.controller.base';
import {
  CreateCategoryRequestDto,
  CreateCategoryResponseDto,
  DeleteCategoryResponseDto,
  UpdateCategoryRequestDto,
  UpdateCategoryResponseDto,
} from '@generated/category.command/category.command.dto';

import { CategoryCommandService } from '../service/category.command.service';

@Controller()
export class CategoryCommandController extends CategoryCommandControllerBase {
  constructor(private readonly service: CategoryCommandService) {
    super();
  }

  async createCategory(
    body: CreateCategoryRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<CreateCategoryResponseDto> {
    return this.service.createCategory(body);
  }

  async updateCategory(
    category_id: string,
    body: UpdateCategoryRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<UpdateCategoryResponseDto> {
    return this.service.updateCategory(category_id, body);
  }

  async deleteCategory(
    category_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<DeleteCategoryResponseDto> {
    return await this.service.deleteCategory(category_id);
  }
}
