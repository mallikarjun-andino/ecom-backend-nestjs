import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  DeleteUserResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from '@generated/user.command/user.command.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { IUserCommandDao } from '../dao/interface/user.command.dao.interface';
import { USER_COMMAND_DAO } from '../dao/user.command.dao.token';

@Injectable({ scope: Scope.REQUEST })
export class UserCommandService extends TransactionContext {
  private readonly logger = new Logger(UserCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(USER_COMMAND_DAO) private readonly userCommandDao: IUserCommandDao,
  ) {
    super();
  }

  @Transactional()
  async createUser(dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to create user with email: ${dto.email}`);

      const existing = await this.userCommandDao.findUniqueUser(
        this.entityManager,
        {
          userName: dto.user_name,
          email: dto.email,
          phoneNumber: dto.phone_number,
        },
      );

      if (existing) {
        this.logger.warn(`User already exists with email: ${dto.email}`);
        throw new ConflictException('User already exists');
      }

      const user = await this.userCommandDao.createUser(this.entityManager, {
        userName: dto.user_name,
        email: dto.email,
        password: dto.password,
        phoneNumber: dto.phone_number,
      });

      this.logger.log(
        `User created successfully: ${user.user_id} - ${user.email}`,
      );

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        phone_number: user.phone_number ?? undefined,
        created_at: user.created_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      
      if (error.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Transactional()
  async updateUser(
    id: string,
    dto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to update user: ${id}`);

      const existing = await this.userCommandDao.findUniqueUserById(
        this.entityManager,
        id,
      );

      if (!existing) {
        this.logger.error(`User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const user = await this.userCommandDao.updateUser(this.entityManager, id, {
        user_name: dto.user_name,
        phone_number: dto.phone_number,
      });

      if (!user) {
        this.logger.error(`Failed to update user: ${id}`);
        throw new InternalServerErrorException('Failed to update user');
      }

      this.logger.log(
        `User updated successfully: ${user.user_id} - ${user.email}`,
      );

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        phone_number: user.phone_number ?? undefined,
        created_at: user.created_at.toDateString(),
        updated_at: user.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update user ${id}: ${error.message}`);
      
      if (error.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Transactional()
  async deleteUser(id: string): Promise<DeleteUserResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to delete user: ${id}`);

      const existing = await this.userCommandDao.findUniqueUserById(
        this.entityManager,
        id,
      );

      if (!existing) {
        this.logger.error(`User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.userCommandDao.deleteUser(this.entityManager, id);

      this.logger.log(`User deleted successfully: ${id}`);

      return {
        message: 'User deleted successfully',
        user_id: id,
      };
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}