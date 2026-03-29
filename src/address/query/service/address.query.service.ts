// address.query.service.ts
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
  GetAddressesByUserIdResponseDto,
  GetAddressByIdResponseDto,
  GetDefaultAddressResponseDto,
} from '@generated/address.query/address.query.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { ADDRESS_QUERY_DAO } from '../dao/address.query.dao.token';
import { IAddressQueryDao } from '../dao/interface/address.query.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class AddressQueryService extends TransactionContext {
  private readonly logger = new Logger(AddressQueryService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(ADDRESS_QUERY_DAO)
    private readonly addressQueryDao: IAddressQueryDao,
  ) {
    super();
  }

  @Transactional()
  async getAddressesByUserId(
    user_id: string,
  ): Promise<GetAddressesByUserIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching addresses for user: ${user_id}`);

      const addresses = await this.addressQueryDao.findAddressesByUserId(
        this.entityManager,
        user_id,
      );

      const totalAddresses = await this.addressQueryDao.countAddressesByUserId(
        this.entityManager,
        user_id,
      );

      const defaultAddress =
        await this.addressQueryDao.findDefaultAddressByUserId(
          this.entityManager,
          user_id,
        );

      this.logger.log(`Found ${addresses.length} addresses for user: ${user_id}`);

      return {
        items: addresses.map((address) => ({
          address_id: address.address_id,
          user_id: address.user_id,
          address: address.address,
          is_default: address.is_default,
          created_at: address.created_at.toDateString(),
          updated_at: address.updated_at.toDateString(),
        })),
        user_id,
        total_addresses: totalAddresses,
        default_address_id: defaultAddress?.address_id ?? undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch addresses for user ${user_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch addresses');
    }
  }

  @Transactional()
  async getAddressById(address_id: string): Promise<GetAddressByIdResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching address by ID: ${address_id}`);

      const address = await this.addressQueryDao.findAddressById(
        this.entityManager,
        address_id,
      );

      if (!address) {
        this.logger.warn(`Address not found: ${address_id}`);
        throw new NotFoundException(`Address with ID ${address_id} not found`);
      }

      this.logger.log(`Address found: ${address_id}`);

      return {
        address_id: address.address_id,
        user_id: address.user_id,
        address: address.address,
        is_default: address.is_default,
        created_at: address.created_at.toDateString(),
        updated_at: address.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch address ${address_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch address');
    }
  }

  @Transactional()
  async getDefaultAddress(
    user_id: string,
  ): Promise<GetDefaultAddressResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Fetching default address for user: ${user_id}`);

      const address = await this.addressQueryDao.findDefaultAddressByUserId(
        this.entityManager,
        user_id,
      );

      if (!address) {
        this.logger.warn(`No default address found for user: ${user_id}`);
        throw new NotFoundException(
          `No default address found for user ${user_id}`,
        );
      }

      this.logger.log(`Default address found: ${address.address_id}`);

      return {
        address_id: address.address_id,
        user_id: address.user_id,
        address: address.address,
        is_default: address.is_default,
        created_at: address.created_at.toDateString(),
        updated_at: address.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch default address for user ${user_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch default address');
    }
  }
}