import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import {
  MoexAssetHistoryPrice,
  MoexAssetPrice,
  MoexColumnsVariants,
  MoexHistoryColumns,
  MoexHistoryData,
  MoexMarketData,
  MoexPrices,
} from '@/modules/moex/moex.types';

@Injectable()
export class MoexService implements OnModuleInit {
  private readonly logger = new Logger(MoexService.name);
  private readonly marketUrl =
    'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json';
  private readonly historyBaseUrl =
    'https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQBR/securities';

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    this.logger.log('MoexService initialized');

    // await this.getPrices(['SBER', 'GAZP']);
  }

  async getPrices(tickers: string[]): Promise<MoexPrices> {
    try {
      // Запрашиваем данные по конкретным тикерам через запятую
      // Это минимизирует количество запросов к API
      const url = `${this.marketUrl}?securities=${tickers.join(',')}&iss.meta=off&iss.only=marketdata`;

      const response = await lastValueFrom(this.httpService.get<MoexMarketData>(url));
      const marketData = response.data.marketdata;

      this.logger.log(`Fetched ${tickers.length} prices from MOEX`);

      // MOEX возвращает данные в виде двух массивов: 'columns' и 'data'
      // Нам нужно их "склеить" в удобный объект
      const columns = marketData.columns;
      const dataRows = marketData.data;

      const lastPriceIndex = columns.indexOf(MoexColumnsVariants.LAST);
      const tickerIndex = columns.indexOf(MoexColumnsVariants.SECID);

      const results: MoexPrices = {};
      dataRows.forEach((row) => {
        const ticker = row[tickerIndex] as string;
        const price = row[lastPriceIndex] as number;
        if (ticker) {
          results[ticker] = price;
        }
      });

      return results; // Вернет { "SBER": 280.5, "GAZP": 160.2 }
    } catch (error) {
      this.logger.error('Error fetching data from MOEX', error);
      throw error;
    }
  }

  async getAssetPrices(tickers: string[]): Promise<MoexAssetPrice[]> {
    try {
      const url = `${this.marketUrl}?securities=${tickers.join(',')}&iss.meta=off&iss.only=marketdata`;
      const response = await lastValueFrom(this.httpService.get<MoexMarketData>(url));
      const marketData = response.data.marketdata;

      const columns = marketData.columns;
      const dataRows = marketData.data;

      const lastPriceIndex = columns.indexOf(MoexColumnsVariants.LAST);
      const tickerIndex = columns.indexOf(MoexColumnsVariants.SECID);
      const timeIndex = columns.indexOf(MoexColumnsVariants.SYSTIME);

      return dataRows.map((row) => {
        const ticker = row[tickerIndex] as string;
        const price = row[lastPriceIndex] as number;
        const sysTime = row[timeIndex] as string;

        return {
          ticker,
          price: price?.toString() || '0',
          updatedAt: sysTime ? new Date(sysTime) : new Date(),
        };
      });
    } catch (error) {
      this.logger.error('Error fetching asset prices from MOEX', error);
      throw error;
    }
  }

  async getAssetHistory(
    ticker: string,
    from: string,
    to: string,
  ): Promise<MoexAssetHistoryPrice[]> {
    try {
      const url = `${this.historyBaseUrl}/${ticker}.json?from=${from}&till=${to}&iss.meta=off&iss.only=history`;
      const response = await lastValueFrom(this.httpService.get<MoexHistoryData>(url));
      const historyData = response.data.history;

      const columns = historyData.columns;
      const dataRows = historyData.data;

      const dateIndex = columns.indexOf(MoexHistoryColumns.TRADEDATE);
      const openIndex = columns.indexOf(MoexHistoryColumns.OPEN);
      const highIndex = columns.indexOf(MoexHistoryColumns.HIGH);
      const lowIndex = columns.indexOf(MoexHistoryColumns.LOW);
      const closeIndex = columns.indexOf(MoexHistoryColumns.CLOSE);
      const volumeIndex = columns.indexOf(MoexHistoryColumns.VOLUME);

      return dataRows.map((row) => ({
        ticker,
        date: new Date(row[dateIndex] as string),
        open: (row[openIndex] as number)?.toString() || '0',
        high: (row[highIndex] as number)?.toString() || '0',
        low: (row[lowIndex] as number)?.toString() || '0',
        close: (row[closeIndex] as number)?.toString() || '0',
        volume: (row[volumeIndex] as number)?.toString() || '0',
      }));
    } catch (error) {
      this.logger.error(`Error fetching history for ${ticker} from MOEX`, error);
      throw error;
    }
  }
}
