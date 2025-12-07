import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CurrencyEntity } from '../entities/currency.entity';
import { ExchangeRateApiService } from './exchange-rate-api.service';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly exchangeRateApiService: ExchangeRateApiService, // Инжектируем наш API-клиент
  ) {}

  async fetchAndUpdateAllRates(): Promise<void> {
    const ratesData = await this.exchangeRateApiService.getLatestRates();

    if (!ratesData || Object.keys(ratesData.rates).length === 0) {
      this.logger.warn('No rates received from external API. Skipping update.');
      return;
    }

    const allCurrencies = await this.currencyRepository.find();
    const rates = ratesData.rates;

    const currenciesToUpdate = allCurrencies.map((currency) => {
      if (currency.isBaseCurrency) {
        return currency;
      }

      const newRate = rates[currency.code];

      if (newRate) {
        currency.rateToBase = newRate;
      }

      return currency;
    });

    await this.currencyRepository.save(currenciesToUpdate);

    this.logger.log(`Updated ${currenciesToUpdate.length} currency rates.`);
  }
}
