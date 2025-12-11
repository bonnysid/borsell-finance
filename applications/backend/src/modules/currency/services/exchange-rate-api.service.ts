import { Injectable, Logger } from '@nestjs/common';
import { CurrencyCode } from '@packages/types';

import { CbrApiService } from '@/modules/currency/services/cbr-api.service';

export type GetLatestRatesResponse = {
  date: string;
  timestamp: number;
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>; // base per 1 currency
};

@Injectable()
export class ExchangeRateApiService {
  private readonly logger = new Logger(ExchangeRateApiService.name);

  constructor(private readonly cbrApiService: CbrApiService) {}

  async getLatestRates(baseCode: CurrencyCode): Promise<GetLatestRatesResponse | undefined> {
    try {
      this.logger.log(`Fetching exchange rates and rebasing to ${baseCode}...`);

      // CBR: 1 originalBase = rates[code] * code  (currency per 1 base)
      const data = await this.cbrApiService.getLatestRatesByRUB();
      if (!data) {
        this.logger.warn('No data received from CBR API');
        return;
      }

      const { date, timestamp, base: originalBase, rates: originalRates } = data;

      const getRateBaseToCurrency = (code: CurrencyCode): number | undefined => {
        if (code === originalBase) return 1;
        return originalRates[code];
      };

      const baseCodeRateBaseToCurrency = getRateBaseToCurrency(baseCode);

      if (!baseCodeRateBaseToCurrency) {
        this.logger.error(`Base currency "${baseCode}" not found in CBR response`);
        return;
      }

      const rebasedRates: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;

      // множество всех валют: оригинальная база + все, что вернул CBR
      const allCodes = new Set<CurrencyCode>([
        originalBase,
        ...(Object.keys(originalRates) as CurrencyCode[]),
      ]);

      for (const code of allCodes) {
        const rateBaseToCode = getRateBaseToCurrency(code);
        if (!rateBaseToCode) {
          this.logger.warn(`No rate for currency "${code}" in CBR response. Skipping.`);
          continue;
        }

        // ИНВЕРСИЯ + перебазирование:
        // raw: 1 originalBase = rateBaseToCode * code
        // raw для baseCode: 1 originalBase = baseCodeRateBaseToCurrency * baseCode
        //
        // => 1 code = (baseCodeRateBaseToCurrency / rateBaseToCode) * baseCode
        // => baseCode per 1 code:
        const rateCodeToBaseCode = baseCodeRateBaseToCurrency / rateBaseToCode;

        rebasedRates[code] = rateCodeToBaseCode;
      }

      return {
        date,
        timestamp,
        base: baseCode,
        rates: rebasedRates,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error('Error fetching or rebasing exchange rates:', message);
      return;
    }
  }
}
