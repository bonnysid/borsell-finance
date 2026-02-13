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
  cachedMarketPrice: NumberString;

  currencyCode: CurrencyCode;

  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
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
