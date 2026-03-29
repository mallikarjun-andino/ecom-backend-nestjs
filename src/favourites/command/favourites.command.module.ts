// favourites.command.module.ts
import { Module } from '@nestjs/common';

import { FavouritesCommandController } from './controller/favourites.command.controller';
import { FAVOURITES_COMMAND_DAO } from './dao/favourites.command.dao.token';
import { FavouritesCommandDao } from './dao/implementation/favourites.command.dao';
import { FavouritesCommandService } from './service/favourites.command.service';

@Module({
  providers: [
    {
      provide: FAVOURITES_COMMAND_DAO,
      useClass: FavouritesCommandDao,
    },
    FavouritesCommandService,
  ],
  controllers: [FavouritesCommandController],
})
export class FavouritesCommandModule {}
