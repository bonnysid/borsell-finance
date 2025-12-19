import { CurrencyCode } from '../currency';
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

  currencyCode: CurrencyCode;

  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};

export type UserAssetDtoShape = {
  id: ID;

  asset: AssetDtoShape;

  currencyCode: CurrencyCode;
  quantity: NumberString;
  avgBuyPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;

  note?: string;
  meta?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
};

export type PortfolioAssetDtoShape = {
  id: ID;

  portfolioId: ID;
  userAsset: UserAssetDtoShape;

  createdAt: DateString;
  updatedAt: DateString;
};

export type CreateUserAssetDtoShape = {
  assetId: ID;
  currencyCode?: CurrencyCode;
  type: UserAssetOperationType;
  quantity: number;
  amount: number;
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

export type UserAssetInfoItemDtoShape = {
  id: ID;
  quantity: NumberString;
  buyPrice: NumberString;
  currencyCode: CurrencyCode;
  createdAt: DateString;
  updatedAt: DateString;
};

export type UserAssetInfoDtoShape = {
  assetId: ID;
  quantity: NumberString;
  buyPrice: NumberString;

  type: AssetType;
  name: string;
  metadata: AssetMetadata;
  cachedMarketPrice: NumberString;

  currencyCode: CurrencyCode;

  lastPriceUpdateAt: DateString;

  userAssets: UserAssetInfoItemDtoShape[];
};

export enum UserAssetOperationType {
  BUY = 'BUY',
  SELL = 'SELL',
  TRANSFER_OUT = 'TRANSFER_OUT',
}
