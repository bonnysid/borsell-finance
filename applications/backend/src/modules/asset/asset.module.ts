import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    TypeOrmModule.forFeature([
      AssetEntity,
      AssetPriceHistoryEntity,
      PortfolioAssetEntity,
      UserAssetEntity,
      UserAssetOperationEntity,
    ]),
  ],
  providers: [AssetService, AssetSeederService, PortfolioAssetService, UserAssetService],
  controllers: [AssetController],
  exports: [AssetService, PortfolioAssetService, UserAssetService],
})
export class AssetModule {}
