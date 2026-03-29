import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
  HttpException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { REQUEST } from '@nestjs/core/router/request/request-constants';

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
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { IProductCommandDao } from '../dao/interface/product.command.dao.interface';
import { PRODUCT_COMMAND_DAO } from '../dao/product.command.dao.token';

@Injectable({ scope: Scope.REQUEST })
export class ProductCommandService extends TransactionContext {
  private readonly logger = new Logger(ProductCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(PRODUCT_COMMAND_DAO)
    private readonly productCommandDao: IProductCommandDao,
  ) {
    super();
  }

  @Transactional()
  async createProduct(
    dto: CreateProductRequestDto,
  ): Promise<CreateProductResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      const product = await this.productCommandDao.createProduct(
        this.entityManager,
        {
          product_name: dto.product_name,
          category_id: dto.category_id,
          price: dto.price,
          stock: dto.stock,
          rating: dto.rating,
          image: dto.image,
          description: dto.description,
          is_active: dto.is_active ?? true,
        },
      );

      this.logger.log(`Product created: ${dto.product_name}`);

      return {
        product_id: product.product_id,
        product_name: product.product_name,
        category_id: product.category_id,
        price: product.price,
        stock: product.stock,
        rating: product.rating ?? undefined,
        image: product.image ?? undefined,
        description: product.description ?? undefined,
        is_active: product.is_active,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      
      if (error.code === '23503') {
        throw new NotFoundException(`Category with ID ${dto.category_id} not found`);
      }
      if (error.code === '23505') {
        throw new ConflictException(`Product with name "${dto.product_name}" already exists`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  @Transactional()
  async updateProduct(
    dto: UpdateProductRequestDto,
    product_id: string,
  ): Promise<UpdateProductResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      const existing = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );

      if (!existing) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new NotFoundException('Product not found');
      }

      const product = await this.productCommandDao.updateProduct(
        this.entityManager,
        product_id,
        {
          product_name: dto.product_name,
          category_id: dto.category_id,
          price: dto.price,
          stock: dto.stock,
          rating: dto.rating,
          image: dto.image,
          description: dto.description,
          is_active: dto.is_active ?? existing.is_active,
        },
      );

      if (!product) {
        this.logger.error(`Failed to update product: ${product_id}`);
        throw new InternalServerErrorException('Product not found after update');
      }

      this.logger.log(`Product updated: ${dto.product_name}`);

      return {
        product_id: product.product_id,
        product_name: product.product_name,
        category_id: product.category_id,
        price: product.price,
        stock: product.stock,
        rating: product.rating ?? undefined,
        image: product.image ?? undefined,
        description: product.description ?? undefined,
        is_active: product.is_active,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update product: ${error.message}`);
      
      if (error.code === '23503') {
        throw new NotFoundException(`Category with ID ${dto.category_id} not found`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  @Transactional()
  async patchProduct(
    dto: PatchProductRequestDto,
    product_id: string,
  ): Promise<UpdateProductResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      let product = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );

      if (!product) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new NotFoundException('Product not found');
      }

      const patch = {
        ...(dto.product_name !== undefined && { product_name: dto.product_name }),
        ...(dto.category_id !== undefined && { category_id: dto.category_id }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      };

      product = await this.productCommandDao.patchProduct(
        this.entityManager,
        product_id,
        patch,
      );

      if (!product) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new InternalServerErrorException('Product not found');
      }

      return {
        product_id: product.product_id,
        product_name: product.product_name,
        category_id: product.category_id,
        price: product.price,
        stock: product.stock,
        rating: product.rating ?? undefined,
        image: product.image ?? undefined,
        description: product.description ?? undefined,
        is_active: product.is_active,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to patch product: ${error.message}`);
      
      if (error.code === '23503') {
        throw new NotFoundException(`Category with ID ${dto.category_id} not found`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to patch product');
    }
  }

  @Transactional()
  async deleteProduct(product_id: string): Promise<DeleteProductResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      const product = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );

      if (!product) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new NotFoundException('Product not found');
      }

      await this.productCommandDao.deleteProduct(this.entityManager, product_id);

      return {
        message: `Product with name ${product.product_name} has been deleted.`,
        product_id,
      };
    } catch (error) {
      this.logger.error(`Failed to delete product: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  @Transactional()
  async activateProduct(product_id: string): Promise<StatusUpdateResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      const product = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );
      if (!product) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new NotFoundException('Product not found');
      }

      await this.productCommandDao.activateProduct(
        this.entityManager,
        product_id,
      );
      return {
        message: `Product with name ${product.product_name} has been activated.`,
        product_id,
        is_active: product.is_active,
      };
    } catch (error) {
      this.logger.error(`Failed to activate product: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to activate product');
    }
  }

  @Transactional()
  async deactivateProduct(
    product_id: string,
  ): Promise<StatusUpdateResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      const product = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );
      if (!product) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new NotFoundException('Product not found');
      }

      await this.productCommandDao.deactivateProduct(
        this.entityManager,
        product_id,
      );
      return {
        message: `Product with name ${product.product_name} has been activated.`,
        product_id,
        is_active: product.is_active,
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate product: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to deactivate product');
    }
  }

  @Transactional()
  async adjustProductStock(
    dto: AdjustStockRequestDto,
    product_id: string,
  ): Promise<StockAdjustmentResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      const product = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );
      if (!product) {
        this.logger.error(`Product not found: ${product_id}`);
        throw new NotFoundException('Product not found');
      }

      await this.productCommandDao.adjustProductStock(
        this.entityManager,
        product_id,
        dto,
      );

      const updatedProduct = await this.productCommandDao.findProductById(
        this.entityManager,
        product_id,
      );

      return {
        product_id,
        product_name: product.product_name,
        stock: updatedProduct?.stock ?? product.stock,
      };
    } catch (error) {
      this.logger.error(`Failed to adjust stock: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to adjust product stock');
    }
  }
}