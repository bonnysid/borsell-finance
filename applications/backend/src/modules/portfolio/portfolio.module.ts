import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetModule } from '@/modules/asset/asset.module';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { UserModule } from '@/modules/user/user.module';
import { UserAssetModule } from '@/modules/user-asset/user-asset.module';

import { PortfolioAssetEntity, PortfolioEntity, PortfolioSnapshotEntity } from './entities';
import { PortfolioController } from './portfolio.controller';
import { PortfolioAssetService, PortfolioService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioEntity, PortfolioSnapshotEntity, PortfolioAssetEntity]),
    CurrencyModule,
    SettingsModule,
    UserAssetModule,
    UserModule,
    AssetModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioAssetService],
  exports: [PortfolioService, PortfolioAssetService],
})
export class PortfolioModule {}
