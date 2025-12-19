import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '@/database';

import { AssetController } from './asset.controller';
import {
  AssetEntity,
  AssetPriceHistoryEntity,
  PortfolioAssetEntity,
  UserAssetEntity,
  UserAssetOperationEntity,
} from './entities';
import {
  AssetSeederService,
  AssetService,
  PortfolioAssetService,
  UserAssetService,
} from './services';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      AssetEntity,
      AssetPriceHistoryEntity,
      UserAssetEntity,
      UserAssetOperationEntity,
      PortfolioAssetEntity,
    ]),
  ],
  providers: [AssetSeederService, AssetService, UserAssetService, PortfolioAssetService],
  controllers: [AssetController],
  exports: [AssetService, UserAssetService, PortfolioAssetService],
})
export class AssetModule {}
