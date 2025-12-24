import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyType } from '@packages/types';
import { Repository } from 'typeorm';

import { CurrencyEntity } from '@/modules/currency/entities';
import { ExchangeRateApiService } from '@/modules/currency/services/exchange-rate-api.service';
import { SettingsService } from '@/modules/settings/services';

@Injectable()
export class CurrencySeederService implements OnModuleInit {
  private readonly logger = new Logger(CurrencySeederService.name);

  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly exchangeRateApiService: ExchangeRateApiService,
    private readonly settingsService: SettingsService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const count = await this.currencyRepository.count();

    if (count > 0) {
      this.logger.log('Currency table already seeded. Skipping.');

      await this.update();

      return;
    }

    let baseCurrencyCode: string;
    try {
      baseCurrencyCode = await this.settingsService.getBaseCurrencyCode();
    } catch (e) {
      this.logger.error(
        'BASE_CURRENCY_CODE setting not found. Make sure SettingsSeeder runs first.',
      );
      throw e;
    }

    this.logger.log(`Using base currency "${baseCurrencyCode}" from settings`);

    const data = await this.exchangeRateApiService.getLatestRates(baseCurrencyCode);

    if (!data) {
      this.logger.warn('No exchange rates received from external API. Skipping seed.');
      return;
    }

    const baseCodes = ['USD', 'EUR', 'RUB'];

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
      ...Object.keys(data.rates)
        .filter((it) => !baseCodes.includes(it))
        .map((code) => ({
          code,
          name: code,
          type: CurrencyType.FIAT,
          symbol: code,
        })),
    ].map((it) => {
      const isBaseCurrency = baseCurrencyCode === it.code;

      if (isBaseCurrency) {
        return { rateToBase: '1', ...it };
      }

      return {
        rateToBase: String(data.rates[it.code] || 0),
        ...it,
      };
    });

    // На всякий случай убеждаемся, что базовая валюта точно есть в списке
    if (!initialCurrencies.some((c) => c.code === baseCurrencyCode)) {
      this.logger.warn(
        `Base currency "${baseCurrencyCode}" is not in initialCurrencies list. Adding it manually with rateToBase = 1.`,
      );

      initialCurrencies.push({
        code: baseCurrencyCode,
        name: baseCurrencyCode,
        type: CurrencyType.FIAT,
        symbol: baseCurrencyCode,
        rateToBase: '1',
      });
    }

    await this.currencyRepository.save(initialCurrencies);

    this.logger.log(`Successfully seeded ${initialCurrencies.length} currencies.`);
  }

  private async update() {
    const now = new Date();
    const currencies = await this.currencyRepository.find();

    const baseCurrencyCode = await this.settingsService.getBaseCurrencyCode();

    this.logger.log(`Updating currency rates using base "${baseCurrencyCode}"`);

    const baseCurrency = currencies.find((currency) => currency.code === baseCurrencyCode);

    if (
      baseCurrency &&
      now.getMilliseconds() - baseCurrency.updatedAt.getMilliseconds() > 1000 * 60 * 60 * 24
    ) {
      this.logger.log(
        `Base currency "${baseCurrencyCode}" was updated more than 24 hours ago. Skipping updating rates...`,
      );
      return;
    }

    const data = await this.exchangeRateApiService.getLatestRates(baseCurrencyCode);

    if (!data) {
      this.logger.warn('No exchange rates received from external API. Skipping update.');
      return;
    }

    currencies.forEach((currency) => {
      if (currency.code === baseCurrencyCode) {
        currency.rateToBase = '1';
      } else {
        currency.rateToBase = String(data.rates[currency.code] || 0);
      }
    });

    await this.currencyRepository.save(currencies);

    this.logger.log(`Updated ${currencies.length} currency rates.`);
  }
}
