import { AssetDtoShape, AssetMetadata, AssetType, DateString, ID } from '@packages/types';

import { AssetEntity } from '@/modules';

export class AssetDto implements AssetDtoShape {
  id: ID;
  createdAt: DateString;
  updatedAt: DateString;
  metadata: AssetMetadata;
  cachedMarketPrice: number;
  lastPriceUpdateAt: DateString;
  name: string;
  type: AssetType;

  constructor(asset: AssetEntity) {
    this.id = asset.id;
    this.metadata = asset.metadata;
    this.createdAt = asset.createdAt;
    this.updatedAt = asset.updatedAt;
    this.cachedMarketPrice = asset.cachedMarketPrice;
    this.lastPriceUpdateAt = asset.lastPriceUpdateAt;
    this.type = asset.type;
    this.name = asset.name;
  }
}
