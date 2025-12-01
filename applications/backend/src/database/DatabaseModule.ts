import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { useDatabaseFactory } from './useDatabaseFactory';

export const DatabaseModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: useDatabaseFactory,
  inject: [ConfigService],
});
