import { DateString, ID, PortfolioAssetDtoShape, UserAssetDtoShape } from '@packages/types';

import { UserAssetDto } from '@/modules/user-asset/dto';

import { PortfolioAssetEntity } from '../entities';

export class PortfolioAssetDto implements PortfolioAssetDtoShape {
  id: ID;

  userAsset: UserAssetDtoShape;

  createdAt: DateString;
  updatedAt: DateString;

  constructor(portfolioAsset: PortfolioAssetEntity) {
    this.id = portfolioAsset.id;

    this.userAsset = new UserAssetDto(portfolioAsset.userAsset);

    this.createdAt = portfolioAsset.createdAt.toISOString();
    this.updatedAt = portfolioAsset.updatedAt.toISOString();
  }
}
