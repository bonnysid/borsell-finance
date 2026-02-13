import {
  AssetDtoShape,
  CurrencyCode,
  ID,
  NumberString,
  TransactionDtoShape,
  TransactionType,
} from '@packages/types';

import { AssetDto } from '@/modules/asset/dto';

import { TransactionEntity } from '../entities';

export class TransactionDto implements TransactionDtoShape {
  id: ID;
  userAssetId: ID;
  asset?: AssetDtoShape;
  type: TransactionType;
  quantity: NumberString;
  amount: NumberString;
  price: NumberString;
  currencyCode: CurrencyCode;
  executedAt: string;
  createdAt: string;

  constructor(entity: TransactionEntity) {
    this.id = entity.id;
    this.userAssetId = entity.userAssetId;
    this.asset = entity.userAsset?.asset ? new AssetDto(entity.userAsset.asset) : undefined;
    this.type = entity.type;
    this.quantity = entity.quantity;
    this.amount = entity.amount;
    this.price = entity.price;
    this.currencyCode = entity.currencyCode;
    this.executedAt = entity.executedAt.toISOString();
    this.createdAt = entity.createdAt.toISOString();
  }
}
