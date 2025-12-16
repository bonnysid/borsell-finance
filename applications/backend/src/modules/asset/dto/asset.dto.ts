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
  metadata: AssetMetadata;
  cachedMarketPrice: NumberString;

  currencyCode: CurrencyCode;

  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;

  constructor(asset: AssetEntity) {
    this.id = asset.id;

    this.type = asset.type;
    this.name = asset.name;
    this.metadata = asset.metadata;
    this.cachedMarketPrice = asset.cachedMarketPrice;

    this.currencyCode = asset.currencyCode;

    this.lastPriceUpdateAt = asset.lastPriceUpdateAt;
    this.createdAt = asset.createdAt;
    this.updatedAt = asset.updatedAt;
  }
}
