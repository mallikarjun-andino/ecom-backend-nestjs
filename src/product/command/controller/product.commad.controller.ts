import { Controller } from '@nestjs/common';

import { ProductCommandControllerBase } from '@generated/product.command/product.command.controller.base';
import {
  AdjustStockRequestDto,
  CreateProductRequestDto,
  CreateProductResponseDto,
  DeleteProductResponseDto,
  PatchProductRequestDto,
  StatusUpdateResponseDto,
  StockAdjustmentResponseDto,
  UpdateProductRequestDto,
  UpdateProductResponseDto,
} from '@generated/product.command/product.command.dto';

import { ProductCommandService } from '../service/product.command.service';

@Controller()
export class ProductCommandController extends ProductCommandControllerBase {
  constructor(private readonly service: ProductCommandService) {
    super();
  }

  async createProduct(
    body: CreateProductRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<CreateProductResponseDto> {
    return await this.service.createProduct(body);
  }

  async updateProduct(
    product_id: string,
    body: UpdateProductRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<UpdateProductResponseDto> {
    return await this.service.updateProduct(body, product_id);
  }

  async patchProduct(
    product_id: string,
    body: PatchProductRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<UpdateProductResponseDto> {
    return await this.service.patchProduct(body, product_id);
  }

  async deleteProduct(
    product_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<DeleteProductResponseDto> {
    return await this.service.deleteProduct(product_id);
  }

  async activateProduct(
    product_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<StatusUpdateResponseDto> {
    return await this.service.activateProduct(product_id);
  }

  async deactivateProduct(
    product_id: string,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<StatusUpdateResponseDto> {
    return await this.service.deactivateProduct(product_id);
  }

  async adjustProductStock(
    product_id: string,
    body: AdjustStockRequestDto,
    _xCountryCode: string,
    _xTenantId: string,
    _xTraceId: string,
  ): Promise<StockAdjustmentResponseDto> {
    return await this.service.adjustProductStock(body, product_id);
  }
}
