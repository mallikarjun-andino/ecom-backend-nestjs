// address.command.service.ts
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
  AddAddressRequestDto,
  AddAddressResponseDto,
  UpdateAddressRequestDto,
  UpdateAddressResponseDto,
  SetDefaultAddressResponseDto,
  DeleteAddressResponseDto,
} from '@generated/address.command/address.command.dto';
import { TenantRequest, Transactional, TransactionContext } from '@shared';
import { DatasourceManager } from '@shared/database/datasource.manager';

import { ADDRESS_COMMAND_DAO } from '../dao/address.command.dao.token';
import { IAddressCommandDao } from '../dao/interface/address.command.dao.interface';

@Injectable({ scope: Scope.REQUEST })
export class AddressCommandService extends TransactionContext {
  private readonly logger = new Logger(AddressCommandService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly datasourceManager: DatasourceManager,
    @Inject(ADDRESS_COMMAND_DAO)
    private readonly addressCommandDao: IAddressCommandDao,
  ) {
    super();
  }

  @Transactional()
  async addAddress(dto: AddAddressRequestDto): Promise<AddAddressResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to add address for user: ${dto.user_id}`);

      // Check if this is set as default
      let isDefault = dto.is_default ?? false;

      // If setting as default, unset any existing default
      if (isDefault) {
        const existingDefault =
          await this.addressCommandDao.findDefaultAddressByUserId(
            this.entityManager,
            dto.user_id,
          );

        if (existingDefault) {
          this.logger.log(
            `Unsetting previous default address: ${existingDefault.address_id}`,
          );
          await this.addressCommandDao.unsetDefaultAddress(
            this.entityManager,
            dto.user_id,
          );
        }
      }

      // If this is the first address for the user, make it default
      const existingAddresses =
        await this.addressCommandDao.findAddressesByUserId(
          this.entityManager,
          dto.user_id,
        );

      if (existingAddresses.length === 0) {
        isDefault = true;
        this.logger.log(`First address for user, setting as default`);
      }

      // Add the address
      const address = await this.addressCommandDao.addAddress(
        this.entityManager,
        {
          user_id: dto.user_id,
          address: dto.address,
          is_default: isDefault,
        },
      );

      this.logger.log(
        `Address added: ${address.address_id} for user: ${dto.user_id}`,
      );

      return {
        address_id: address.address_id,
        user_id: address.user_id,
        address: address.address,
        is_default: address.is_default,
        created_at: address.created_at.toDateString(),
        updated_at: address.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to add address for user ${dto.user_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add address');
    }
  }

  @Transactional()
  async updateAddress(
    address_id: string,
    dto: UpdateAddressRequestDto,
  ): Promise<UpdateAddressResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to update address: ${address_id}`);

      // Check if address exists
      const existingAddress = await this.addressCommandDao.findAddressById(
        this.entityManager,
        address_id,
      );

      if (!existingAddress) {
        this.logger.warn(`Address not found: ${address_id}`);
        throw new NotFoundException(`Address with ID ${address_id} not found`);
      }

      // Update address
      const updatedAddress = await this.addressCommandDao.updateAddress(
        this.entityManager,
        address_id,
        { address: dto.address },
      );

      this.logger.log(`Address updated: ${address_id}`);

      return {
        address_id: updatedAddress.address_id,
        user_id: updatedAddress.user_id,
        address: updatedAddress.address,
        is_default: updatedAddress.is_default,
        created_at: updatedAddress.created_at.toDateString(),
        updated_at: updatedAddress.updated_at.toDateString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update address ${address_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update address');
    }
  }

  @Transactional()
  async setDefaultAddress(
    address_id: string,
  ): Promise<SetDefaultAddressResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to set default address: ${address_id}`);

      // Check if address exists
      const address = await this.addressCommandDao.findAddressById(
        this.entityManager,
        address_id,
      );

      if (!address) {
        this.logger.warn(`Address not found: ${address_id}`);
        throw new NotFoundException(`Address with ID ${address_id} not found`);
      }

      // Unset any existing default for this user
      await this.addressCommandDao.unsetDefaultAddress(
        this.entityManager,
        address.user_id,
      );

      // Set this address as default
      await this.addressCommandDao.setDefaultAddress(
        this.entityManager,
        address_id,
        address.user_id,
      );

      this.logger.log(`Address set as default: ${address_id}`);

      return {
        message: 'Address set as default successfully',
        address_id,
        is_default: true,
      };
    } catch (error) {
      this.logger.error(`Failed to set default address ${address_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to set default address');
    }
  }

  @Transactional()
  async deleteAddress(address_id: string): Promise<DeleteAddressResponseDto> {
    try {
      const countryCode = this.request.tenantContext?.countryCode;
      if (!countryCode) {
        this.logger.error('Country code is missing from tenant context');
        throw new BadRequestException('Country code is required');
      }

      this.logger.log(`Attempting to delete address: ${address_id}`);

      // Check if address exists
      const address = await this.addressCommandDao.findAddressById(
        this.entityManager,
        address_id,
      );

      if (!address) {
        this.logger.warn(`Address not found: ${address_id}`);
        throw new NotFoundException(`Address with ID ${address_id} not found`);
      }

      // Prevent deleting default address
      if (address.is_default) {
        this.logger.warn(`Cannot delete default address: ${address_id}`);
        throw new ConflictException(
          'Cannot delete default address. Set another address as default first.',
        );
      }

      // Delete address
      await this.addressCommandDao.deleteAddress(this.entityManager, address_id);

      this.logger.log(`Address deleted: ${address_id}`);

      return {
        message: 'Address deleted successfully',
        address_id,
      };
    } catch (error) {
      this.logger.error(`Failed to delete address ${address_id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete address');
    }
  }
}