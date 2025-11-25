import * as path from 'path';

import { Global, Module } from '@nestjs/common';
import { TypeConfigModule } from '@snow-tzu/type-config-nestjs';

import { LoggingConfig, AppConfig } from '@shared/logging/config';

@Module({
  imports: [
    TypeConfigModule.forRoot({
      profile: process.env.NODE_ENV ?? 'development',
      isGlobal: true,
      configDir: path.join(__dirname, '..', 'resources'),
    }),
    TypeConfigModule.forFeature([LoggingConfig, AppConfig]),
  ],
  exports: [TypeConfigModule],
})
@Global()
export class AppConfigModule {}
