import { Injectable, Logger } from '@nestjs/common';
import { CurrencyCode } from '@packages/types';

import { CbrApiService } from '@/modules/currency/services/cbr-api.service';

export type GetLatestRatesResponse = {
  date: string;
  timestamp: number;
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
};

@Injectable()
export class ExchangeRateApiService {
  private readonly logger = new Logger(ExchangeRateApiService.name);

  constructor(private readonly cbrApiService: CbrApiService) {}

  async getLatestRates(): Promise<GetLatestRatesResponse | undefined> {
    try {
      this.logger.log('Fetching exchange rates...');

      const data = await this.cbrApiService.getLatestRatesByRUB();

      return data;
    } catch (error) {
      this.logger.error('Error fetching exchange rates:', error.message);
    }
  }
}
