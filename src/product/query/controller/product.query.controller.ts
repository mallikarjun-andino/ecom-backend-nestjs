import { Controller } from '@nestjs/common';

import { ProductQueryControllerBase } from '@generated/product.query/product.query.controller.base';
import {
  GetProductByIdResponseDto,
  GetProductsByCategoryResponseDto,
  ListProductsResponseDto,
} from '@generated/product.query/product.query.dto';

import { ProductQueryService } from '../service/product.query.service';

@Controller()
export class ProductQueryController extends ProductQueryControllerBase {
  constructor(private readonly service: ProductQueryService) {
    super();
  }

  async getProductById(
    product_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<GetProductByIdResponseDto> {
    return this.service.getProductById(product_id);
  }

  async listProducts(
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
    category_id?: string,
    in_stock?: boolean,
    is_active?: boolean,
    limit?: number,
    max_price?: number,
    min_price?: number,
    min_rating?: number,
    page?: number,
    sort_by?: string,
    sort_order?: string,
  ): Promise<ListProductsResponseDto> {
    return this.service.listProducts({
      category_id,
      in_stock,
      is_active,
      limit,
      max_price,
      min_price,
      min_rating,
      page,
      sort_by,
      sort_order,
    });
  }

  async getProductsByCategory(
    category_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
    is_active?: boolean,
    limit?: number,
    page?: number,
    sort_by?: string,
    sort_order?: string,
  ): Promise<GetProductsByCategoryResponseDto> {
    return this.service.getProductsByCategory(category_id, {
      is_active,
      limit,
      page,
      sort_by,
      sort_order,
    });
  }
}
