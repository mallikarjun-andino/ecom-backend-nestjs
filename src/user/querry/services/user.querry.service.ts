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
  GetAllUsersResponseDto,
  GetUserByEmailResponseDto,
  GetUserByIdResponseDto,
} from '@generated/user.query/user.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { IUserQueryDao } from '../dao/interface/user.querry.dao.interface';
import { USER_QUERY_DAO } from '../dao/user.querry.dao.token';

@Injectable({ scope: Scope.REQUEST })
export class UserQueryService extends TransactionContext {
  private readonly logger = new Logger(UserQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(USER_QUERY_DAO) private readonly userQueryDao: IUserQueryDao,
  ) {
    super();
  }

  @Transactional()
  async getUserByEmail(email: string): Promise<GetUserByEmailResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to fetch user by email: ${email}`);

      const user = await this.userQueryDao.getUserByEmail(
        email,
        this.entityManager,
      );

      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      this.logger.log(`User found: ${user.user_id} - ${user.email}`);

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        phone_number: user.phone_number ?? undefined,
        created_at: user.created_at.toDateString(),
        updated_at: user.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch user by email ${email}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Transactional()
  async getAllUsers(): Promise<GetAllUsersResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log('Fetching all users');

      const users = await this.userQueryDao.getAllUsers(this.entityManager);

      this.logger.log(`Fetched ${users.length} users successfully`);

      return {
        items: users.map((user) => ({
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          phone_number: user.phone_number ?? undefined,
          created_at: user.created_at.toDateString(),
          updated_at: user.updated_at.toDateString(),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Transactional()
  async getUserById(id: string): Promise<GetUserByIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to fetch user by ID: ${id}`);

      const user = await this.userQueryDao.getUserById(id, this.entityManager);

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User found: ${user.user_id} - ${user.email}`);

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        phone_number: user.phone_number ?? undefined,
        created_at: user.created_at.toDateString(),
        updated_at: user.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch user by ID ${id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
}