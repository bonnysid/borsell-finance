import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyModule } from '@/modules/currency/currency.module';
import { SettingsModule } from '@/modules/settings/settings.module';
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
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioAssetService],
  exports: [PortfolioService, PortfolioAssetService],
})
export class PortfolioModule {}
