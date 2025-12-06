import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  AssetEntity,
  CurrencyEntity,
  PortfolioEntity,
  PortfolioSnapshotEntity,
  RefreshTokenEntity,
  UserEntity,
} from '@/modules';

export const useDatabaseFactory = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.getOrThrow('POSTGRES_HOST'),
    port: configService.getOrThrow('POSTGRES_PORT'),
    username: configService.getOrThrow('POSTGRES_USER'),
    password: configService.getOrThrow('POSTGRES_PASSWORD'),
    database: configService.getOrThrow('POSTGRES_DATABASE'),
    autoLoadEntities: true,
    synchronize: true,
    entities: [
      UserEntity,
      RefreshTokenEntity,
      CurrencyEntity,
      AssetEntity,
      PortfolioEntity,
      PortfolioSnapshotEntity,
    ],
  };
};
