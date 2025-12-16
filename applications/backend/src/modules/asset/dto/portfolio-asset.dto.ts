import { DateString, ID, PortfolioAssetDtoShape, UserAssetDtoShape } from '@packages/types';

import { UserAssetDto } from '@/modules/asset/dto/user-asset.dto';

import { PortfolioAssetEntity } from '../entities';

export class PortfolioAssetDto implements PortfolioAssetDtoShape {
  id: ID;

  portfolioId: ID;
  userAsset: UserAssetDtoShape;

  createdAt: DateString;
  updatedAt: DateString;

  constructor(portfolioAsset: PortfolioAssetEntity) {
    this.id = portfolioAsset.id;

    this.portfolioId = portfolioAsset.portfolio.id;
    this.userAsset = new UserAssetDto(portfolioAsset.userAsset);

    this.createdAt = portfolioAsset.createdAt;
    this.updatedAt = portfolioAsset.updatedAt;
  }
}
