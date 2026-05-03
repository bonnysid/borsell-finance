import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AssetType } from '@packages/types';
import Big from 'big.js';
import { lastValueFrom } from 'rxjs';

import { formatDateToSqlDate } from '@/common';
import {
  MoexAssetHistoryPrice,
  MoexAssetInfo,
  MoexAssetInfoWithPriceResponse,
  MoexChartResponse,
} from '@/modules/moex/moex.types';
import { MoexMapperService } from '@/modules/moex/services/moex-mapper.service';

type GetFondCandlesOptions = {
  interval?: '24';
} & (
  | {
      isFromTo: true;
      from: Date;
      to: Date;
    }
  | {
      isFromTo?: false;
      candles?: number;
    }
);

@Injectable()
export class MoexStockService {
  private readonly logger = new Logger(MoexStockService.name);
  private readonly baseUrl = 'https://iss.moex.com';
  private readonly board = 'TQBR';
  private readonly marketUrl =
    `${this.baseUrl}/iss/engines/stock/markets/shares/boards/${this.board}`;
  private readonly marketCandlesUrl =
    `${this.baseUrl}/cs/engines/stock/markets/shares/boardgroups/57`;
  public readonly CURRENCY = 'RUB';
  public readonly ASSET_TYPE = AssetType.STOCK;

  constructor(
    private readonly httpService: HttpService,
    private readonly mapper: MoexMapperService,
  ) {}

  async getRequest<T>(url: string) {
    try {
      this.logger.log(`Request url: ${url}`);

      return await lastValueFrom(this.httpService.get<T>(url));
    } catch (e) {
      this.logger.error(`Request error: ${e.message}`);
      return null;
    }
  }

  async getStocksInfo(tickers: string[]): Promise<MoexAssetInfo[]> {
    this.logger.log(`Fetching info for ${tickers.length} tickers count`);

    try {
      const url = `${this.marketUrl}/securities.json?iss.meta=off&securities=${tickers.join(',')}&iss.only=securities,marketdata&iss.json=extended`;

      const response = await this.getRequest<MoexAssetInfoWithPriceResponse>(url);

      const securities = response?.data?.[1].securities;
      const marketdata = response?.data?.[1].marketdata;

      if (!securities || !marketdata) {
        return [];
      }

      return marketdata.map((marketItem) => {
        const securityItem = securities.find((s) => s.SECID === marketItem.SECID);

        return {
          symbol: this.mapper.mapString(marketItem.SECID),
          name: this.mapper.mapString(securityItem?.SECNAME || securityItem?.SEQNAME),
          shortName: this.mapper.mapString(securityItem?.SHORTNAME),
          isin: this.mapper.mapString(securityItem?.ISIN),
          lotSize: this.mapper.mapPrice(securityItem?.LOTSIZE),
          issueCapitalization: this.mapper.mapPrice(securityItem?.ISSUECAPITALIZATION),

          lastPrice: this.mapper.mapPrice(marketItem.LAST || marketItem.MARKETPRICE),
          open: this.mapper.mapPrice(marketItem.OPEN || marketItem.MARKETPRICE),
          high: this.mapper.mapPrice(marketItem.HIGH || marketItem.MARKETPRICE),
          low: this.mapper.mapPrice(marketItem.LOW || marketItem.MARKETPRICE),
          close: this.mapper.mapPrice(marketItem.CLOSEPRICE || marketItem.MARKETPRICE),
          volume: this.mapper.mapPrice(marketItem.VOLTODAY || marketItem.VOLUME),
          valToday: this.mapper.mapPrice(marketItem.VALTODAY),
          changePercent: this.mapper.mapPrice(marketItem.LASTCHANGEPRCNT),

          date: this.mapper.mapDate(marketItem.SYSTIME) ?? new Date(),
          currencyCode: this.CURRENCY,
          type: this.ASSET_TYPE,
          moexData: { ...securityItem, ...marketItem },
        };
      });
    } catch (e) {
      this.logger.error(e);

      return [];
    }
  }

  async getStockInfo(ticker: string): Promise<MoexAssetInfo | null> {
    this.logger.log(`Fetching info for ${ticker}`);

    try {
      const url = `${this.marketUrl}/securities/${ticker}.json?iss.meta=off&iss.json=extended&iss.only=securities,marketdata`;

      const response = await this.getRequest<MoexAssetInfoWithPriceResponse>(url);

      const securitiesData = response?.data[1]?.securities?.[0];
      const marketData = response?.data[1].marketdata?.[0];

      if (!securitiesData && !marketData) return null;

      return {
        symbol: this.mapper.mapString(securitiesData?.SECID || marketData?.SECID),
        name: this.mapper.mapString(securitiesData?.SEQNAME),
        shortName: this.mapper.mapString(securitiesData?.SHORTNAME),
        isin: this.mapper.mapString(securitiesData?.ISIN),
        lotSize: this.mapper.mapPrice(securitiesData?.LOTSIZE),
        issueCapitalization: this.mapper.mapPrice(securitiesData?.ISSUECAPITALIZATION),

        lastPrice: this.mapper.mapPrice(marketData?.LAST || marketData?.MARKETPRICE),
        open: this.mapper.mapPrice(marketData?.OPEN || marketData?.MARKETPRICE),
        high: this.mapper.mapPrice(marketData?.HIGH || marketData?.MARKETPRICE),
        low: this.mapper.mapPrice(marketData?.LOW || marketData?.MARKETPRICE),
        close: this.mapper.mapPrice(marketData?.CLOSE || marketData?.MARKETPRICE),
        volume: this.mapper.mapPrice(marketData?.VOLTODAY || marketData?.VOLUME), // В штуках
        valToday: this.mapper.mapPrice(marketData?.VALTODAY), // В рублях (оборот)
        changePercent: this.mapper.mapPrice(marketData?.LASTCHANGEPRCNT),

        date: this.mapper.mapDate(marketData?.SYSTIME) ?? new Date(),
        currencyCode: this.CURRENCY,
        type: this.ASSET_TYPE,
        moexData: { ...securitiesData, ...marketData },
      };
    } catch (e) {
      this.logger.error(e);

      return null;
    }
  }

  async getStockCandles(
    ticker: string,
    options?: GetFondCandlesOptions,
  ): Promise<MoexAssetHistoryPrice[]> {
    this.logger.log(`Fetching history for ${ticker}`);

    const interval = options?.interval ?? '24';

    const query = new URLSearchParams();

    query.set('interval', interval);

    if (options?.isFromTo) {
      query.set('from', formatDateToSqlDate(options.from));
      query.set('to', formatDateToSqlDate(options.to));
    } else {
      query.set('canldes', String(options?.candles ?? 500));
    }

    this.logger.log(`Fetching history for ${ticker}, query: ${query}`);

    try {
      const url = `${this.marketCandlesUrl}/securities/${ticker}.hs?iss.meta=off&s1.type=candles&${query}`;

      const response = await this.getRequest<MoexChartResponse>(url);

      const candlesData = response?.data.candles?.[0]?.data || [];
      const volumesData = response?.data.volumes?.[0]?.data || [];

      const volumeMap = new Map<number, number>();

      for (const [timestamp, volume] of volumesData) {
        volumeMap.set(timestamp, volume);
      }

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
          currencyCode: this.CURRENCY,
        };
      });

      return this.mapper.fillHistoryGaps(history);
    } catch (e) {
      this.logger.error(e);

      return [];
    }
  }

  async getTopStocks(): Promise<MoexAssetInfo[]> {
    this.logger.log('Fetching TOP stocks');

    try {
      const url = `${this.marketUrl}/securities.json?iss.meta=off&iss.only=securities,marketdata&iss.json=extended`;

      const response = await this.getRequest<MoexAssetInfoWithPriceResponse>(url);

      const securities = response?.data?.[1].securities;
      const marketdata = response?.data?.[1].marketdata;

      if (!securities || !marketdata) {
        return [];
      }

      return marketdata.map((marketItem) => {
        const securityItem = securities.find((s) => s.SECID === marketItem.SECID);

        return {
          symbol: this.mapper.mapString(marketItem.SECID),
          name: this.mapper.mapString(securityItem?.SECNAME || securityItem?.SEQNAME),
          shortName: this.mapper.mapString(securityItem?.SHORTNAME),
          isin: this.mapper.mapString(securityItem?.ISIN),
          lotSize: this.mapper.mapPrice(securityItem?.LOTSIZE),
          issueCapitalization: this.mapper.mapPrice(securityItem?.ISSUECAPITALIZATION),

          lastPrice: this.mapper.mapPrice(marketItem.LAST),
          open: this.mapper.mapPrice(marketItem.OPEN),
          high: this.mapper.mapPrice(marketItem.HIGH),
          low: this.mapper.mapPrice(marketItem.LOW),
          close: this.mapper.mapPrice(marketItem.CLOSEPRICE),
          volume: this.mapper.mapPrice(marketItem.VOLTODAY || marketItem.VOLUME),
          valToday: this.mapper.mapPrice(marketItem.VALTODAY),
          changePercent: this.mapper.mapPrice(marketItem.LASTCHANGEPRCNT),

          date: this.mapper.mapDate(marketItem.SYSTIME) ?? new Date(),
          currencyCode: this.CURRENCY,
          type: this.ASSET_TYPE,
          moexData: { ...securityItem, ...marketItem },
        };
      });
    } catch (e) {
      this.logger.error(e);

      return [];
    }
  }
}
