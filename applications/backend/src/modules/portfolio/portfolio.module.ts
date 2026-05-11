import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetModule } from '@/modules/asset/asset.module';
import { AiModule } from '@/modules/ai/ai.module';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { UserModule } from '@/modules/user/user.module';
import { UserAssetModule } from '@/modules/user-asset/user-asset.module';

import { PortfolioAssetEntity, PortfolioEntity, PortfolioInsightCacheEntity, PortfolioSnapshotEntity } from './entities';
import { PortfolioController } from './portfolio.controller';
import { PortfolioAssetService, PortfolioService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioEntity, PortfolioSnapshotEntity, PortfolioAssetEntity, PortfolioInsightCacheEntity]),
    CurrencyModule,
    SettingsModule,
    UserAssetModule,
    UserModule,
    AssetModule,
    AiModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioAssetService],
  exports: [PortfolioService, PortfolioAssetService],
})
export class PortfolioModule {}
