import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AssetType, DateString } from '@packages/types';
import Big from 'big.js';
import { lastValueFrom } from 'rxjs';

import {
  MoexAssetHistoryPrice,
  MoexAssetInfo,
  MoexAssetInfoResponse,
  MoexBlock,
  MoexColumnsVariants,
  MoexColumnValue,
  MoexHistoryData,
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

  async getAssetInfo(ticker: string) {
    try {
      this.logger.log(`Fetching info for ${ticker}`);

      const boardsUrl = `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?iss.meta=off&iss.only=securities`;
      const boardsData = await lastValueFrom(this.httpService.get(boardsUrl));

      const securities = boardsData.data.securities;

      if (!securities || !securities.data.length) return null;

      return this._mapData(boardsData.data, (row, idx) => ({
        ticker: row[idx[MoexColumnsVariants.SECID]],
        name: row[idx[MoexColumnsVariants.SEQNAME]], // "Сбербанк России ПАО ао"
        shortName: row[idx[MoexColumnsVariants.SHORTNAME]], // "Сбербанк"
        lotSize: row[idx[MoexColumnsVariants.LOTSIZE]], // Например, 10
        isin: row[idx[MoexColumnsVariants.ISIN]], // Уникальный код (RU0009029540)
      }))[0];
    } catch (error) {
      this.logger.warn(`Info not found for ${ticker}`);
      return null;
    }
  }

  async getAssetHistory(
    ticker: string,
    from: DateString,
    to: DateString,
  ): Promise<MoexAssetHistoryPrice[]> {
    try {
      this.logger.log(`Fetching history for ${ticker}`);

      const url = `${this.historyBaseUrl}/${ticker}.json?from=${from}&till=${to}&iss.meta=off&iss.only=history`;
      const response = await lastValueFrom(this.httpService.get<MoexHistoryData>(url));
      const historyData = response.data.history;

      return this._mapData(historyData, (row, idx) => ({
        symbol: ticker,
        date: new Date(row[idx[MoexColumnsVariants.TRADEDATE]] as string),
        open: (row[idx[MoexColumnsVariants.OPEN]] as number)?.toString() || '0',
        high: (row[idx[MoexColumnsVariants.HIGH]] as number)?.toString() || '0',
        low: (row[idx[MoexColumnsVariants.LOW]] as number)?.toString() || '0',
        close: (row[idx[MoexColumnsVariants.CLOSEPRICE]] as number)?.toString() || '0',
        prevWaPrice: (row[idx[MoexColumnsVariants.PREVWAPRICE]] as number)?.toString() || '0',
        volume: (row[idx[MoexColumnsVariants.VOLUME]] as number)?.toString() || '0',
        currencyCode: CURRENCY,
        changePercent: (row[idx[MoexColumnsVariants.LASTCHANGEPRCNT]] as number)?.toString() || '0',
        type: AssetType.STOCK,
      }));
    } catch (error) {
      this.logger.error(`Error fetching history for ${ticker}`, error);
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
