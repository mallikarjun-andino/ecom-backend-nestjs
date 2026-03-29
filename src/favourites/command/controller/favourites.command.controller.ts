// favourites.command.controller.ts
import { Controller } from '@nestjs/common';

import { FavouritesCommandControllerBase } from '@generated/favourites.command/favourites.command.controller.base';
import {
  AddFavouriteRequestDto,
  AddFavouriteResponseDto,
  RemoveFavouriteResponseDto,
  RemoveFavouriteByUserProductResponseDto,
} from '@generated/favourites.command/favourites.command.dto';

import { FavouritesCommandService } from '../service/favourites.command.service';

@Controller()
export class FavouritesCommandController extends FavouritesCommandControllerBase {
  constructor(private readonly service: FavouritesCommandService) {
    super();
  }

  async addFavourite(
    body: AddFavouriteRequestDto,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<AddFavouriteResponseDto> {
    return this.service.addFavourite(body);
  }

  async removeFavourite(
    favourite_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<RemoveFavouriteResponseDto> {
    return this.service.removeFavourite(favourite_id);
  }

  async removeFavouriteByUserAndProduct(
    user_id: string,
    product_id: string,
    _xBusinessUnit: string,
    _xCountryCode: string,
    _xTraceId: string,
  ): Promise<RemoveFavouriteByUserProductResponseDto> {
    return this.service.removeFavouriteByUserAndProduct(user_id, product_id);
  }
}
