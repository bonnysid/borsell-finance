import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetController } from './asset.controller';
import {
  AssetEntity,
  AssetPriceHistoryEntity,
  PortfolioAssetEntity,
  UserAssetEntity,
} from './entities';
import { AssetSeederService, AssetService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetEntity,
      AssetPriceHistoryEntity,
      PortfolioAssetEntity,
      UserAssetEntity,
    ]),
  ],
  providers: [AssetService, AssetSeederService],
  controllers: [AssetController],
})
export class AssetModule {}
