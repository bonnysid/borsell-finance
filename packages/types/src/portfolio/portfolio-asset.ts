import { DateString, ID, UserAssetDtoShape } from '@packages/types';

export type PortfolioAssetDtoShape = {
  id: ID;

  portfolioId: ID;
  userAsset: UserAssetDtoShape;

  createdAt: DateString;
  updatedAt: DateString;
};
