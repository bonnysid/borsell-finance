// src/portfolio/services/currency-seeder.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BASE_CURRENCY_CODE } from '@packages/constants';
import { CurrencyType } from '@packages/types';
import { CurrencyEntity } from 'src/modules/currency/entities';
import { Repository } from 'typeorm';

import { ExchangeRateApiService } from '@/modules/currency/services/exchange-rate-api.service';

@Injectable()
export class CurrencySeederService implements OnModuleInit {
  private readonly logger = new Logger(CurrencySeederService.name);

  // Внедряем репозиторий для доступа к таблице
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly exchangeRateApiService: ExchangeRateApiService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const count = await this.currencyRepository.count();
    if (count > 0) {
      this.logger.log('Currency table already seeded. Skipping.');
      return;
    }

    const data = await this.exchangeRateApiService.getLatestRates();

    if (!data) {
      this.logger.warn('No exchange rates received from external API. Skipping seed.');
      return;
    }

    const initialCurrencies: Partial<CurrencyEntity>[] = [
      {
        code: 'USD',
        name: 'US Dollar',
        type: CurrencyType.FIAT,
        symbol: '$',
      },
      {
        code: 'EUR',
        name: 'Euro',
        type: CurrencyType.FIAT,
        symbol: '€',
      },
      {
        code: 'RUB',
        name: 'Russian Ruble',
        type: CurrencyType.FIAT,
        symbol: '₽',
      },
    ].map((it) => {
      const isBaseCurrency = BASE_CURRENCY_CODE === it.code;

      if (isBaseCurrency) {
        return { isBaseCurrency, rateToBase: 1, ...it };
      }

      return { isBaseCurrency: false, rateToBase: data.rates[it.code] || 0, ...it };
    });

    await this.currencyRepository.save(initialCurrencies);

    this.logger.log(`Successfully seeded ${initialCurrencies.length} currencies.`);
  }
}
