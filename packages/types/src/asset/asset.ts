import { CurrencyCode } from '../currency/index.js';
import { DateString, ID, NumberString } from '../shared/index.js';
import { AssetMetadata } from './metadata.js';

export enum AssetType {
  STOCK = 'STOCK',
  ETF = 'ETF',
  CRYPTO = 'CRYPTO',
  BOND = 'BOND',
  INDEX = 'INDEX',
  FOREX = 'FOREX',
  COMMODITY = 'COMMODITY',
  CSGO_SKIN = 'CSGO_SKIN',
  CASH = 'CASH',
  CURRENCY = 'CURRENCY',
}

export enum AssetPriceTimeframe {
  MINUTE = '1m',
  HOUR = '1h',
  DAY = '1d',
}

export type AssetDtoShape = {
  id: ID;

  type: AssetType;
  name: string;
  symbol: string;
  metadata: AssetMetadata;

  currencyCode: CurrencyCode;
  cachedMarketPrice: NumberString;
  volume: NumberString;
  changePercent1h: NumberString;
  changePercent24h: NumberString;
  changePercent7d: NumberString;

  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};

export type AssetWithHistoryDtoShape = AssetDtoShape & {
  history: AssetPriceHistoryDtoShape[];
};

export type AssetPriceHistoryDtoShape = {
  id: ID;
  timeframe: AssetPriceTimeframe;
  assetId: ID;

  openPrice: NumberString;

  highPrice: NumberString;

  lowPrice: NumberString;

  closePrice: NumberString;

  volume: NumberString;

  currencyCode: CurrencyCode;

  source: string;

  date: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};

export type AssetPriceHistoryQueryDtoShape = {
  from?: Date;
  to?: Date;
  timeframe?: AssetPriceTimeframe;
};

export type AssetCandlesQueryDtoShape = {
  candles?: number;
};

export type AssetPriceDtoShape = {
  symbol: string;
  currentPrice: NumberString;
  previousPrice: NumberString;
  currencyCode: CurrencyCode;
  change: NumberString;
  changePercent: NumberString;
  lastUpdateAt: DateString;
};
