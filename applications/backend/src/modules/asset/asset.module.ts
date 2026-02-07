import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '@/database';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { PortfolioEntity } from '@/modules/portfolio/entities';
import { UserModule } from '@/modules/user/user.module';

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
  AssetUpdaterService,
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
      PortfolioEntity,
    ]),
    HttpModule,
    CurrencyModule,
    UserModule,
  ],
  providers: [
    AssetSeederService,
    AssetService,
    AssetUpdaterService,
    UserAssetService,
    PortfolioAssetService,
  ],
  controllers: [AssetController],
  exports: [AssetService, UserAssetService, PortfolioAssetService, AssetUpdaterService],
})
export class AssetModule {}
