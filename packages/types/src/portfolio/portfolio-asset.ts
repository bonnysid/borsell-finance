import { DateString, ID, UserAssetDtoShape } from '@packages/types';

export type PortfolioAssetDtoShape = {
  id: ID;

  userAsset: UserAssetDtoShape;

  createdAt: DateString;
  updatedAt: DateString;
};
