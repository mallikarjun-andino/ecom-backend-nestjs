import { Controller } from '@nestjs/common';

import { CategoryQueryControllerBase } from '@generated/category.query/category.query.controller.base';
import {
  GetCategoryByIdResponseDto,
  ListCategoriesResponseDto,
} from '@generated/category.query/category.query.dto';

import { CategoryQueryService } from '../service/category.query.service';

@Controller()
export class CategoryQueryController extends CategoryQueryControllerBase {
  constructor(private readonly service: CategoryQueryService) {
    super();
  }

  async listCategories(
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
    _category_name?: string,
    _limit?: number,
    _page?: number,
    _sort_by?: string,
    _sort_order?: string,
  ): Promise<ListCategoriesResponseDto> {
    return this.service.listCategories();
  }

  async getCategoryById(
    category_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<GetCategoryByIdResponseDto> {
    return this.service.getCategoryById(category_id);
  }
}
