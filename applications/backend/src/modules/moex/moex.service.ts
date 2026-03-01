import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AssetType, DateString } from '@packages/types';
import Big from 'big.js';
import { lastValueFrom } from 'rxjs';

import {
  MoexAssetHistoryPrice,
  MoexAssetInfo,
  MoexAssetInfoResponse,
  MoexAssetInfoWithPriceResponse,
  MoexBlock,
  MoexChartResponse,
  MoexColumnsVariants,
  MoexColumnValue,
} from '@/modules/moex/moex.types';

// https://iss.moex.com/iss/reference/

const CURRENCY = 'RUB';

@Injectable()
export class MoexService {
  private readonly logger = new Logger(MoexService.name);
  private readonly baseUrl = 'https://iss.moex.com/iss';
  private readonly marketUrl =
    `${this.baseUrl}/engines/stock/markets/shares/boards/TQBR/securities.json`;
  private readonly historyBaseUrl =
    `${this.baseUrl}/history/engines/stock/markets/shares/boards/TQBR/securities`;

  constructor(private readonly httpService: HttpService) {}

  async getMarketData(tickers: string[]): Promise<MoexAssetInfo[]> {
    this.logger.log(`Fetching prices for ${tickers.length} tickers`);

    if (tickers.length === 0) return [];

    try {
      const url = `${this.marketUrl}?securities=${tickers.join(',')}&iss.meta=off&iss.only=securities,marketdata`;

      const response = await lastValueFrom(this.httpService.get<MoexAssetInfoResponse>(url));
      return this._parseMarketDataResponse(response.data);
    } catch (error) {
      this.logger.error('Error fetching data', error);
      throw error;
    }
  }

  async getTopTickers(limit = 100): Promise<string[]> {
    try {
      this.logger.log(`Fetching top ${limit} tickers from MOEX`);

      const url = `${this.marketUrl}?iss.meta=off&iss.only=marketdata`;
      const response = await lastValueFrom(this.httpService.get<MoexAssetInfoResponse>(url));
      const marketData = response.data.marketdata;

      const tickersWithCap = this._mapData(marketData, (getValue) => {
        const symbol = this._mapString(getValue(MoexColumnsVariants.SECID));
        const capitalization = this._mapPrice(getValue(MoexColumnsVariants.ISSUECAPITALIZATION));
        return { symbol, capitalization };
      });

      return tickersWithCap
        .sort((a, b) => (b.capitalization.gt(a.capitalization) ? 1 : -1))
        .slice(0, limit)
        .map((t) => t.symbol);
    } catch (error) {
      this.logger.error('Error fetching top tickers', error);
      return [];
    }
  }

  private _parseMarketDataResponse(data: MoexAssetInfoResponse): MoexAssetInfo[] {
    const marketData = data.marketdata;
    const securities = data.securities;

    const infoMap = this._mapData(securities, (getValue) => {
      const symbol = this._mapString(getValue(MoexColumnsVariants.SECID));
      const name = this._mapString(getValue(MoexColumnsVariants.SEQNAME));
      const shortName = this._mapString(getValue(MoexColumnsVariants.SHORTNAME));
      const lotSize = this._mapPrice(getValue(MoexColumnsVariants.LOTSIZE));
      const isin = this._mapString(getValue(MoexColumnsVariants.ISIN));
      const prevWaPrice = this._mapPrice(getValue(MoexColumnsVariants.PREVWAPRICE));
      const prevDate = this._mapDate(getValue(MoexColumnsVariants.PREVDATE));

      return {
        symbol,
        name,
        shortName,
        lotSize,
        isin,
        prevWaPrice,
        prevDate,
      };
    });

    const priceMap = this._mapData(marketData, (getValue) => {
      const symbol = this._mapString(getValue(MoexColumnsVariants.SECID));
      const lastPrice = this._mapPrice(getValue(MoexColumnsVariants.LAST));
      const date = this._mapDate(getValue(MoexColumnsVariants.SYSTIME)) ?? new Date();
      const open = this._mapPrice(getValue(MoexColumnsVariants.OPEN));
      const high = this._mapPrice(getValue(MoexColumnsVariants.HIGH));
      const low = this._mapPrice(getValue(MoexColumnsVariants.LOW));
      const close = this._mapPrice(getValue(MoexColumnsVariants.CLOSEPRICE));
      const volume = this._mapPrice(getValue(MoexColumnsVariants.VOLUME));
      const changePercent = this._mapPrice(getValue(MoexColumnsVariants.LASTCHANGEPRCNT));

      return {
        symbol,
        lastPrice,
        date,
        open,
        high,
        low,
        close,
        volume,
        changePercent,
      };
    });

    return priceMap.map((priceInfo) => {
      const info = infoMap.find((p) => p.symbol === priceInfo.symbol);

      return {
        ...info,
        ...priceInfo,
        lastPrice: priceInfo?.lastPrice,
        currencyCode: CURRENCY,
        type: AssetType.STOCK,
      };
    });
  }

  async getAssetInfo(ticker: string): Promise<MoexAssetInfo | null> {
    try {
      this.logger.log(`Fetching info for ${ticker}`);

      const boardsUrl = `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.jsonp?iss.meta=off&iss.json=extended&iss.only=marketdata`;
      const response = await lastValueFrom(
        this.httpService.get<MoexAssetInfoWithPriceResponse>(boardsUrl),
      );

      const marketdata = response.data[1].marketdata[0];

      if (!marketdata) return null;

      return {
        symbol: this._mapString(marketdata.SECID!),
        lastPrice: this._mapPrice(marketdata.LAST!),
        date: this._mapDate(marketdata.SYSTIME!) ?? new Date(),
        open: this._mapPrice(marketdata.OPEN!),
        high: this._mapPrice(marketdata.HIGH!),
        low: this._mapPrice(marketdata.LOW!),
        close: this._mapPrice(marketdata.CLOSE!),
        volume: this._mapPrice(marketdata.VOLUME!),
        changePercent: this._mapPrice(marketdata.LASTCHANGEPRCNT!),
        currencyCode: CURRENCY,
        type: AssetType.STOCK,
      };
    } catch (error) {
      this.logger.error(`Error fetching info for ${ticker}`, error);
      return null;
    }
  }

  async getAssetPriceCandles(ticker: string, candles = 500): Promise<MoexAssetHistoryPrice[]> {
    try {
      this.logger.log(`Fetching last ${candles} daily candles for ${ticker}`);

      // interval=24 (Дневные свечи), candles=500 (Лимит)
      const url = `https://iss.moex.com/cs/engines/stock/markets/shares/boardgroups/57/securities/${ticker}.hs?s1.type=candles&interval=24&candles=${candles}`;

      this.logger.log(`URL: ${url}`);

      const response = await lastValueFrom(this.httpService.get<MoexChartResponse>(url));

      const candlesData = response.data.candles?.[0]?.data || [];
      const volumesData = response.data.volumes?.[0]?.data || [];

      const volumeMap = new Map<number, number>();
      for (const [timestamp, volume] of volumesData) {
        volumeMap.set(timestamp, volume);
      }

      // Собираем итоговый массив
      return candlesData.map(([timestamp, open, high, low, close]) => {
        const volume = volumeMap.get(timestamp) || 0;

        return {
          symbol: ticker,
          date: new Date(timestamp), // MOEX отдает timestamp в миллисекундах
          open: new Big(open),
          high: new Big(high),
          low: new Big(low),
          close: new Big(close),
          volume: new Big(volume),
          currencyCode: CURRENCY,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching 500 candles for ${ticker}`, error);
      throw error;
    }
  }

  async getAssetHistory(
    ticker: string,
    from: DateString,
    to: DateString,
  ): Promise<MoexAssetHistoryPrice[]> {
    try {
      this.logger.log(`Fetching chart history for ${ticker}`);

      // interval=24 (1 день), interval=7 (1 неделя)
      const url = `https://iss.moex.com/cs/engines/stock/markets/shares/boardgroups/57/securities/${ticker}.hs?s1.type=candles&interval=24&from=${from}&till=${to}`;

      this.logger.log(`URL: ${url}`);

      const response = await lastValueFrom(this.httpService.get<MoexChartResponse>(url));

      const candlesData = response.data.candles?.[0]?.data || [];
      const volumesData = response.data.volumes?.[0]?.data || [];

      // Создаем словарь объемов { timestamp: volume } для быстрого поиска
      const volumeMap = new Map<number, number>();
      for (const [timestamp, volume] of volumesData) {
        volumeMap.set(timestamp, volume);
      }

      // Мапим массивы в наш стандартный формат
      return candlesData.map(([timestamp, open, high, low, close]) => {
        const volume = volumeMap.get(timestamp) || 0;

        return {
          symbol: ticker,
          // API графиков MOEX отдает timestamp в миллисекундах
          date: new Date(timestamp),
          open: new Big(open),
          high: new Big(high),
          low: new Big(low),
          close: new Big(close),
          volume: new Big(volume),
          currencyCode: CURRENCY,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching chart history for ${ticker}`, error);
      throw error;
    }
  }

  private _mapData<T>(
    block: MoexBlock,
    transform: (
      getValue: (column: MoexColumnsVariants) => MoexColumnValue,
      row: MoexColumnValue[],
    ) => T,
  ): T[] {
    const { columns, data } = block;

    const columnsMap = columns.reduce(
      (acc, col, index) => {
        acc[col] = index;
        return acc;
      },
      {} as Record<string, number>,
    );

    return data.map((row) => {
      const getValue = (column: MoexColumnsVariants): MoexColumnValue => {
        return row[columnsMap[column]];
      };

      return transform(getValue, row);
    });
  }

  private _mapPrice(value: MoexColumnValue) {
    return new Big(value ?? 0);
  }

  private _mapDate(value: MoexColumnValue) {
    if (value === null) return null;

    return new Date(value);
  }

  private _mapString(value: MoexColumnValue) {
    return value ? String(value) : '';
  }
}
