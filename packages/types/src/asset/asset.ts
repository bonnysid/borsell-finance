import { DateString, ID } from '../shared';
import { AssetMetadata } from './metadata';

export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  BOND = 'BOND',
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
  cachedMarketPrice: number;
  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};

export type AssetPriceHistoryDtoShape = {
  id: ID;
  timeframe: AssetPriceTimeframe;
  assetId: ID;

  openPrice: number;

  highPrice: number;

  lowPrice: number;

  closePrice: number;

  volume: number;

  source: string;

  date: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};
