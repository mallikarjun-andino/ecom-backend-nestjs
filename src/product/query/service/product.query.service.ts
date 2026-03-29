import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
  HttpException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
  GetProductByIdResponseDto,
  GetProductsByCategoryResponseDto,
  ListProductsResponseDto,
} from '@generated/product.query/product.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import {
  GetProductsByCategoryFilters,
  IProductQueryDao,
  ListProductsFilters,
} from '../dao/interface/product.query.dao.interface';
import { PRODUCT_QUERY_DAO } from '../dao/product.querry.dao.token';

@Injectable({ scope: Scope.REQUEST })
export class ProductQueryService extends TransactionContext {
  private readonly logger = new Logger(ProductQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(PRODUCT_QUERY_DAO)
    private readonly productCommandDao: IProductQueryDao,
  ) {
    super();
  }

  @Transactional()
  async getProductById(product_id: string): Promise<GetProductByIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;

      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching product by ID: ${product_id}`);

      const product = await this.productCommandDao.getProductById(
        this.entityManager,
        product_id,
      );

      if (!product) {
        this.logger.warn(`Product not found with ID: ${product_id}`);
        throw new NotFoundException(`Product with ID ${product_id} not found`);
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
      this.logger.error(`Failed to fetch product ${product_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  @Transactional()
  async listProducts(
    filters: ListProductsFilters,
  ): Promise<ListProductsResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      this.logger.log('Fetching products list', { filters });

      const { products, total } = await this.productCommandDao.listProducts(
        this.entityManager,
        filters,
      );

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const total_pages = Math.ceil(total / limit);

      this.logger.log(`Found ${products.length} products out of ${total} total`);

      return {
        items: products.map((product) => ({
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
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch products list: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  @Transactional()
  async getProductsByCategory(
    category_id: string,
    filters: GetProductsByCategoryFilters,
  ): Promise<GetProductsByCategoryResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching products for category: ${category_id}`, { filters });

      const { products, total } =
        await this.productCommandDao.getProductsByCategory(
          this.entityManager,
          category_id,
          filters,
        );

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const total_pages = Math.ceil(total / limit);

      this.logger.log(`Found ${products.length} products in category ${category_id}`);

      return {
        items: products.map((product) => ({
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
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch products for category ${category_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch products by category');
    }
  }
}