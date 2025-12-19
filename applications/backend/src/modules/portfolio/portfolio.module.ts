import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
