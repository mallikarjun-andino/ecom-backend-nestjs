// favourites.module.ts
import { Module } from '@nestjs/common';

import { FavouritesCommandModule } from './command/favourites.command.module';
import { FavouritesQueryModule } from './query/favourites.query.module';

@Module({
  imports: [FavouritesCommandModule, FavouritesQueryModule],
  exports: [FavouritesCommandModule, FavouritesQueryModule],
})
export class FavouritesModule {}
