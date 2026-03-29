import {
  BadRequestException,
  ConflictException,
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
  CreateCategoryRequestDto,
  CreateCategoryResponseDto,
  DeleteCategoryResponseDto,
  UpdateCategoryRequestDto,
  UpdateCategoryResponseDto,
} from '@generated/category.command/category.command.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { CATEGORY_COMMAND_DAO } from '../dao/category.command.dao.token';
import { ICategoryCommandDao } from '../dao/interface/category.command.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class CategoryCommandService extends TransactionContext {
  private readonly logger = new Logger(CategoryCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(CATEGORY_COMMAND_DAO)
    private readonly categoryCommandDao: ICategoryCommandDao,
  ) {
    super();
  }

  @Transactional()
  async createCategory(
    dto: CreateCategoryRequestDto,
  ): Promise<CreateCategoryResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to create category: ${dto.category_name}`);

      const category = await this.categoryCommandDao.createCategory(
        this.entityManager,
        {
          category_name: dto.category_name,
        },
      );

      if (!category) {
        throw new InternalServerErrorException('Category not created');
      }

      this.logger.log(`Category created: ${category.category_name}`);

      return {
        category_id: category.category_id,
        category_name: category.category_name,
        created_at: category.created_at?.toISOString(),
        updated_at: category.updated_at?.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`);
      
      if (error.code === '23505') {
        throw new ConflictException(`Category with name "${dto.category_name}" already exists`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  @Transactional()
  async updateCategory(
    category_id: string,
    dto: UpdateCategoryRequestDto,
  ): Promise<UpdateCategoryResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to update category: ${category_id}`);

      const existing = await this.categoryCommandDao.findCategoryById(
        this.entityManager,
        category_id,
      );
      if (!existing) {
        this.logger.error(`Category not found: ${category_id}`);
        throw new NotFoundException(`Category with ID ${category_id} not found`);
      }

      const category = await this.categoryCommandDao.updateCategory(
        this.entityManager,
        category_id,
        dto.category_name,
      );

      if (!category) {
        throw new InternalServerErrorException('Category not updated');
      }

      this.logger.log(`Category updated: ${category_id}`);

      return {
        category_id: category.category_id,
        category_name: category.category_name,
        created_at: category.created_at?.toISOString(),
        updated_at: category.updated_at?.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update category ${category_id}: ${error.message}`);
      
      if (error.code === '23505') {
        throw new ConflictException(`Category with name "${dto.category_name}" already exists`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  @Transactional()
  async deleteCategory(
    category_id: string,
  ): Promise<DeleteCategoryResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to delete category: ${category_id}`);

      const existing = await this.categoryCommandDao.findCategoryById(
        this.entityManager,
        category_id,
      );
      if (!existing) {
        this.logger.error(`Category not found: ${category_id}`);
        throw new NotFoundException(`Category with ID ${category_id} not found`);
      }

      await this.categoryCommandDao.deleteCategory(
        this.entityManager,
        category_id,
      );

      this.logger.log(`Category deleted: ${category_id}`);

      return {
        message: `Category ${category_id} deleted successfully`,
        category_id: existing.category_id,
      };
    } catch (error) {
      this.logger.error(`Failed to delete category ${category_id}: ${error.message}`);
      
      if (error.code === '23503') {
        throw new ConflictException('Cannot delete category with associated products');
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}