import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyEntity } from './entities';
import {
  CbrApiService,
  CurrencySchedulerService,
  CurrencySeederService,
  CurrencyService,
  ExchangeRateApiService,
} from './services';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity]), HttpModule],
  providers: [
    CurrencySeederService,
    ExchangeRateApiService,
    CurrencySchedulerService,
    CurrencyService,
    CbrApiService,
  ],
})
export class CurrencyModule {}
