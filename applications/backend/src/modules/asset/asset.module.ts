import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '@/database';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { HolidayModule } from '@/modules/holiday/holiday.module';
import { MoexModule } from '@/modules/moex/moex.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { UserModule } from '@/modules/user/user.module';

import { AssetController } from './asset.controller';
import { AssetEntity, AssetPriceHistoryEntity } from './entities';
import { AssetSeederService, AssetService, AssetUpdaterService } from './services';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([AssetEntity, AssetPriceHistoryEntity]),
    HttpModule,
    CurrencyModule,
    HolidayModule,
    UserModule,
    MoexModule,
    SettingsModule,
  ],
  providers: [AssetSeederService, AssetService, AssetUpdaterService],
  controllers: [AssetController],
  exports: [AssetService, AssetUpdaterService],
})
export class AssetModule {}
