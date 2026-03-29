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
  GetCategoryByIdResponseDto,
  ListCategoriesResponseDto,
} from '@generated/category.query/category.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { CATEGORY_QUERY_DAO } from '../dao/category.query.dao.token';
import { ICategoryQueryDao } from '../dao/interface/category.query.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class CategoryQueryService extends TransactionContext {
  private readonly logger = new Logger(CategoryQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(CATEGORY_QUERY_DAO)
    private readonly categoryQueryDao: ICategoryQueryDao,
  ) {
    super();
  }

  @Transactional()
  async listCategories(): Promise<ListCategoriesResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log('Fetching all categories');

      const { categories, total } = await this.categoryQueryDao.listCategories(
        this.entityManager,
      );

      const page = 1;
      const limit = categories.length;
      const total_pages = Math.ceil(total / limit);

      this.logger.log(
        `Fetched ${categories.length} categories out of ${total} total`,
      );

      return {
        items: categories.map((category) => ({
          category_id: category.category_id,
          category_name: category.category_name,
          created_at: category.created_at.toDateString(),
          updated_at: category.updated_at.toDateString(),
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch categories list: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  @Transactional()
  async getCategoryById(
    category_id: string,
  ): Promise<GetCategoryByIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to fetch category by ID: ${category_id}`);

      const category = await this.categoryQueryDao.getCategoryById(
        this.entityManager,
        category_id,
      );

      if (!category) {
        this.logger.warn(`Category not found with ID: ${category_id}`);
        throw new NotFoundException(`Category with ID ${category_id} not found`);
      }

      this.logger.log(
        `Category found: ${category.category_id} - ${category.category_name}`,
      );

      return {
        category_id: category.category_id,
        category_name: category.category_name,
        created_at: category.created_at.toDateString(),
        updated_at: category.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch category ${category_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }
}