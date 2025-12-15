import { DateString, ID, NumberString } from '../shared';
import { AssetMetadata } from './metadata';

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
  metadata: AssetMetadata;
  cachedMarketPrice: NumberString;
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

  source: string;

  date: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};
