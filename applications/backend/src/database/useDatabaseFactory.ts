import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  AssetEntity,
  AssetPriceHistoryEntity,
  PortfolioAssetEntity,
  UserAssetEntity,
} from '@/modules/asset';
import { RefreshTokenEntity } from '@/modules/auth';
import { CurrencyEntity } from '@/modules/currency';
import { PortfolioEntity, PortfolioSnapshotEntity } from '@/modules/portfolio';
import { UserEntity } from '@/modules/user';

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
      AssetPriceHistoryEntity,
      PortfolioEntity,
      PortfolioAssetEntity,
      UserAssetEntity,
      PortfolioSnapshotEntity,
    ],
  };
};
