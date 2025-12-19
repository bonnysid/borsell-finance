import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettingsService } from '@/modules/settings/services';

import { CurrencyEntity } from '../entities/currency.entity';
import { ExchangeRateApiService } from './exchange-rate-api.service';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly exchangeRateApiService: ExchangeRateApiService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Обновляет курсы всех валют относительно базовой валюты,
   * указанной в настройках (settings.base_currency_code).
   */
  async fetchAndUpdateAllRates(): Promise<void> {
    const baseCurrencyCode = await this.settingsService.getBaseCurrencyCode();
    this.logger.log(`Updating currency rates using base "${baseCurrencyCode}"`);

    const ratesData = await this.exchangeRateApiService.getLatestRates(baseCurrencyCode);

    if (!ratesData || !ratesData.rates || Object.keys(ratesData.rates).length === 0) {
      this.logger.warn('No rates received from external API. Skipping update.');
      return;
    }

    const rates = ratesData.rates;

    const allCurrencies = await this.currencyRepository.find();

    const currenciesToUpdate = allCurrencies.map((currency) => {
      if (currency.code === baseCurrencyCode) {
        currency.rateToBase = '1';
        return currency;
      }

      const newRate = rates[currency.code];

      if (!newRate) {
        this.logger.warn(
          `No rate found for currency "${currency.code}" in external API response. Keeping previous value (${currency.rateToBase}).`,
        );
        return currency;
      }

      currency.rateToBase = String(newRate);
      return currency;
    });

    await this.currencyRepository.save(currenciesToUpdate);

    this.logger.log(`Updated ${currenciesToUpdate.length} currency rates.`);
  }
}
