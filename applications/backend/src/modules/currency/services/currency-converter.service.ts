import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyCode, NumberString } from '@packages/types';
import Big from 'big.js';
import { In, Repository } from 'typeorm';

import { SettingsService } from '@/modules/settings';

import { CurrencyEntity } from '../entities';

type ConvertItem = {
  amount: Big | NumberString | number;
  fromCurrency: CurrencyCode;
  toCurrency?: CurrencyCode;
};

type ConvertResult = {
  amount: Big;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
};

@Injectable()
export class CurrencyConverterService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepo: Repository<CurrencyEntity>,
    private readonly settingsService: SettingsService,
  ) {}

  async convertMany(items: ConvertItem[]): Promise<ConvertResult[]> {
    const base = (await this.settingsService.getBaseCurrencyCode()).toUpperCase();

    const currencies = new Set<string>();

    for (const it of items) {
      currencies.add(it.fromCurrency.toUpperCase());
      currencies.add((it.toCurrency ?? base).toUpperCase());
    }

    currencies.delete(base);
    const needed = [...currencies];

    const rates = needed.length
      ? await this.currencyRepo.find({ where: { code: In(needed) } })
      : [];

    const rateToBase = new Map<string, Big>();
    for (const r of rates) rateToBase.set(r.code.toUpperCase(), new Big(r.rateToBase));

    const getRateToBase = (c: string) => {
      const code = c.toUpperCase();
      if (code === base) return new Big(1);
      const v = rateToBase.get(code);
      if (!v) throw new Error(`Rate for ${code} not found`);
      return v;
    };

    return items.map((it) => {
      const fromCurrency = it.fromCurrency.toUpperCase();
      const toCurrency = (it.toCurrency ?? base).toUpperCase();

      const amount = new Big(it.amount);

      if (fromCurrency === toCurrency) {
        return { amount, fromCurrency, toCurrency };
      }

      const fromToBase = getRateToBase(fromCurrency);
      const toToBase = getRateToBase(toCurrency);

      const res = amount.mul(fromToBase).div(toToBase);

      return { amount: res, fromCurrency, toCurrency };
    });
  }

  async convertAmount(params: ConvertItem): Promise<ConvertResult> {
    const base = await this.settingsService.getBaseCurrencyCode(); // например 'USD'
    const fromCurrency = params.fromCurrency.toUpperCase();
    const toCurrency = (params.toCurrency ?? base).toUpperCase();

    const amount = new Big(params.amount);

    if (fromCurrency === toCurrency) {
      return { amount, fromCurrency, toCurrency };
    }

    const need = [fromCurrency, toCurrency].filter((c) => c !== base);

    const rates = need.length ? await this.currencyRepo.find({ where: { code: In(need) } }) : [];

    const byCode = new Map(rates.map((r) => [r.code.toUpperCase(), r]));

    const getRateToBase = (code: string) => {
      if (code === base) return new Big(1);
      const row = byCode.get(code);
      if (!row) throw new NotFoundException(`Rate for currency "${code}" not found`);
      return new Big(row.rateToBase);
    };

    const fromToBase = getRateToBase(fromCurrency);
    const toToBase = getRateToBase(toCurrency);

    const amountInBase = amount.mul(fromToBase);
    const result = amountInBase.div(toToBase);

    return {
      amount: result,
      fromCurrency,
      toCurrency,
    };
  }
}
