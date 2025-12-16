import {
  AssetDtoShape,
  CurrencyCode,
  DateString,
  ID,
  NumberString,
  UserAssetDtoShape,
} from '@packages/types';

import { UserAssetEntity } from '../entities';
import { AssetDto } from './asset.dto';

export class UserAssetDto implements UserAssetDtoShape {
  id: ID;

  asset: AssetDtoShape;
  userId: ID;
  quantity: NumberString;
  buyPrice: NumberString;

  currencyCode: CurrencyCode;

  createdAt: DateString;
  updatedAt: DateString;

  constructor(userAsset: UserAssetEntity) {
    this.id = userAsset.id;

    this.asset = new AssetDto(userAsset.asset);
    this.userId = userAsset.user.id;
    this.quantity = userAsset.quantity;
    this.buyPrice = userAsset.buyPrice;

    this.currencyCode = userAsset.currencyCode;

    this.createdAt = userAsset.createdAt;
    this.updatedAt = userAsset.updatedAt;
  }
}
