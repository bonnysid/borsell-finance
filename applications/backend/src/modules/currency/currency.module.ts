import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingsModule } from '@/modules/settings/settings.module';

import { CurrencyController } from './currency.controller';
import { CurrencyEntity } from './entities';
import {
  CbrApiService,
  CurrencyConverterService,
  CurrencySchedulerService,
  CurrencySeederService,
  CurrencyService,
  ExchangeRateApiService,
} from './services';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity]), HttpModule, SettingsModule],
  controllers: [CurrencyController],
  providers: [
    CurrencySeederService,
    ExchangeRateApiService,
    CurrencySchedulerService,
    CurrencyService,
    CbrApiService,
    CurrencyConverterService,
  ],
  exports: [CurrencyConverterService],
})
export class CurrencyModule {}
