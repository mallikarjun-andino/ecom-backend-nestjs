// favourites.query.controller.ts
import { Controller } from '@nestjs/common';

import { FavouritesQueryControllerBase } from '@generated/favourites.query/favourites.query.controller.base';
import {
  GetFavouritesByUserIdResponseDto,
  GetFavouriteByIdResponseDto,
  IsFavouritedResponseDto,
} from '@generated/favourites.query/favourites.query.dto';

import { FavouritesQueryService } from '../service/favourites.query.service';

@Controller()
export class FavouritesQueryController extends FavouritesQueryControllerBase {
  constructor(private readonly service: FavouritesQueryService) {
    super();
  }

  async getFavouritesByUserId(
    user_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetFavouritesByUserIdResponseDto> {
    return this.service.getFavouritesByUserId(user_id);
  }

  async getFavouriteById(
    favourite_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<GetFavouriteByIdResponseDto> {
    return this.service.getFavouriteById(favourite_id);
  }

  async isFavourited(
    user_id: string,
    product_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<IsFavouritedResponseDto> {
    return this.service.isFavourited(user_id, product_id);
  }
}
