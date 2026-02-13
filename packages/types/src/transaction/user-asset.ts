import {
  AssetDtoShape,
  AssetMetadata,
  AssetType,
  CurrencyCode,
  DateString,
  ID,
  NumberString,
} from '@packages/types';

export type UserAssetDtoShape = {
  id: ID;

  asset: AssetDtoShape;

  currencyCode: CurrencyCode;
  quantity: NumberString;
  avgBuyPrice: NumberString;
  costBasis: NumberString;
  cost: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;
  unrealizedPnl: NumberString;

  note?: string;
  meta?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
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
