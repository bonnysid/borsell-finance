import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetModule } from '@/modules/asset/asset.module';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { SettingsModule } from '@/modules/settings/settings.module';

import { PortfolioEntity, PortfolioSnapshotEntity } from './entities';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioEntity, PortfolioSnapshotEntity]),
    CurrencyModule,
    SettingsModule,
    AssetModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
