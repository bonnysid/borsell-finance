import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AssetType, DateString } from '@packages/types';
import Big from 'big.js';
import { addDays, differenceInDays } from 'date-fns';
import { lastValueFrom } from 'rxjs';

import { formatDateToSqlDate } from '@/common/utils/date.utils';
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

  async getSecurityData(tickers: string[]): Promise<MoexAssetInfo[]> {
    this.logger.log(`Fetching security data for ${tickers.length} tickers`);

    if (tickers.length === 0) return [];

    try {
      const url = `${this.marketUrl}?securities=${tickers.join(',')}&iss.meta=off&iss.json=extended&iss.only=securities,marketdata`;

      const response = await lastValueFrom(
        this.httpService.get<MoexAssetInfoWithPriceResponse>(url),
      );

      const securities = response.data[1].securities;
      const marketdata = response.data[1].marketdata;

      return marketdata.map((marketItem) => {
        const securityItem = securities.find((s) => s.SECID === marketItem.SECID);

        return {
          symbol: this._mapString(marketItem.SECID),
          name: this._mapString(securityItem?.SECNAME || securityItem?.SEQNAME),
          shortName: this._mapString(securityItem?.SHORTNAME),
          isin: this._mapString(securityItem?.ISIN),
          lotSize: this._mapPrice(securityItem?.LOTSIZE),
          issueCapitalization: this._mapPrice(securityItem?.ISSUECAPITALIZATION),

          lastPrice: this._mapPrice(marketItem.LAST),
          open: this._mapPrice(marketItem.OPEN),
          high: this._mapPrice(marketItem.HIGH),
          low: this._mapPrice(marketItem.LOW),
          close: this._mapPrice(marketItem.CLOSEPRICE),
          volume: this._mapPrice(marketItem.VOLTODAY || marketItem.VOLUME),
          valToday: this._mapPrice(marketItem.VALTODAY),
          changePercent: this._mapPrice(marketItem.LASTCHANGEPRCNT),

          date: this._mapDate(marketItem.SYSTIME) ?? new Date(),
          currencyCode: CURRENCY,
          type: AssetType.STOCK,
          moexData: { ...securityItem, ...marketItem },
        };
      });
    } catch (error) {
      this.logger.error('Error fetching security data', error);
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

    const infoMap = this._mapData(securities, (getValue, row) => {
      const symbol = this._mapString(getValue(MoexColumnsVariants.SECID));
      const name = this._mapString(getValue(MoexColumnsVariants.SEQNAME));
      const shortName = this._mapString(getValue(MoexColumnsVariants.SHORTNAME));
      const lotSize = this._mapPrice(getValue(MoexColumnsVariants.LOTSIZE));
      const isin = this._mapString(getValue(MoexColumnsVariants.ISIN));
      const prevWaPrice = this._mapPrice(getValue(MoexColumnsVariants.PREVWAPRICE));
      const prevDate = this._mapDate(getValue(MoexColumnsVariants.PREVDATE));

      const rawData = securities.columns.reduce(
        (acc, col, idx) => {
          acc[col] = row[idx];
          return acc;
        },
        {} as Record<string, any>,
      );

      return {
        symbol,
        name,
        shortName,
        lotSize,
        isin,
        prevWaPrice,
        prevDate,
        rawData,
      };
    });

    const priceMap = this._mapData(marketData, (getValue, row) => {
      const symbol = this._mapString(getValue(MoexColumnsVariants.SECID));
      const lastPrice = this._mapPrice(getValue(MoexColumnsVariants.LAST));
      const date = this._mapDate(getValue(MoexColumnsVariants.SYSTIME)) ?? new Date();
      const open = this._mapPrice(getValue(MoexColumnsVariants.OPEN));
      const high = this._mapPrice(getValue(MoexColumnsVariants.HIGH));
      const low = this._mapPrice(getValue(MoexColumnsVariants.LOW));
      const close = this._mapPrice(getValue(MoexColumnsVariants.CLOSEPRICE));
      const volume = this._mapPrice(
        getValue(MoexColumnsVariants.VOLUME) || getValue(MoexColumnsVariants.VOLTODAY),
      );
      const changePercent = this._mapPrice(getValue(MoexColumnsVariants.LASTCHANGEPRCNT));

      const rawData = marketData.columns.reduce(
        (acc, col, idx) => {
          acc[col] = row[idx];
          return acc;
        },
        {} as Record<string, any>,
      );

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
        rawData,
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
        moexData: { ...info?.rawData, ...priceInfo.rawData },
      };
    });
  }

  async getAssetInfo(ticker: string): Promise<MoexAssetInfo | null> {
    try {
      this.logger.log(`Fetching info for ${ticker}`);

      const boardsUrl = `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?iss.meta=off&iss.json=extended&iss.only=securities,marketdata`;
      const response = await lastValueFrom(
        this.httpService.get<MoexAssetInfoWithPriceResponse>(boardsUrl),
      );

      const securitiesData = response.data[1]?.securities?.[0];
      const marketData = response.data[1].marketdata[0];

      if (!securitiesData && !marketData) return null;

      return {
        symbol: this._mapString(securitiesData?.SECID || marketData?.SECID),
        name: this._mapString(securitiesData?.SEQNAME),
        shortName: this._mapString(securitiesData?.SHORTNAME),
        isin: this._mapString(securitiesData?.ISIN),
        lotSize: this._mapPrice(securitiesData?.LOTSIZE),
        issueCapitalization: this._mapPrice(securitiesData?.ISSUECAPITALIZATION),

        lastPrice: this._mapPrice(marketData?.LAST),
        open: this._mapPrice(marketData?.OPEN),
        high: this._mapPrice(marketData?.HIGH),
        low: this._mapPrice(marketData?.LOW),
        close: this._mapPrice(marketData?.CLOSE),
        volume: this._mapPrice(marketData?.VOLTODAY || marketData?.VOLUME), // В штуках
        valToday: this._mapPrice(marketData?.VALTODAY), // В рублях (оборот)
        changePercent: this._mapPrice(marketData?.LASTCHANGEPRCNT),

        date: this._mapDate(marketData?.SYSTIME) ?? new Date(),
        currencyCode: CURRENCY,
        type: AssetType.STOCK,
        moexData: { ...securitiesData, ...marketData },
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
      const history = candlesData.map(([timestamp, open, high, low, close]) => {
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

      return this._fillHistoryGaps(history);
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
      const history = candlesData.map(([timestamp, open, high, low, close]) => {
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

      return this._fillHistoryGaps(history);
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

  private _mapPrice(value?: MoexColumnValue) {
    return new Big(value ?? 0);
  }

  private _mapDate(value?: MoexColumnValue) {
    if (value === null || !value) return null;

    return new Date(value);
  }

  private _mapString(value?: MoexColumnValue) {
    return value ? String(value) : '';
  }

  private _fillHistoryGaps(history: MoexAssetHistoryPrice[]): MoexAssetHistoryPrice[] {
    if (history.length === 0) return [];

    const result: MoexAssetHistoryPrice[] = [];
    const seenDates = new Set<string>();

    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const currentDate = formatDateToSqlDate(current.date);

      // Пропускаем дубликаты, оставляя последний (так как история обычно ASC)
      if (seenDates.has(currentDate)) {
        // Если дата уже была, заменяем последнее значение (для надежности, если MOEX отдал несколько цен за день)
        const lastIndex = result.findLastIndex((r) => formatDateToSqlDate(r.date) === currentDate);
        if (lastIndex !== -1) {
          result[lastIndex] = { ...current, date: new Date(currentDate) };
        }
        continue;
      }

      if (result.length > 0) {
        const prev = result[result.length - 1];
        const prevDate = formatDateToSqlDate(prev.date);

        const diffDays = differenceInDays(currentDate, prevDate);

        if (diffDays > 1) {
          for (let j = 1; j < diffDays; j++) {
            const missingDate = addDays(prevDate, j);
            result.push({
              symbol: prev.symbol,
              close: prev.close,
              open: prev.close,
              low: prev.close,
              high: prev.close,
              currencyCode: prev.currencyCode,
              date: missingDate,
              volume: new Big(0),
              isSynthesized: true,
            });
          }
        }
      }

      result.push({ ...current, date: new Date(currentDate) });
      seenDates.add(currentDate);
    }

    return result;
  }
}
