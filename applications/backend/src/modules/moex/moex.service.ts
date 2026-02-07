import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AssetType, DateString } from '@packages/types';
import { lastValueFrom } from 'rxjs';

import {
  MoexAssetHistoryPrice,
  MoexColumnsVariants,
  MoexHistoryColumns,
  MoexHistoryData,
  MoexMarketData,
} from '@/modules/moex/moex.types';

// https://iss.moex.com/iss/reference/

const CURRENCY = 'RUB';

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

    // const res = await this.getPrices(['SBER', 'GAZP']);
    //
    // this.logger.log(res);
  }

  async getPrices(tickers: string[]): Promise<MoexAssetHistoryPrice[]> {
    try {
      const url = `${this.marketUrl}?securities=${tickers.join(',')}&iss.meta=off&iss.only=marketdata`;

      const response = await lastValueFrom(this.httpService.get<MoexMarketData>(url));
      const marketData = response.data.marketdata;

      this.logger.log(`Fetched ${tickers.length} prices from MOEX`);

      const columns = marketData.columns;
      const dataRows = marketData.data;

      const tickerIndex = columns.indexOf(MoexColumnsVariants.SECID);
      const timeIndex = columns.indexOf(MoexColumnsVariants.SYSTIME);
      const openIndex = columns.indexOf(MoexColumnsVariants.OPEN);
      const lowIndex = columns.indexOf(MoexColumnsVariants.LOW);
      const highIndex = columns.indexOf(MoexColumnsVariants.HIGH);
      const lastPriceIndex = columns.indexOf(MoexColumnsVariants.LAST);
      const volumeIndex = columns.indexOf(MoexColumnsVariants.VALTODAY);

      return dataRows.map((row) => {
        const ticker = row[tickerIndex] as string;
        const lastPrice = row[lastPriceIndex] as number;
        const sysTime = row[timeIndex] as string;

        return {
          symbol: ticker,
          date: sysTime ? new Date(sysTime) : new Date(),
          open: (row[openIndex] as number)?.toString() || lastPrice?.toString() || '0',
          high: (row[highIndex] as number)?.toString() || lastPrice?.toString() || '0',
          low: (row[lowIndex] as number)?.toString() || lastPrice?.toString() || '0',
          close: lastPrice?.toString() || '0',
          volume: (row[volumeIndex] as number)?.toString() || '0',
          currencyCode: CURRENCY,
          type: AssetType.STOCK,
        };
      });
    } catch (error) {
      this.logger.error('Error fetching data from MOEX', error);
      throw error;
    }
  }

  async getAssetHistory(
    ticker: string,
    from: DateString,
    to: DateString,
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
        symbol: ticker,
        date: new Date(row[dateIndex] as string),
        open: (row[openIndex] as number)?.toString() || '0',
        high: (row[highIndex] as number)?.toString() || '0',
        low: (row[lowIndex] as number)?.toString() || '0',
        close: (row[closeIndex] as number)?.toString() || '0',
        volume: (row[volumeIndex] as number)?.toString() || '0',
        currencyCode: CURRENCY,
        type: AssetType.STOCK,
      }));
    } catch (error) {
      this.logger.error(`Error fetching history for ${ticker} from MOEX`, error);
      throw error;
    }
  }
}
