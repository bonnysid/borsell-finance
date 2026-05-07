import {
  AssetDtoShape,
  AssetMetadata,
  AssetType,
  CurrencyCode,
  DateString,
  ID,
  NumberString,
} from '@packages/types';

import { AssetEntity } from '../entities';

export class AssetDto implements AssetDtoShape {
  id: ID;

  type: AssetType;
  name: string;
  symbol: string;
  metadata: AssetMetadata;
  moexEngineName?: string | null;
  moexMarketName?: string | null;
  moexBoardId?: string | null;
  moexSecurityId?: string | null;

  currencyCode: CurrencyCode;
  cachedMarketPrice: NumberString;
  volume: NumberString;
  changePercent1h: NumberString;
  changePercent24h: NumberString;
  changePercent7d: NumberString;

  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;

  constructor(asset: AssetEntity) {
    this.id = asset.id;

    this.type = asset.type;
    this.name = asset.name;
    this.symbol = asset.symbol;
    this.metadata = asset.metadata;
    this.moexEngineName = asset.moexEngineName;
    this.moexMarketName = asset.moexMarketName;
    this.moexBoardId = asset.moexBoardId;
    this.moexSecurityId = asset.moexSecurityId;
    this.cachedMarketPrice = asset.cachedMarketPrice;
    this.volume = asset.volume;
    this.changePercent1h = asset.changePercent1h;
    this.changePercent24h = asset.changePercent24h;
    this.changePercent7d = asset.changePercent7d;

    this.currencyCode = asset.currencyCode;

    this.lastPriceUpdateAt = asset.lastPriceUpdateAt.toISOString();
    this.createdAt = asset.createdAt.toISOString();
    this.updatedAt = asset.updatedAt.toISOString();
  }
}
