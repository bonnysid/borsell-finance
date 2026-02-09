import { AssetDtoShape, CurrencyCode, ID, NumberString, UserAssetDtoShape } from '@packages/types';
import Big from 'big.js';

import { UserAssetEntity } from '../entities';
import { AssetDto } from './asset.dto';

export class UserAssetDto implements UserAssetDtoShape {
  id: ID;

  asset: AssetDtoShape;

  currencyCode: CurrencyCode;
  quantity: NumberString;
  avgBuyPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;
  unrealizedPnl: NumberString;

  note?: string;
  meta?: Record<string, any>;

  createdAt: string;
  updatedAt: string;

  constructor(userAsset: UserAssetEntity) {
    this.id = userAsset.id;

    this.asset = new AssetDto(userAsset.asset);
    this.currencyCode = userAsset.currencyCode;
    this.quantity = userAsset.quantity;
    this.avgBuyPrice = userAsset.avgBuyPrice;
    this.costBasis = userAsset.costBasis;
    this.totalInvested = userAsset.totalInvested;
    this.totalWithdrawn = userAsset.totalWithdrawn;
    this.realizedPnl = userAsset.realizedPnl;
    this.unrealizedPnl = new Big(this.asset.cachedMarketPrice)
      .minus(this.avgBuyPrice)
      .mul(this.quantity)
      .toFixed(8);

    this.note = userAsset.note;
    this.meta = userAsset.meta;

    this.currencyCode = userAsset.currencyCode;

    this.createdAt = userAsset.createdAt.toISOString();
    this.updatedAt = userAsset.updatedAt.toISOString();
  }
}
