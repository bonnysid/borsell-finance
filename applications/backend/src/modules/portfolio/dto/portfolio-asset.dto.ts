import { DateString, ID, PortfolioAssetDtoShape } from '@packages/types';

import { AssetDto, PortfolioAssetEntity } from '@/modules';

export class PortfolioAssetDto implements PortfolioAssetDtoShape {
  id: ID;
  portfolioId: ID;
  asset: AssetDto;
  quantity: number;
  buyPrice: number;
  createdAt: DateString;
  updatedAt: DateString;

  constructor(portfolioAsset: PortfolioAssetEntity) {
    this.id = portfolioAsset.id;
    this.asset = new AssetDto(portfolioAsset.asset);
    this.quantity = portfolioAsset.quantity;
    this.buyPrice = portfolioAsset.buyPrice;
    this.createdAt = portfolioAsset.createdAt;
    this.updatedAt = portfolioAsset.updatedAt;
  }
}
