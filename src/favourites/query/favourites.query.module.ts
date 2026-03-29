// favourites.query.module.ts
import { Module } from '@nestjs/common';

import { FavouritesQueryController } from './controller/favourites.query.controller';
import { FAVOURITES_QUERY_DAO } from './dao/favourites.query.dao.token';
import { FavouritesQueryDao } from './dao/implementation/favourites.query.dao';
import { FavouritesQueryService } from './service/favourites.query.service';

@Module({
  providers: [
    {
      provide: FAVOURITES_QUERY_DAO,
      useClass: FavouritesQueryDao,
    },
    FavouritesQueryService,
  ],
  controllers: [FavouritesQueryController],
})
export class FavouritesQueryModule {}
