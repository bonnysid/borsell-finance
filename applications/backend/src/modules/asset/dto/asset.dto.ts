import { AssetDtoShape, AssetMetadata, AssetType } from '@packages/types';

import { AssetEntity } from '@/modules';

export class AssetDto implements AssetDtoShape {
  createdAt: string;
  updatedAt: string;
  portfolioId: string;
  currencyCode: string;
  metadata: AssetMetadata;
  averageBuyPrice: number;
  quantity: number;
  cachedMarketPrice: number;
  lastPriceUpdateAt: string;
  id: string;
  name: string;
  type: AssetType;

  constructor(asset: AssetEntity) {
    this.id = asset.id;
    this.portfolioId = asset.portfolioId;
    this.currencyCode = asset.currencyCode;
    this.metadata = asset.metadata;
    this.averageBuyPrice = asset.averageBuyPrice;
    this.quantity = asset.quantity;
    this.createdAt = asset.createdAt;
    this.updatedAt = asset.updatedAt;
    this.cachedMarketPrice = asset.cachedMarketPrice;
    this.lastPriceUpdateAt = asset.lastPriceUpdateAt;
    this.type = asset.type;
    this.name = asset.name;
  }
}
