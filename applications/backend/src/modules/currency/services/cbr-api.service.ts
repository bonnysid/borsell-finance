import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { CurrencyCode } from '@packages/types';
import { firstValueFrom } from 'rxjs';

export type CbrGetLatestRatesResponse = {
  disclaimer: string;
  date: string;
  timestamp: number;
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
};

@Injectable()
export class CbrApiService {
  private readonly logger = new Logger(CbrApiService.name);

  private readonly BASE_URL = 'https://www.cbr-xml-daily.ru'; // Пример API

  constructor(private readonly httpService: HttpService) {}

  // Base currency: RUB
  async getLatestRatesByRUB(): Promise<CbrGetLatestRatesResponse | undefined> {
    this.logger.log('Fetching CBR (RUB) exchange rates...');

    try {
      const response = await firstValueFrom(
        this.httpService.get<CbrGetLatestRatesResponse>(`${this.BASE_URL}/latest.js`),
      );

      // Предполагаем, что API возвращает объект { "rates": { "RUB": 0.011, "EUR": 1.08, ... } }
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching CBR (RUB) exchange rates: ${error.message}`);
      // В случае ошибки возвращаем пустой объект, чтобы не остановить приложение
    }
  }
}
